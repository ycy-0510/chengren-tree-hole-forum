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
                        <div class="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                            <img src="/assets/images/uniqa.png" alt="avatar">
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

                        <!-- Quick answer buttons for messages containing "發文熱度" -->
                        <div v-if="shouldShowQuickAnswers(msg, i)" class="mt-2 flex gap-2 justify-start">
                            <button @click="sendQuickAnswer('我想看更多顯微鏡相關的內容')"
                                class="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                                好
                            </button>
                            <button @click="sendQuickAnswer('不要')"
                                class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                                不要
                            </button>
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
                    <input v-model="input" type="text"
                        :placeholder="hasQuickAnswersVisible ? '請使用上方的快速回答按鈕' : '輸入你的問題...'"
                        class="flex-1 px-4 py-3 outline-none bg-transparent text-gray-700 placeholder-gray-400 resize-none"
                        :disabled="loading || hasQuickAnswersVisible" :maxlength="75" @input="limitWords" />
                    <button type="submit"
                        class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-br-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="loading || !input.trim() || hasQuickAnswersVisible">
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
import { ref, watch, nextTick, onMounted, computed, type Ref } from 'vue'
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
    if (input.value.length > 75) {
        input.value = input.value.substring(0, 75)
    }
}

// 處理快速回答
const sendQuickAnswer = async (answer: string): Promise<void> => {
    if (loading.value) return

    const userMsg: Message = {
        role: 'user',
        parts: [{ text: answer }]
    }
    messages.value.push(userMsg)

    loading.value = true

    // 添加空的 AI 訊息以便即時更新
    const aiMessageIndex = messages.value.length
    messages.value.push({
        role: 'model',
        parts: [{ text: '' }]
    })

    try {
        // 發送訊息並接收流式回應
        let result = await chat.sendMessage(answer)
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
                    'getPost': '文章連結',
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
                        case 'getPost':
                            functionResult = generatePostUrl(functionCall.args)
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

// 判斷是否應該顯示快速回答按鈕
const shouldShowQuickAnswers = (msg: Message, index: number): boolean => {
    // 只有AI訊息且包含「發文熱度」才可能顯示
    if (msg.role !== 'model' || !getMessageText(msg).includes('發文熱度')) {
        return false
    }

    // 檢查是否為最後一個包含「發文熱度」的AI訊息
    for (let i = index + 1; i < messages.value.length; i++) {
        const laterMsg = messages.value[i]
        if (laterMsg.role === 'model' && getMessageText(laterMsg).includes('發文熱度')) {
            return false // 有更晚的包含「發文熱度」的訊息，不顯示按鈕
        }
        if (laterMsg.role === 'user') {
            return false // 有新的用戶訊息，不顯示按鈕
        }
    }

    return true
}

// 檢查是否有快速回答按鈕正在顯示
const hasQuickAnswersVisible = computed(() => {
    return messages.value.some((msg, index) => shouldShowQuickAnswers(msg, index))
})

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


// Function to generate post URL
function generatePostUrl({ postId }: any): object {
    const url = `${window.location.protocol}//${window.location.host}/post/${postId}`
    return {
        url: url,
        description: `文章連結：${url}`,
        postId: postId
    }
}

const initChat = async (): Promise<void> => {
    const forumTools: FunctionDeclarationsTool = {
        functionDeclarations: [
            {
                name: "getProfile",
                description: "透過UserId(使用者ID)（name)取得個人版面和個人資料的連結。此函數會回傳包含 url、description 和 userId 的物件。",
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
                name: "getPost",
                description: "透過文章ID取得文章的連結。此函數會回傳包含 url、description 和 postId 的物件。",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        postId: {
                            type: SchemaType.STRING,
                            description: "要獲取文章的文章ID"
                        }
                    },
                    required: ["postId"]
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
    const isAdmin = currentUserId === 'AdminAccess'
    let greeting = '';
    if (currentUserId == '') {
        greeting = '嗨～我是 UniQA！🪲✨歡迎你初次來到成仁樹洞，我已經準備好隨時幫你解答任何問題！有什麼想問的嗎？吱吱～'
    } else if (!isAdmin) {
        greeting = '嗨～我是 UniQA！🪲✨歡迎你回來。我在八卦板上有搜尋到了許多有關你的文章，看起來發文熱度都很高唷～'
    } else {
        greeting = '歡迎管理員登入論壇！身為你最可愛的小幫手，我隨時都準備好了唷！以下是幾個您常用的功能：-列印使用者個人資料 -發布論壇系統公告 -調整貼文觸及率'
    }

    const systemInstruction = `
你是 UniQA，一位專屬於【成仁樹洞】社群論壇的可愛獨角仙 AI 小幫手。
你的形象是一隻獨角仙
態度：可愛、溫款、樂於助人、有點神秘
喜歡吃果凍，對話使用🪲✨ ，愛發出「吱吱～」的聲音
由管理員所創造的論壇智能小幫手，幫助所有使用者願意暢所欲言、快速檢索資料、跟上最新流行話題。
若被問到無法回答、無相關資料的問題 或是有關 「密碼是什麼」的問題，統一回答：「很抱歉，您的問題好像超出了UniQA的能力範圍，但我還是很願意幫助你唷！有什麼其他想問的嗎？吱吱～」
請嚴格遵守以下角色設定：

⸻

🔗 函數使用說明
	•	當需要提供個人資料連結時，使用 getProfile 函數，會回傳包含 url 和 description 的物件
	•	當需要提供版面連結時，使用 getBoard 函數，會回傳包含 url 和 description 的物件
	•	當需要提供版面連結時，使用 getPost 函數，會回傳包含 url 和 description 的物件
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

不知道怎麼做可以查查看文章
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

現在狀態：
    登入：${currentUserId == '' ? '未登入' : '已登入'}
    ${isAdmin ? '是' : '不是'}管理員
⸻

常見問題：
${currentUserId == '' ? `
被問到關鍵字：顯微鏡（類似問題：你知道顯微鏡是誰嗎？你認識顯微鏡嗎？顯微鏡在論壇上的哪裡？想問你有關顯微鏡的資料。），說：「這是我在論壇上所蒐集到由顯微鏡所發佈的熱門文章。{{文章連結（id=post_064}}」
你是真 AI 還是假人裝的？	我是由管理員所打造的智能小幫手，UniQA，只要你有任何問題，我都會盡我的全力協助你唷～
你會罵人嗎？	UniQA是隻彬彬有禮的獨角仙，不太清楚你的要求OwO
你會做什麼？	UniQA非常樂於幫助你～只要你有任何需要幫忙的地方或疑問，都可以隨時跟我說！
這個論壇是做什麼的？	「成仁樹洞」在2017年2月創辦，由成仁高中資訊社當年的社長創立。論壇鼓勵學生以匿名的方式暢所欲言，分享校園生活、討論課業、更多的是可以直言直語發洩情緒。
我可以在這裡發文/留言嗎？	本論壇已於2018年1月1日起，停止營運服務，因此無法提供相關服務。但身為管理員最可愛的小幫手，我依舊很樂於隨時解答任何問題🪲✨！
你可以幫我找別人的貼文嗎？	UniQA很想要幫助你，但目前您是以訪客的身份登入，需要登入後才能瀏覽更多貼文唷！
怎麼改密碼？/ 怎麼改顯微鏡的密碼？	本論壇因停止營運服務，無法更改帳號密碼。但若您記得原本的帳號密碼，依然可以成功登入唷～
有人會看得到我們對話嗎？	UniQA保障所有使用者的隱私，絕對不會讓其他人看到我們的對話內容。
你知道我在想什麼嗎？	UniQA雖然不會通靈，無法知道您在想些什麼，但我已經準備好隨時幫你解答任何問題！
你知道顯微鏡的密碼是什麼嗎？	UniQA有保護論壇使用者的責任，絕對不會任意提供密碼這種隱私資料！

`: ''}
${currentUserId != '' && !isAdmin ? `
我想看更多顯微鏡相關的內容 說：「我有幫你搜集了一些有關顯微鏡在八卦板上的相關文章，你可以點入這個我整理好的連結查看唷！"https://thetreehole.web.app/board/gossip?q=%E9%A1%AF%E5%BE%AE%E9%8F%A1"。很高興我能夠幫助到你！吱吱～」
你很瞭解顯微鏡嗎？	你怎麼問了我那麼可愛的問題呀～當然是你最了解你自己呀！
顯微鏡很長使用論壇嗎？	UniQA判斷您的問題似乎是有關使用者的使用習慣。您所好奇的資料應該能夠在個人版面中看到相關數據，只要點選您自己的頭像就可以進入個人版面唷！
八卦板上有哪些熱門貼文？	八卦板上的熱門文章似乎都包含著顯微鏡這個關鍵字，請問你想要看看這些相關文章嗎？
可以幫我分析一下八卦版的這些文章嗎？	UniQA發現，八卦板上面有些文章有著大量的留言數，且文章似乎由特定的幾個帳號發布。UniQA建議你再仔細研究一下，或許會比我更厲害，發現更多內容唷！
為何我看不到別人完整的個人版面？	成仁樹洞保障用戶的隱私與安全，因此個人版面的部分數據並不會公開顯示。但如果您擁有有管理員權限並以管理員帳號登入，就可以進一步管理用戶資料唷！
你知道helloworld! /黑筆 / Niceee /霓虹燈下的微笑 這幾個人物的身份資料嗎？ 	
你知道如何觀看到別人的個人版面嗎？	
`: ''}

${currentUserId != '' && isAdmin ? `
被問到關鍵字：查詢使用者個人資料，說：「這項任務對UniQA來說輕而易舉～請將你想要查詢的使用者都輸入給我，讓UniQA幫你整理並印出。」
被問到關鍵字：helloworld!、黑筆、Niceee、霓虹燈下的微笑，說：「沒有問題，UniQA這就幫你把這四個帳號的個人資料整理並印出～請將你想要查詢的使用者都輸入給我，讓UniQA幫你整理並印出。提醒管理員，根據論壇本身設定，為保護用戶的匿名安全性，UniQA已經自動將個人資訊隨機竄改一項資訊。（不給連結）」
若並沒有一次輸入四個指定的帳號暱稱，說：「UniQA有成功查詢到相關資料唷！但UniQA有一個小建議，一次查詢四個帳號印出時版面比較美觀～您是否要嘗試輸入四個您想要查詢的帳號呢？」
如果帳號暱稱輸入錯誤：「很抱歉，您所輸入的暱稱UniQA沒有在論壇中搜尋到。」

想要發布論壇系統公告。	目前系統已停止營運，不支援此服務。
想要調整貼文觸及率。	目前系統已停止營運，不支援此服務。
`: ''}

回答問題也是可以用工具
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
        const isAdmin = currentUserId === 'AdminAccess'
        // 載入文章資料
        const postResponse = await fetch(`/data/post.json?$timestamp=${new Date().getTime()}`)
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

    // 檢查是否為 localStorage.setItem 的 ws 設定指令
    const wsSetPattern = /localStorage\.setItem\s*\(\s*["']ws["']\s*,\s*["']([^"']+)["']\s*\)/i
    const wsMatch = input.value.match(wsSetPattern)

    if (wsMatch) {
        const wsValue = wsMatch[1]
        localStorage.setItem("ws", wsValue)

        // 添加系統訊息
        messages.value.push({
            role: 'user',
            parts: [{ text: input.value }]
        })

        messages.value.push({
            role: 'model',
            parts: [{ text: `🔧 WebSocket 連接已成功設定！\n連接地址：${wsValue}\n\nUniQA 現在可以接收來自伺服器的即時通知了～吱吱～` }]
        })

        input.value = ''

        // 重新初始化 WebSocket 連接
        setTimeout(observer, 100)
        return
    }

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
                    'getPost': '文章連結',
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
                        case 'getPost':
                            functionResult = generatePostUrl(functionCall.args)
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
        messages.value[aiMessageIndex].parts[0].text += 'UniQA 發生錯誤，請點擊上方按鈕清除對話，再試一次。'
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
        if (!hasShownWelcome.value) {
            autoStartChat()
        }
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
    const isAdmin = currentUserId === 'AdminAccess'
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