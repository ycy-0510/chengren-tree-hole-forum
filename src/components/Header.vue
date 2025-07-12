<template>
    <header
        class="text-black sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-emerald-200/50 shadow-sm px-5 py-4 lg:ms-64">
        <nav class="flex justify-between items-center">
            <!-- Hamburger Icon for mobile -->
            <div class="block lg:hidden">
                <button @click="toggleMenu"
                    class="text-2xl h-8 w-8 relative p-2 rounded-lg hover:bg-emerald-100 transition-colors">
                    <font-awesome-icon :icon="['fas', 'bars']"
                        class="absolute left-2 top-2 h-4 w-4 transition-all duration-300 text-emerald-700"
                        :class="{ 'translate-x-0 opacity-100': !menuOpen, 'rotate-90 opacity-0': menuOpen }" />
                    <font-awesome-icon :icon="['fas', 'xmark']"
                        class="absolute left-2 top-2 h-4 w-4 transition-all duration-300 text-emerald-700"
                        :class="{ 'translate-x-0 opacity-100': menuOpen, '-rotate-90 opacity-0': !menuOpen }" />
                </button>
            </div>

            <!-- Logo/Title -->
            <div class="flex items-center gap-3 flex-1 text-left ms-4">
                <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-seedling" class="text-white text-lg" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-emerald-800">成仁樹洞</h1>
                    <p class="text-emerald-600 text-xs -mt-1">匿名分享平台</p>
                </div>
            </div>

            <!-- User Section -->
            <div class="flex items-center space-x-4">
                <div v-if="user && user.name" class="flex items-center space-x-3">
                    <RouterLink to="/profile">
                        <div class="flex items-center space-x-3 bg-emerald-50 rounded-full px-4 py-2">
                            <img :src="user.avatar" alt="Avatar"
                                class="w-8 h-8 rounded-full object-cover border-2 border-emerald-200" />
                            <span class="text-sm font-medium text-emerald-800 hidden sm:block">{{ user.name }}</span>
                        </div>
                    </RouterLink>
                    <button @click="signOut"
                        class="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors">
                        <font-awesome-icon :icon="['fas', 'sign-out']" class="text-lg" />
                    </button>
                </div>
                <div v-else>
                    <button @click="signIn"
                        class="p-2 rounded-full hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors">
                        <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="text-lg" /><span
                            class=" ms-2">Login</span>
                    </button>
                </div>
            </div>
        </nav>
    </header>
    <LeftSidebar :show="menuOpen" @click="closeMenu" />
    <Overlay :class="{ 'invisible opacity-0': !menuOpen }" class=" lg:hidden" @click="closeMenu" />
    <RightSidebar :show="menuOpen" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import LeftSidebar from './LeftSidebar.vue'
import Overlay from './Overlay.vue'
import RightSidebar from './RightSidebar.vue'
import router from '../router'

// State to toggle the menu
const menuOpen = ref(false)

// Function to toggle menu visibility on mobile
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
    menuOpen.value = false
}

const users = ref([])
const userId = ref('')
const user = ref({})

const fetchUsers = async () => {
    try {
        const response = await fetch('/data/user.json')
        const data = await response.json()
        users.value = data
        updateCurrentUser()
    } catch (error) {
        console.error('Error fetching users:', error)
    }
}

const updateCurrentUser = () => {
    const currentUserId = localStorage.getItem('user') || ''
    userId.value = currentUserId
    user.value = users.value.find(u => u.id === currentUserId) || {}
}

onMounted(() => {
    fetchUsers()
    // 監聽 localStorage 變化
    setInterval(() => {
        const currentUserId = localStorage.getItem('user') || ''
        if (currentUserId !== userId.value) {
            updateCurrentUser()
        }
    }, 100)
})

const signOut = () => {
    localStorage.removeItem('user')
}

const signIn = () => {
    router.push('/profile')
}
</script>

<!-- <style scoped>
/* Optional: add some styling for the toggle button */
button {
    background: transparent;
    border: none;
}
</style> -->