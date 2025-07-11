<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 bg-white rounded shadow-md">
            <form @submit.prevent="login">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2">使用者名稱</label>
                    <input v-model="username" type="text"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required />
                </div>
                <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2">密碼</label>
                    <input v-model="password" type="text"
                        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                        required />
                </div>
                <button type="submit"
                    class="w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-800 transition">
                    輕敲樹洞入口
                </button>
            </form>
            <p v-if="error" class="mt-4 text-red-500 text-sm text-center">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { inject, ref } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')
const users = inject('users')


function login() {
    const user = users.value.find(
        u => u.name === username.value && u.password === password.value
    )

    if (user) {
        localStorage.setItem('user',user.id)
        alert(`歡迎 ${user.name}!`)
        // Do something with `user`, e.g. store in state or redirect
    } else {
        error.value = '帳號或密碼錯誤.'
    }
}
</script>