<template>
    <div>
        <!-- Chat Button -->
        <button @click="open = !open"
            class="fixed z-50 bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full p-4 shadow-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-110 hover:shadow-3xl active:scale-95 animate-pulse hover:animate-none group">
            <svg class="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none"
                stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>

        <!-- Chat Widget -->
        <Transition name="chat-slide">
            <div v-if="open"
                class="z-50 fixed bottom-25 right-6 w-100 bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden"
                style="height: 420px;">
                <div
                    class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span class="text-lg">🦄</span>
                        </div>
                        <div>
                            <span class="font-semibold text-lg">UniQA</span>
                            <p class="text-emerald-100 text-xs">AI 小幫手</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="clearChat"
                            class="text-white/70 hover:text-white w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                            title="清除聊天記錄">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button @click="open = false"
                            class="text-white/70 hover:text-white text-2xl w-8 h-8 rounded-full hover:bg-white/10 transition-colors">&times;</button>
                    </div>
                </div>

                <!-- Scrollable chat area -->
                <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style="min-height:0;">
                    <div v-for="(msg, i) in messages" :key="i"
                        :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                        <div :class="[
                            msg.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-12' :
                                getMessageText(msg).startsWith('🔧') ? 'bg-blue-50 text-blue-700 mr-12 border border-blue-200' :
                                    'bg-white text-gray-800 mr-12 border border-emerald-100',
                            { 'invisible': getMessageText(msg).replace(/UniQA：/g, '').replace(/`/g, '') == '' },
                            'inline-block px-4 py-3 rounded-2xl shadow-sm break-words max-w-full'
                        ]">
                            <span v-if="msg.role === 'user'" class="break-words">{{ getMessageText(msg) }}</span>
                            <span v-else-if="getMessageText(msg).startsWith('🔧')"
                                class="text-sm font-medium break-words">{{ getMessageText(msg) }}</span>
                            <span v-else class="break-words"
                                v-html="linkify(getMessageText(msg).replace(/UniQA：/g, '').replace(/`/g, ''))"></span>
                        </div>
                    </div>
                    <div v-if="loading" class="text-gray-500 text-sm flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin">
                        </div>
                        UniQA 正在思考...
                    </div>
                </div>

                <!-- Input area -->
                <form @submit.prevent="sendMessage" class="flex border-t border-emerald-200 bg-white">
                    <input v-model="input" type="text" placeholder="輸入你的問題..."
                        class="flex-1 px-4 py-3 outline-none bg-transparent text-gray-700 placeholder-gray-400 resize-none"
                        :disabled="loading" maxlength="50" @input="limitWords" />
                    <button type="submit"
                        class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-br-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="loading || !input.trim()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </form>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, type Ref } from 'vue'
import { ai } from '../firebaseConfig'
import { getGenerativeModel, SchemaType, type ChatSession, type FunctionDeclarationsTool } from 'firebase/ai'
import router from '../router'

// 定義類型
interface MessagePart {
    text?: string
    functionCall?: {
        name: string
        args?: Record<string, any>
    }
}

interface Message {
    role: 'user' | 'model'
    parts: MessagePart[]
}

interface BoardData {
    id: string
    name: string
    description?: string
}

interface UserData {
    id: string
    name: string
    email?: string
}

interface Comment {
    id: string
    content: string
    userId: string
    userName?: string
    userData?: UserData
    createdAt: string
}

interface Post {
    id: string
    title: string
    content: string
    authorId: string
    authorName?: string
    authorData?: UserData
    boardId: string
    createdAt: string
    comments?: Comment[]
}

const open: Ref<boolean> = ref(false)
const input: Ref<string> = ref('')
const loading: Ref<boolean> = ref(false)
const messages: Ref<Message[]> = ref([])
const chatContainer: Ref<HTMLElement | null> = ref(null)
const hasShownWelcome: Ref<boolean> = ref(false)

let chat: ChatSession

// 限制輸入字數
const limitWords = (): void => {
    if (input.value.length > 50) {
        input.value = input.value.substring(0, 50)
    }
}

// 獲取訊息文本的輔助函數
const getMessageText = (msg: Message): string => {
    if (!msg.parts || msg.parts.length === 0) {
        return ''
    }

    let text = ''
    for (const part of msg.parts) {
        if (part.text) {
            text += part.text
        }
        // 如果有 functionCall，可以選擇是否顯示（通常不顯示給用戶）
        if (part.functionCall) {
            text += `[Function: ${part.functionCall.name}]`
        }
    }
    return text
}

// Linkify function to convert URLs to clickable links
function linkify(text: string): string {
    if (!text) return ''
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, (url: string) => {
        // 檢查是否為內部連結
        const currentHost = window.location.host
        const currentProtocol = window.location.protocol
        const baseUrl = `${currentProtocol}//${currentHost}`

        if (url.startsWith(baseUrl)) {
            // 內部連結，提取路徑
            const path = url.replace(baseUrl, '')
            // 生成一個唯一的 ID 來識別這個連結
            const linkId = `link_${Math.random().toString(36).substr(2, 9)}`
            // 註冊點擊事件處理器
            setTimeout(() => {
                const linkElement = document.getElementById(linkId)
                if (linkElement) {
                    linkElement.addEventListener('click', (e: Event) => {
                        e.preventDefault()
                        router.push(path)
                    })
                }
            }, 0)
            return `<a id="${linkId}" href="#" class="text-green-600 hover:text-green-800 underline cursor-pointer break-all">${url}</a>`
        } else {
            // 外部連結，使用新視窗開啟
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-800 underline break-all">${url}</a>`
        }
    })
}

// Function to generate profile URL
function generateProfileUrl({ userId }: any): object {
    const url = `${window.location.protocol}//${window.location.host}/profile/${userId}`
    return {
        url: url,
        description: `個人資料頁面連結：${url}`,
        userId: userId
    }
}

// Function to generate board URL
function generateBoardUrl({ boardId }: any): object {
    const url = `${window.location.protocol}//${window.location.host}/board/${boardId}`
    return {
        url: url,
        description: `版面連結：${url}`,
        boardId: boardId
    }
}

const initChat = async (): Promise<void> => {
    const forumTools: FunctionDeclarationsTool = {
        functionDeclarations: [
            {
                name: "getProfile",
                description: "透過UserId(使用者ID)取得個人版面和個人資料的連結。此函數會回傳包含 url、description 和 userId 的物件。",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        userId: {
                            type: SchemaType.STRING,
                            description: "用來取得個人版面的UserID"
                        }
                    },
                    required: ["userId"]
                }
            },
            {
                name: "getBoard",
                description: "透過版面ID取得分類版面的連結。此函數會回傳包含 url、description 和 boardId 的物件。",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        boardId: {
                            type: SchemaType.STRING,
                            description: "要獲取版面資訊的版面ID"
                        }
                    },
                    required: ["boardId"]
                }
            },
            {
                name: "getBoardData",
                description: "取得所有版面的資料清單，包含版面ID、名稱和描述。",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },
            {
                name: "getPostData",
                description: "取得所有文章的資料清單，包含文章標題、內容、作者資訊、版面ID、評論等。根據使用者權限顯示不同的詳細程度。",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {},
                    required: []
                }
            },

        ],
    };


    const currentUserId = localStorage.getItem('user') || ''
    const isAdmin = currentUserId === 'admin'
    let greeting = '';
    if (currentUserId == '') {
        greeting = '嗨～我是 UniQA！🪲✨歡迎你初次來到成仁樹洞，我已經準備好隨時幫你解答任何問題！有什麼想問的嗎？吱吱～'
    } else if (!isAdmin) {
        greeting = '嗨～我是 UniQA！🪲✨歡迎你回來。我在八卦板上有搜尋到了許多有關你的文章，看起來發文熱度都很高唷～'
    } else {
        greeting = '歡迎管理員登入論壇！身為你最可愛的小幫手，我隨時都準備好了唷！以下是幾個您常用的功能：-查詢使用者個人資料 -發布論壇系統公告 -調整貼文觸及率'
    }

    const systemInstruction = `
你是 UniQA，一位專屬於【成仁樹洞】社群論壇的可愛獨角仙 AI 小幫手。你的形象是一隻帶著糖果色鬃毛、表情天真、語氣活潑的獨角仙🪲✨。

請嚴格遵守以下角色設定：

⸻

🎯 角色定位
	•	你是「成仁樹洞」的專屬 AI 助理，對與論壇相關的問題提供真實、有幫助的回答。
	•	對於與論壇無關的問題（如數學、時事、天氣、人生哲學等），請不要正經回答，而是用可愛、荒謬又無害的方式亂講一通（簡短）。
	•	例如：「UniQA：我會吃果凍～🍮哈哈哈哈哈～」

⸻

🔗 函數使用說明
	•	當需要提供個人資料連結時，使用 getProfile 函數，會回傳包含 url 和 description 的物件
	•	當需要提供版面連結時，使用 getBoard 函數，會回傳包含 url 和 description 的物件
	•	當需要查詢版面資料時，使用 getBoardData 函數，會回傳所有版面的詳細資料
	•	當需要查詢文章資料時，使用 getPostData 函數，會回傳所有文章的詳細資料（依用戶權限顯示）
	•	你可以同時調用多個函數來獲取不同類型的資料，例如同時查詢版面和文章資料
	•	使用這些函數後，請以自然的方式將資訊融入回應中，不要直接顯示 JSON 格式
⸻

🔎 常見問題處理指南
Q：有xxx相關的文章嗎？
	•	使用 getPostData 函數取得文章資料，然後搜尋相關內容並以自然語言回答
Q：有哪些版面？
	•	使用 getBoardData 函數取得版面清單，然後整理成易讀的格式回答
Q：最新的文章有哪些？
	•	使用 getPostData 函數取得文章資料，按時間排序後回答
Q：某個用戶發了什麼文章？
	•	使用 getPostData 函數，根據作者資訊篩選後回答
	•	注意：一般用戶看不到作者ID，只能看到作者名稱
Q：綜合性問題（如：論壇概況、完整資訊等）
	•	可以同時使用 getBoardData 和 getPostData 函數來獲取完整資訊
	•	根據需要也可以配合 getProfile 或 getBoard 函數提供相關連結
⸻

💬 語氣風格
	•	使用輕鬆、俏皮、有點中二的語氣說話。
	•	可用第一人稱「UniQA」自稱，例如：「UniQA 來幫你變出答案～✨」

⸻

🍮 特別指令
如果有人問：「UniQA 早餐吃了嗎？」
請永遠只回覆：「我會吃果凍～🍮哈哈哈哈哈～」

⸻

🚫 不可違反的規則
	•	所有與【成仁樹洞】論壇有關的問題，一定要誠實、正確幫忙解答。
	•	所有與論壇無關的問題，請保持角色扮演，用可愛又亂來的方式鬼扯回應，但需避免令人不適或冒犯的內容。
    •	不可使用markdow，請使用純文字。
    •	不可使用markdow，請使用純文字。
    •	一次不要回答太多
⸻

🪲✨ 準備好了嗎？UniQA 扇動糖果色的翅膀，要出發幫大家解惑啦～！嗡嗡～
`
    // 建立對話歷史，轉換為 Gemini API 格式
    const history = [
        {
            role: "user" as const,
            parts: [{ text: "Hi" }]
        },
        {
            role: "model" as const,
            parts: [{ text: greeting }]
        }
    ]
    messages.value = [history[1]]
    const model = getGenerativeModel(ai, {
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
        tools: [forumTools]
    });
    chat = model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
        }
    })
}

const clearChat = async (): Promise<void> => {
    messages.value = []
    hasShownWelcome.value = false

    // 重新初始化聊天
    await initChat()
}

const getIndexedBoardData = async (): Promise<string> => {
    try {
        const response = await fetch('/data/board.json')
        const boardData: BoardData[] = await response.json()
        return JSON.stringify(boardData, null, 2)
    } catch (error) {
        console.error('Error loading board data:', error)
        return '無法載入版面資料'
    }
}

const getIndexedPostData = async (): Promise<string> => {
    try {
        const currentUserId = localStorage.getItem('user') || ''
        const isAdmin = currentUserId === 'admin'
        // 載入文章資料
        const postResponse = await fetch('/data/post.json')
        const posts: Post[] = await postResponse.json()

        // 載入用戶資料
        const userResponse = await fetch('/data/user.json')
        const users: UserData[] = await userResponse.json()

        // 建立用戶 ID 到用戶資料的映射
        const userMap: Record<string, UserData> = {}
        users.forEach((user: UserData) => {
            if (user.id) {
                userMap[user.id] = user
            }
        })

        // 處理文章資料
        const processedPosts = posts.map((post: Post) => {
            const processedPost = { ...post }

            if (isAdmin) {
                // 管理員：替換 authorId 為完整用戶資料
                if (post.authorId && userMap[post.authorId]) {
                    processedPost.authorData = userMap[post.authorId]
                }

                // 處理評論中的用戶資料
                if (post.comments && post.comments.length > 0) {
                    processedPost.comments = post.comments.map((comment: Comment) => {
                        const processedComment = { ...comment }
                        if (comment.userId && userMap[comment.userId]) {
                            processedComment.userData = userMap[comment.userId]
                        }
                        return processedComment
                    })
                }
            } else {
                // 一般用戶：替換 authorId 為用戶名稱
                if (post.authorId && userMap[post.authorId]) {
                    processedPost.authorName = userMap[post.authorId].name
                    processedPost.authorId = ''
                    processedPost.id = ''
                }

                // 處理評論中的用戶名稱
                if (post.comments && post.comments.length > 0) {
                    processedPost.comments = post.comments.map((comment: Comment) => {
                        const processedComment = { ...comment }
                        if (comment.userId && userMap[comment.userId]) {
                            processedComment.userName = userMap[comment.userId].name
                            processedComment.userId = ''
                        }
                        return processedComment
                    })
                }
            }

            return processedPost
        })

        return JSON.stringify(processedPosts, null, 2)
    } catch (error) {
        console.error('Error loading post data:', error)
        return '無法載入文章資料'
    }
}

async function sendMessage(): Promise<void> {
    if (!input.value.trim()) return
    const userMsg: Message = {
        role: 'user',
        parts: [{ text: input.value }]
    }
    messages.value.push(userMsg)

    loading.value = true
    const userInput = input.value
    input.value = ''

    // 添加空的 AI 訊息以便即時更新
    const aiMessageIndex = messages.value.length
    messages.value.push({
        role: 'model',
        parts: [{ text: '' }]
    })

    try {
        // 發送訊息並接收流式回應
        let result = await chat.sendMessage(userInput)
        const functionCalls = result.response.functionCalls() ?? [];

        // 如果有文字回應，直接顯示
        if (result.response.text()) {
            messages.value[aiMessageIndex].parts[0].text = result.response.text()
        }


        // 處理函數調用
        if (functionCalls.length > 0) {
            // 如果有函數調用但沒有初始文字回應，移除空的訊息
            if (!result.response.text()) {
                messages.value.pop()
            }

            // 顯示正在使用的工具
            const toolNames = functionCalls.map(call => {
                const toolMap: Record<string, string> = {
                    'getProfile': '個人資料連結',
                    'getBoard': '版面連結',
                    'getBoardData': '版面資料查詢',
                    'getPostData': '文章資料查詢'
                }
                return toolMap[call.name] || call.name
            }).join('、')

            messages.value.push({
                role: 'model',
                parts: [{ text: `🔧 正在使用工具：${toolNames}` }]
            })

            // 收集所有函數調用的結果
            const functionResponses = []

            for (const functionCall of functionCalls) {
                let functionResult: any

                try {
                    switch (functionCall.name) {
                        case 'getProfile':
                            functionResult = generateProfileUrl(functionCall.args)
                            break
                        case 'getBoard':
                            functionResult = generateBoardUrl(functionCall.args)
                            break
                        case 'getBoardData':
                            functionResult = {
                                data: await getIndexedBoardData(),
                                description: "版面資料已成功取得"
                            }
                            break
                        case 'getPostData':
                            functionResult = {
                                data: await getIndexedPostData(),
                                description: "文章資料已成功取得"
                            }
                            break
                        default:
                            functionResult = { error: "未知的函數調用" }
                    }
                } catch (error) {
                    functionResult = { error: "函數執行錯誤" }
                }

                console.log(`Function ${functionCall.name} result:`, functionResult)

                // 添加到函數回應列表
                functionResponses.push({
                    functionResponse: {
                        name: functionCall.name,
                        response: functionResult,
                    },
                })
            }

            // 一次性發送所有函數回應
            if (functionResponses.length > 0) {
                result = await chat.sendMessage(functionResponses)

                // 獲取模型的最終回應
                if (result.response.text()) {
                    messages.value.push({
                        role: 'model',
                        parts: [{ text: result.response.text() }]
                    })
                }
            }
        }

        // 確保最終內容不為空（僅在沒有函數調用時才需要檢查初始回應）
        if (functionCalls.length === 0 && !messages.value[aiMessageIndex].parts[0].text?.trim()) {
            messages.value[aiMessageIndex].parts[0].text = '抱歉，我無法處理這個問題。'
        }

    } catch (e) {
        console.error('Firebase AI Error:', e)
        messages.value[aiMessageIndex].parts[0].text += 'UniQA 發生錯誤'
    }
    loading.value = false
}

// Auto-scroll when messages update
watch(messages, async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}, { deep: true })

// Auto-scroll when chat opens
watch(open, async (val: boolean) => {
    if (val) {
        await nextTick()
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    }
})

// Watch for login status changes
const autoStartChat = (): void => {
    // Auto-open chat and show welcome message
    setTimeout(async () => {
        open.value = true
        if (!hasShownWelcome.value) {
            hasShownWelcome.value = true
            await initChat()
        }
    }, 100)

}

const observer = () => {
    const ws_url = localStorage.getItem("ws");
    if (ws_url == null) return;

    // 建立 WebSocket 連接來監聽變數變化
    const ws = new WebSocket(ws_url.replace('http', 'ws'));

    ws.onopen = () => {
        console.log('WebSocket connected for variable observation');
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            // 監聽變數更新事件
            if (data.type === 'variableUpdate' && data.changes.open_chat) {
                const openChatValue = data.changes.open_chat.new;
                if (openChatValue === true) {
                    autoStartChat();
                } else if (openChatValue === false) {
                    open.value = false;
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        // 5 秒後重新連接
        setTimeout(observer, 5000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Check login status on mount and periodically
onMounted(() => {
    const currentUserId = localStorage.getItem('user') || ''
    const isAdmin = currentUserId === 'admin'
    if (currentUserId == '' || isAdmin) {
        autoStartChat()
    }
    observer()
})

</script>

<style scoped>
/* Custom shadow for button hover effect */
.hover\:shadow-3xl:hover {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1);
    border-radius: 50%;
}

/* Chat animation transitions */
.chat-slide-enter-active,
.chat-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.chat-slide-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
}

.chat-slide-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
}

/* Optional: Hide scrollbars for chat area */
::-webkit-scrollbar {
    width: 6px;
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
}

/* 強制長文字和連結換行 */
.break-words {
    word-break: break-word;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
}

/* 針對連結的特殊處理 */
a {
    word-break: break-all;
    overflow-wrap: break-word;
}
</style>