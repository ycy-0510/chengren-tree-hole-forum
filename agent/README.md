# 成仁樹洞論壇 - 圖片上傳管理工具

這是一個使用 FastAPI 建立的網頁工具，用於管理論壇貼文的圖片上傳。

## 功能特色

- 📸 **圖片上傳**：支援拖拽或點擊上傳圖片
- 🔧 **自動處理**：自動調整圖片大小、壓縮和格式轉換
- 🗂️ **智能命名**：根據貼文 ID 自動重新命名圖片
- 📝 **資料同步**：自動更新 post.json 文件
- 🗑️ **圖片刪除**：可以刪除已上傳的圖片
- 🎨 **美觀界面**：使用 Tailwind CSS 建立現代化界面

## 系統需求

- Python 3.8+
- 虛擬環境 (已包含)

### 如何安裝
請前往 https://python.org/downloads/ 下載並安裝 Python 3.8 或更高版本。

## 安裝和使用

### 1. 環境設置

```bash
cd agent
```
確保切換到 `agent` 目錄，然後建立虛擬環境並安裝依賴：

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. 啟動服務

```bash
uvicorn main:app --reload
```

### 3. 訪問網站

開啟瀏覽器並訪問：`http://localhost:8000`

## 使用說明

### 主頁面
- 顯示所有貼文的卡片列表
- 每個卡片顯示貼文標題、內容、作者等資訊
- 點擊「管理圖片」按鈕進入圖片管理頁面

### 圖片管理頁面
- 顯示貼文的詳細資訊
- 如果已有圖片，會顯示現有圖片和刪除按鈕
- 拖拽或點擊上傳區域可以上傳新圖片
- 上傳後會自動重新載入頁面顯示新圖片

## API 端點

### 網頁端點
- `GET /` - 主頁面
- `GET /post/{post_id}` - 貼文詳細頁面

### API 端點
- `GET /api/posts` - 獲取所有貼文
- `GET /api/posts/{post_id}` - 獲取特定貼文
- `POST /upload/{post_id}` - 上傳圖片
- `DELETE /image/{post_id}` - 刪除圖片

## 圖片處理

- **支援格式**：JPG、PNG、GIF
- **自動調整**：最大寬度 800px，保持比例
- **壓縮優化**：品質設定 85%，啟用優化
- **命名規則**：`{post_id}.{extension}`
- **儲存位置**：`public/assets/images/`

## 檔案結構

```
agent/
├── main.py              # 主程式
├── requirements.txt     # Python 套件清單
├── start.sh            # 啟動腳本
├── README.md           # 說明文件
├── venv/               # 虛擬環境
└── templates/          # HTML 模板
    ├── index.html      # 主頁面模板
    └── post_detail.html # 貼文詳細頁面模板
```

## 注意事項

1. **權限**：確保程式對 `public/assets/images/` 目錄有讀寫權限
2. **備份**：上傳圖片前建議備份原始的 `post.json` 文件
3. **容量**：圖片會自動壓縮，但建議避免上傳過大的文件
4. **安全性**：此工具僅供開發和測試使用，生產環境請加強安全措施

## 疑難排解


### 圖片上傳失敗
- 檢查圖片格式是否支援
- 確認目錄權限
- 查看終端錯誤訊息

### 無法訪問網站
- 確認服務是否正常啟動
- 檢查防火牆設置
- 嘗試使用 `127.0.0.1:8000` 替代 `localhost:8000`
