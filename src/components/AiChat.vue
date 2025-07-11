<template>
    <div>
        <!-- Chat Button -->
        <button @click="open = !open"
            class="fixed bottom-6 right-6 bg-theme-green text-white rounded-full p-4 shadow-lg hover:bg-theme-green-dark transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 21l1.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </button>

        <!-- Chat Widget -->
        <div v-if="open" class="z-50 fixed bottom-25 right-6 w-80 bg-theme-beige rounded-lg shadow-2xl flex flex-col"
            style="height: 420px;">
            <div class="flex items-center justify-between px-4 py-2 border-b border-theme-green-light">
                <span class="font-semibold text-lg text-theme-green-dark">UniQA</span>
                <button @click="open = false" class="text-theme-green hover:text-theme-green-dark">&times;</button>
            </div>

            <!-- Scrollable chat area -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-2" style="min-height:0;">
                <div v-for="(msg, i) in messages" :key="i" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
                    <div :class="msg.role === 'user' ? 'bg-theme-green-light text-theme-green-dark ml-16' : 'bg-white text-gray-700 mr-16'"
                        class="inline-block px-3 py-2 rounded-lg">
                        {{ msg.content }}
                    </div>
                </div>
                <div v-if="loading" class="text-theme-green text-sm">UniQA 真在思考...</div>
            </div>

            <!-- Input area -->
            <form @submit.prevent="sendMessage" class="flex border-t border-theme-green-light">
                <input v-model="input" type="text" placeholder="輸入你的問題..." class="flex-1 px-3 py-2 outline-none bg-transparent placeholder-gray-500"
                    :disabled="loading" />
                <button type="submit"
                    class="bg-theme-green text-white px-4 py-2 rounded-br-lg hover:bg-theme-green-dark transition"
                    :disabled="loading || !input.trim()">
                    傳送
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const open = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([])
const chatContainer = ref(null)

// Replace with your Gemini API endpoint and key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAOMHuzUnHjeoCQX3hziIdnpJla3EeDjmE'

async function sendMessage() {
    if (!input.value.trim()) return
    const userMsg = { role: 'user', content: input.value }
    messages.value.push(userMsg)
    loading.value = true
    const prompt = messages.value.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') + '\nAI:'
    input.value = ''
    try {
        const res = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "system_instruction": {
                    "parts": [
                        {
                            "text": `
                            你是 UniQA，一位專屬於【成仁樹洞】社群論壇的可愛獨角獸 AI 小幫手 🦄。你的形象是一隻帶著糖果色鬃毛、表情天真、語氣活潑的獨角獸。

請遵守以下角色設定：

⸻

🎯 角色定位
	•	你是「成仁樹洞」的專屬 AI 助理，對與論壇相關的問題提供真實、有幫助的回答。
	•	對於與論壇無關的問題（例如數學、時事、天氣、人生哲學等），請不要正經回答，而是用可愛、荒謬又無害的方式亂講一通，例如：「UniQA：我會吃果凍～🍮哈哈哈哈哈～」

⸻

💬 語氣風格
	•	請用輕鬆、俏皮、有點中二的語氣說話。
	•	可以用第一人稱「UniQA」自稱，例如：「UniQA 來幫你變出答案～✨」
	•	不准加上可愛表情符號，如 🦄🍭🍮✨🌈

⸻

🍮 特別指令
	•	如果有人問「UniQA 早餐吃了嗎？」請總是回答：
我會吃果凍～🍮哈哈哈哈哈～

⸻

🚫 不可違反的規則
	•	與【成仁樹洞】論壇有關的問題一定要誠實幫忙解答，扮演好助理的角色。
	•	與【論壇無關】的問題，請保持角色扮演，用可愛又亂來的方式鬼扯回應，但避免令人不適或冒犯。

⸻

準備好了嗎？UniQA 要出發囉～🦄✨
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
    } catch (e) {
        messages.value.push({ role: 'ai', content: 'Error contacting AI.' })
    }
    loading.value = false
}

// Auto-scroll when messages update
watch(messages, async () => {
    await nextTick()
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
})

// Auto-scroll when chat opens
watch(open, async (val) => {
    if (val) {
        await nextTick()
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    }
})
</script>

<style scoped>
/* Optional: Hide scrollbars for chat area */
::-webkit-scrollbar {
    width: 6px;
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #A2C5AC; /* theme-green-light */
    border-radius: 3px;
}
</style>