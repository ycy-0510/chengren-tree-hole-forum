<template>
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100"
        style="background-image:url('/assets/background/login.png'); background-size: cover; background-repeat: no-repeat;">

        <div class=" absolute w-full max-w-md mx-4 left-20 top-60">
            <!-- Login form -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-emerald-100">
                <p
                    class="mb-6 text-center text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 rounded-lg p-2 shadow-sm">
                    系統公告<br>本論壇已於2018年1月1日起 停止營運服務
                </p>
                <form @submit.prevent="login" class="space-y-6">
                    <div>
                        <label class="block text-emerald-700 text-sm font-semibold mb-2">使用者ID</label>
                        <div class="relative">
                            <font-awesome-icon icon="fa-solid fa-user" class="absolute left-3 top-4 text-emerald-400" />
                            <input v-model="username" type="text"
                                class="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 transition-all"
                                placeholder="輸入使用者ID" required />
                        </div>
                    </div>

                    <div>
                        <label class="block text-emerald-700 text-sm font-semibold mb-2">密碼</label>
                        <div class="relative">
                            <font-awesome-icon icon="fa-solid fa-lock" class="absolute left-3 top-4 text-emerald-400" />
                            <input v-model="password" type="text"
                                class="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 transition-all"
                                placeholder="輸入密碼" required />
                        </div>
                    </div>

                    <button type="submit"
                        class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        輕敲樹洞入口
                    </button>

                    <router-link to="/"
                        class="block w-full text-center mt-2 text-emerald-500 hover:text-emerald-700 font-semibold transition-colors">
                        訪客登入
                    </router-link>
                </form>

                <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-red-600 text-sm text-center">{{ error }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import router from '../router'

const username = ref('')
const password = ref('')
const error = ref('')
const users = ref([])

const fetchUsers = async () => {
    try {
        const response = await fetch('/data/user.json')
        const data = await response.json()
        users.value = data
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

onMounted(() => {
    document.title = `登入 | 成仁樹洞`
    fetchUsers()
})

const login = () => {
    const user = users.value.find(
        u => u.id === username.value && u.password === password.value
    )

    if (user) {
        localStorage.setItem('user', user.id)
        router.push('/profile')
    } else {
        error.value = '帳號或密碼錯誤.'
    }
}
</script>