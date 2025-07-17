import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { networkInterfaces } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 獲取本機內網 IP
function getLocalIP() {
    const interfaces = networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            // 跳過內部（非虛擬）和外部地址
            if (net.family === 'IPv4' && !net.internal && net.address.startsWith('192.168.')) {
                return net.address;
            }
        }
    }
    return '192.168.x.x';
}

// WebSocket 變數表
const variableTable = {
    open_chat: true // 默認變數
};

// 存儲連接的客戶端
const clients = new Map();

// 創建 HTTP 伺服器
const server = createServer((req, res) => {
    const url = req.url;

    // 設置 CORS 頭部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (url === '/' || url === '/index.html') {
        // 提供控制面板頁面
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(getControlPanelHTML());
    } else if (url === '/api/variables' && req.method === 'GET') {
        // 獲取變數表
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(variableTable));
    } else if (url === '/api/variables' && req.method === 'POST') {
        // 更新變數表
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const updates = JSON.parse(body);
                updateVariables(updates);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, variables: variableTable }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        // 404 頁面
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// 創建 WebSocket 伺服器
const wss = new WebSocketServer({ server });

// 生成唯一 ID
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 廣播訊息給所有連接的客戶端
function broadcastToAll(message, excludeClientId = null) {
    clients.forEach((client, clientId) => {
        if (clientId !== excludeClientId && client.ws.readyState === 1) {
            client.ws.send(JSON.stringify(message));
        }
    });
}

// 發送訊息給特定客戶端
function sendToClient(clientId, message) {
    const client = clients.get(clientId);
    if (client && client.ws.readyState === 1) {
        client.ws.send(JSON.stringify(message));
    }
}

// 更新變數並廣播變更
function updateVariables(updates) {
    const oldValues = { ...variableTable };
    const changes = {};

    for (const [key, value] of Object.entries(updates)) {
        if (variableTable.hasOwnProperty(key)) {
            if (variableTable[key] !== value) {
                changes[key] = {
                    old: variableTable[key],
                    new: value
                };
                variableTable[key] = value;
            }
        }
    }

    if (Object.keys(changes).length > 0) {
        console.log('變數已更新:', changes);

        // 廣播變數變更給所有 WebSocket 客戶端
        broadcastToAll({
            type: 'variableUpdate',
            changes: changes,
            variables: variableTable,
            timestamp: Date.now()
        });
    }
}

// 處理 WebSocket 連接
wss.on('connection', (ws, request) => {
    const clientId = generateId();
    const clientInfo = {
        id: clientId,
        ws: ws,
        connectedAt: Date.now(),
        lastActivity: Date.now()
    };

    clients.set(clientId, clientInfo);
    console.log(`WebSocket 客戶端 ${clientId} 已連接`);

    // 發送連接成功訊息和當前變數表
    ws.send(JSON.stringify({
        type: 'connection',
        clientId: clientId,
        variables: variableTable,
        message: 'WebSocket 連接成功'
    }));

    // 處理接收到的訊息
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleWebSocketMessage(clientId, message);
        } catch (error) {
            console.error('解析 WebSocket 訊息錯誤:', error);
            sendToClient(clientId, {
                type: 'error',
                message: '訊息格式錯誤'
            });
        }
    });

    // 處理斷線
    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`WebSocket 客戶端 ${clientId} 已斷開連接`);
    });

    // 處理錯誤
    ws.on('error', (error) => {
        console.error(`WebSocket 客戶端 ${clientId} 錯誤:`, error);
        clients.delete(clientId);
    });
});

// 處理 WebSocket 訊息
function handleWebSocketMessage(clientId, message) {
    const client = clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    switch (message.type) {
        case 'getVariables':
            sendToClient(clientId, {
                type: 'variables',
                variables: variableTable
            });
            break;

        case 'updateVariable':
            if (message.key && message.value !== undefined) {
                const updates = { [message.key]: message.value };
                updateVariables(updates);
            }
            break;

        case 'ping':
            sendToClient(clientId, {
                type: 'pong',
                timestamp: Date.now()
            });
            break;

        case 'chat':
            // 檢查 open_chat 變數
            if (!variableTable.open_chat) {
                sendToClient(clientId, {
                    type: 'error',
                    message: '聊天功能目前已關閉'
                });
                return;
            }

            // 處理聊天訊息
            const chatMessage = {
                type: 'chat',
                clientId: clientId,
                message: message.message,
                timestamp: Date.now()
            };

            broadcastToAll(chatMessage);
            break;

        default:
            sendToClient(clientId, {
                type: 'error',
                message: '未知的訊息類型'
            });
    }
}

// 獲取控制面板 HTML
function getControlPanelHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebSocket 變數控制面板</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .main-content {
            padding: 40px;
        }
        
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        
        .panel {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            border: 1px solid #e9ecef;
        }
        
        .panel h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-bottom: 2px solid #4facfe;
            padding-bottom: 10px;
        }
        
        .variable-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            margin-bottom: 15px;
            border: 1px solid #dee2e6;
            transition: all 0.3s ease;
        }
        
        .variable-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .variable-name {
            font-weight: 600;
            color: #333;
        }
        
        .variable-value {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .toggle-switch {
            position: relative;
            width: 60px;
            height: 30px;
            background: #ccc;
            border-radius: 15px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .toggle-switch.active {
            background: #4facfe;
        }
        
        .toggle-switch::after {
            content: '';
            position: absolute;
            width: 26px;
            height: 26px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
        }
        
        .toggle-switch.active::after {
            transform: translateX(30px);
        }
        
        .input-field {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            width: 100px;
        }
        
        .btn {
            padding: 10px 20px;
            background: #4facfe;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #3d8bfd;
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-connected {
            background: #28a745;
        }
        
        .status-disconnected {
            background: #dc3545;
        }
        
        .log-container {
            background: #1e1e1e;
            color: #fff;
            padding: 20px;
            border-radius: 10px;
            height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .log-entry {
            margin-bottom: 5px;
            padding: 2px 0;
        }
        
        .log-timestamp {
            color: #888;
            margin-right: 10px;
        }
        
        .log-info {
            color: #4facfe;
        }
        
        .log-warning {
            color: #ffc107;
        }
        
        .log-error {
            color: #dc3545;
        }
        
        .connection-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            flex: 1;
            margin: 0 5px;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #4facfe;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            
            .connection-stats {
                flex-direction: column;
            }
            
            .stat-item {
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WebSocket 變數控制面板</h1>
            <p>即時監控和控制 WebSocket 伺服器變數</p>
        </div>
        
        <div class="main-content">
            <div class="grid">
                <div class="panel">
                    <h2>變數控制</h2>
                    <div id="variableList">
                        <!-- 變數列表將在這裡動態生成 -->
                    </div>
                </div>
                
                <div class="panel">
                    <h2>連接狀態</h2>
                    <div class="connection-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="connectionCount">0</div>
                            <div class="stat-label">連接數</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="wsStatus">
                                <span class="status-indicator status-disconnected"></span>
                                離線
                            </div>
                            <div class="stat-label">WebSocket 狀態</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="panel">
                <h2>系統日誌</h2>
                <div class="log-container" id="logContainer">
                    <div class="log-entry">
                        <span class="log-timestamp">[${new Date().toLocaleTimeString()}]</span>
                        <span class="log-info">系統初始化完成</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let ws = null;
        let variables = {};
        let connectionCount = 0;
        
        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadVariables();
            initWebSocket();
            setInterval(updateConnectionStats, 1000);
        });
        
        // 加載變數
        async function loadVariables() {
            try {
                const response = await fetch('/api/variables');
                variables = await response.json();
                renderVariables();
            } catch (error) {
                logMessage('無法加載變數: ' + error.message, 'error');
            }
        }
        
        // 渲染變數列表
        function renderVariables() {
            const container = document.getElementById('variableList');
            container.innerHTML = '';
            
            for (const [key, value] of Object.entries(variables)) {
                const item = document.createElement('div');
                item.className = 'variable-item';
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'variable-name';
                nameDiv.textContent = key;
                
                const valueDiv = document.createElement('div');
                valueDiv.className = 'variable-value';
                
                if (typeof value === 'boolean') {
                    const toggle = document.createElement('div');
                    toggle.className = 'toggle-switch' + (value ? ' active' : '');
                    toggle.onclick = () => updateVariable(key, !value);
                    valueDiv.appendChild(toggle);
                } else {
                    const input = document.createElement('input');
                    input.className = 'input-field';
                    input.type = typeof value === 'number' ? 'number' : 'text';
                    input.value = value;
                    input.onchange = () => {
                        const newValue = input.type === 'number' ? parseFloat(input.value) : input.value;
                        updateVariable(key, newValue);
                    };
                    valueDiv.appendChild(input);
                }
                
                item.appendChild(nameDiv);
                item.appendChild(valueDiv);
                container.appendChild(item);
            }
        }
        
        // 更新變數
        async function updateVariable(key, value) {
            try {
                const response = await fetch('/api/variables', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ [key]: value })
                });
                
                const result = await response.json();
                if (result.success) {
                    variables = result.variables;
                    renderVariables();
                    logMessage(\`變數更新: \${key} = \${value}\`, 'info');
                }
            } catch (error) {
                logMessage('更新變數失敗: ' + error.message, 'error');
            }
        }
        
        // 初始化 WebSocket
        function initWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = \`\${protocol}//\${window.location.host}\`;
            
            console.log('正在連接到 WebSocket:', wsUrl);
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                logMessage('WebSocket 連接已建立', 'info');
                updateWSStatus(true);
            };
            
            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    logMessage('解析 WebSocket 訊息失敗: ' + error.message, 'error');
                }
            };
            
            ws.onclose = function() {
                logMessage('WebSocket 連接已關閉', 'warning');
                updateWSStatus(false);
                // 3秒後重新連接
                setTimeout(initWebSocket, 3000);
            };
            
            ws.onerror = function(error) {
                logMessage('WebSocket 錯誤: ' + error.message, 'error');
                updateWSStatus(false);
            };
        }
        
        // 處理 WebSocket 訊息
        function handleWebSocketMessage(data) {
            switch (data.type) {
                case 'connection':
                    logMessage(\`客戶端連接: \${data.clientId}\`, 'info');
                    connectionCount++;
                    break;
                    
                case 'variableUpdate':
                    logMessage('變數已更新: ' + JSON.stringify(data.changes), 'info');
                    variables = data.variables;
                    renderVariables();
                    break;
                    
                case 'error':
                    logMessage('伺服器錯誤: ' + data.message, 'error');
                    break;
                    
                default:
                    logMessage('收到訊息: ' + JSON.stringify(data), 'info');
            }
        }
        
        // 更新 WebSocket 狀態
        function updateWSStatus(connected) {
            const statusElement = document.getElementById('wsStatus');
            if (connected) {
                statusElement.innerHTML = '<span class="status-indicator status-connected"></span>在線';
            } else {
                statusElement.innerHTML = '<span class="status-indicator status-disconnected"></span>離線';
            }
        }
        
        // 更新連接統計
        function updateConnectionStats() {
            document.getElementById('connectionCount').textContent = connectionCount;
        }
        
        // 記錄日誌
        function logMessage(message, type = 'info') {
            const container = document.getElementById('logContainer');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            
            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';
            timestamp.textContent = '[' + new Date().toLocaleTimeString() + ']';
            
            const content = document.createElement('span');
            content.className = 'log-' + type;
            content.textContent = message;
            
            entry.appendChild(timestamp);
            entry.appendChild(content);
            container.appendChild(entry);
            
            // 自動滾動到底部
            container.scrollTop = container.scrollHeight;
            
            // 限制日誌條目數量
            const entries = container.querySelectorAll('.log-entry');
            if (entries.length > 100) {
                entries[0].remove();
            }
        }
    </script>
</body>
</html>
  `;
}

// 定期清理不活躍的連接
setInterval(() => {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5分鐘超時

    clients.forEach((client, clientId) => {
        if (now - client.lastActivity > timeout) {
            console.log(`清理不活躍的客戶端: ${clientId}`);
            client.ws.terminate();
            clients.delete(clientId);
        }
    });
}, 60000); // 每分鐘檢查一次

// 啟動伺服器
const PORT = process.env.PORT || 5243;
const HOST = process.env.HOST || '0.0.0.0';
const LOCAL_IP = getLocalIP();

server.listen(PORT, HOST, () => {
    console.log(`WebSocket 伺服器已啟動在 ${HOST}:${PORT}`);
    console.log(`本機訪問: http://localhost:${PORT}`);
    console.log(`內網訪問: http://${LOCAL_IP}:${PORT}`);
    console.log(`WebSocket 端點:`);
    console.log(`  本機: ws://localhost:${PORT}`);
    console.log(`  內網: ws://${LOCAL_IP}:${PORT}`);
    console.log('當前變數表:', variableTable);
    console.log('伺服器啟動完成');
    console.log('請開啟開發人員工具 > console 貼上以下命令以連接 WebSocket:');
    console.log(`localStorage.setItem("ws","ws://${LOCAL_IP}:${PORT}")`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n正在關閉伺服器...');

    // 通知所有客戶端伺服器即將關閉
    clients.forEach((client, clientId) => {
        if (client.ws.readyState === 1) {
            client.ws.send(JSON.stringify({
                type: 'serverShutdown',
                message: '伺服器即將關閉'
            }));
        }
    });

    // 關閉所有連接
    wss.close(() => {
        server.close(() => {
            console.log('伺服器已關閉');
            process.exit(0);
        });
    });
});

// 錯誤處理
process.on('uncaughtException', (error) => {
    console.error('未捕獲的異常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未處理的 Promise 拒絕:', reason);
});
