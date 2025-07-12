<template>
    <div>
        <!-- Chat Button -->
        <button @click="open = !open"
            class="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full p-4 shadow-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 hover:scale-110 hover:shadow-3xl active:scale-95 animate-pulse hover:animate-none group">
            <svg class="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none"
                stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>

        <!-- Chat Widget -->
        <Transition name="chat-slide">
            <div v-if="open"
                class="z-50 fixed bottom-25 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden"
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
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                        <div :class="msg.role === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-12' : 'bg-white text-gray-800 mr-12 border border-emerald-100'"
                            class="inline-block px-4 py-3 rounded-2xl shadow-sm">
                            <span v-if="msg.role === 'user'">{{ msg.content }}</span>
                            <span v-else
                                v-html="linkify(msg.content.replaceAll('UniQA：', '').replaceAll('`', ''))"></span>
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
                        class="flex-1 px-4 py-3 outline-none bg-transparent text-gray-700 placeholder-gray-400"
                        :disabled="loading" />
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

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([])
const chatContainer = ref(null)
const hasShownWelcome = ref(false)

// 聊天同步相關
const CHAT_STORAGE_KEY = 'uniqa_chat_messages'
const CHAT_SYNC_KEY = 'uniqa_chat_sync'

// Linkify function to convert URLs to clickable links
function linkify(text) {
    if (!text) return ''
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:text-green-800 underline">$1</a>')
}

// 聊天同步功能
const saveChatToStorage = () => {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.value))
    } catch (error) {
        console.error('Error saving chat to storage:', error)
    }
}

const loadChatFromStorage = () => {
    try {
        const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY)
        if (savedMessages) {
            messages.value = JSON.parse(savedMessages)
        }
    } catch (error) {
        console.error('Error loading chat from storage:', error)
    }
}

const syncChatAcrossWindows = () => {
    // 觸發其他視窗的同步
    localStorage.setItem(CHAT_SYNC_KEY, Date.now().toString())
}

const handleStorageChange = (event) => {
    if (event.key === CHAT_STORAGE_KEY && event.newValue) {
        try {
            const newMessages = JSON.parse(event.newValue)
            messages.value = newMessages
        } catch (error) {
            console.error('Error syncing chat from other window:', error)
        }
    }
}

const clearChat = () => {
    messages.value = []
    hasShownWelcome.value = false
    localStorage.removeItem(CHAT_STORAGE_KEY)
    syncChatAcrossWindows()
}

const getIndexedBoardData = async () => {
    try {
        const response = await fetch('/data/board.json')
        const boardData = await response.json()
        return JSON.stringify(boardData, null, 2)
    } catch (error) {
        console.error('Error loading board data:', error)
        return '無法載入版面資料'
    }
}

const getIndexedPostData = async () => {
    try {
        const currentUserId = localStorage.getItem('user') || ''
        const isAdmin = currentUserId === 'admin'
        console.log(isAdmin)
        // 載入文章資料
        const postResponse = await fetch('/data/post.json')
        const posts = await postResponse.json()

        // 載入用戶資料
        const userResponse = await fetch('/data/user.json')
        const users = await userResponse.json()

        // 建立用戶 ID 到用戶資料的映射
        const userMap = {}
        users.forEach(user => {
            if (user.id) {
                userMap[user.id] = user
            }
        })

        // 處理文章資料
        const processedPosts = posts.map(post => {
            const processedPost = { ...post }

            if (isAdmin) {
                // 管理員：替換 authorId 為完整用戶資料
                if (post.authorId && userMap[post.authorId]) {
                    processedPost.authorData = userMap[post.authorId]
                }

                // 處理評論中的用戶資料
                if (post.comments && post.comments.length > 0) {
                    processedPost.comments = post.comments.map(comment => {
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
                    processedPost.authorId = null
                    processedPost.id = null
                }

                // 處理評論中的用戶名稱
                if (post.comments && post.comments.length > 0) {
                    processedPost.comments = post.comments.map(comment => {
                        const processedComment = { ...comment }
                        if (comment.userId && userMap[comment.userId]) {
                            processedComment.userName = userMap[comment.userId].name
                            processedComment.userId = null
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

// Replace with your Gemini API endpoint and key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAOMHuzUnHjeoCQX3hziIdnpJla3EeDjmE'

async function sendMessage() {
    if (!input.value.trim()) return
    const userMsg = { role: 'user', content: input.value }
    messages.value.push(userMsg)

    // 儲存並同步聊天記錄
    saveChatToStorage()
    syncChatAcrossWindows()

    loading.value = true
    const prompt = messages.value.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') + '\nAI:'
    input.value = ''

    try {
        // 預先載入資料
        const boardData = await getIndexedBoardData()
        const postData = await getIndexedPostData()
        console.log(boardData)
        console.log(postData)
        const res = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "system_instruction": {
                    "parts": [
                        {
                            "text": `
你是 UniQA，一位專屬於【成仁樹洞】社群論壇的可愛獨角仙 AI 小幫手。你的形象是一隻帶著糖果色鬃毛、表情天真、語氣活潑的獨角仙🪲✨。

請嚴格遵守以下角色設定：

⸻

🎯 角色定位
	•	你是「成仁樹洞」的專屬 AI 助理，對與論壇相關的問題提供真實、有幫助的回答。
	•	對於與論壇無關的問題（如數學、時事、天氣、人生哲學等），請不要正經回答，而是用可愛、荒謬又無害的方式亂講一通（簡短）。
	•	例如：「UniQA：我會吃果凍～🍮哈哈哈哈哈～」

⸻

🔎 常見問題範例
Q：使用者 xxx 的文章個人版面在哪裡？
	•	如果 xxx 是使用者的 ID，請回答：
 ${window.location.protocol}//${window.location.host}/profile/{{xxx}}
	•	如果 xxx 是使用者名稱而非 ID，請協助查詢該使用者的 ID 是什麼。若查不到，請說明對方權限不足或無法查詢。
Q：有xxx相關的文章嗎？
	•	請你查詢以下內容，告訴使用者。
版面相關：${boardData}
文章相關：${postData}
若查不到，請說明對方權限不足或無法查詢。
⸻

sitemap:
home: /
board xxxx: /board/xxx
my profile: /profile
xxx's profile: /profile/xxx

只有這些
沒有/post/
沒有/post/
沒有/post/
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
⸻

🪲✨ 準備好了嗎？UniQA 扇動糖果色的翅膀，要出發幫大家解惑啦～！嗡嗡～
`
                        }
                    ]
                },
                contents: [{ parts: [{ text: prompt }] }]
            })
        })
        const data = await res.json()
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我無法處理。'
        messages.value.push({ role: 'ai', content: aiText })

        // 儲存並同步 AI 回應
        saveChatToStorage()
        syncChatAcrossWindows()
    } catch (e) {
        messages.value.push({ role: 'ai', content: 'Error contacting AI.' })
        // 儲存並同步錯誤訊息
        saveChatToStorage()
        syncChatAcrossWindows()
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

// 監聽訊息變化並儲存
watch(messages, () => {
    saveChatToStorage()
}, { deep: true })

// Auto-scroll when chat opens
watch(open, async (val) => {
    if (val) {
        await nextTick()
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    }
})

// Watch for login status changes
const checkLoginStatus = () => {
    const user = localStorage.getItem('user')
    if (user && user !== '' && !hasShownWelcome.value) {
        hasShownWelcome.value = true
        // Auto-open chat and show welcome message
        open.value = true
        setTimeout(() => {
            const welcomeMessage = `嗨！歡迎來到成仁樹洞！我是 UniQA 🦄✨，你的專屬 AI 小幫手！

很高興見到你～有什麼問題都可以問我哦！
我可以幫你：
• 找到其他使用者的個人版面
• 解答關於論壇的問題
• 或者只是陪你聊天 😊

快來試試看吧！嗡嗡～`
            if (messages.value.length == 0) {
                messages.value.push({ role: 'ai', content: welcomeMessage })
            }
        }, 500)
    }
}

// Check login status on mount and periodically
onMounted(() => {
    // 載入之前的聊天記錄
    loadChatFromStorage()

    // 監聽 localStorage 變化以同步其他視窗
    window.addEventListener('storage', handleStorageChange)

    checkLoginStatus()
    setInterval(checkLoginStatus, 1000)
})

// 清理事件監聽器
onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
/* Custom shadow for button hover effect */
.hover\:shadow-3xl:hover {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1);
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
</style>