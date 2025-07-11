<template>
    <header
        class="text-black sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-emerald-200/50 shadow-sm px-5 py-4 md:ms-64">
        <nav class="flex justify-between items-center container mx-auto">
            <!-- Hamburger Icon for mobile -->
            <div class="block md:hidden">
                <button @click="toggleMenu" class="text-2xl h-8 w-8 relative p-2 rounded-lg hover:bg-emerald-100 transition-colors">
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
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-seedling" class="text-white text-lg" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-emerald-800">成仁樹洞</h1>
                    <p class="text-emerald-600 text-xs -mt-1">匿名分享平台</p>
                </div>
            </div>
            
            <!-- User Section -->
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-3 bg-emerald-50 rounded-full px-4 py-2">
                    <img :src="user.avatar" alt="Avatar" class="w-8 h-8 rounded-full object-cover border-2 border-emerald-200" />
                    <span class="text-sm font-medium text-emerald-800 hidden sm:block">{{ user.name }}</span>
                </div>
                <button @click="signOut" class="p-2 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors">
                    <font-awesome-icon :icon="['fas', 'sign-out']" class="text-lg" />
                </button>
            </div>
        </nav>
    </header>
    <LeftSidebar :show="menuOpen" />
    <Overlay :class="{ 'invisible opacity-0': !menuOpen }" @click="toggleMenu" />
    <RightSidebar :show="menuOpen" />
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import LeftSidebar from './LeftSidebar.vue'
import Overlay from './Overlay.vue'
import RightSidebar from './RightSidebar.vue'

// State to toggle the menu
const menuOpen = ref(false)

// Function to toggle menu visibility on mobile
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
}

const users = inject('users')
const userId = inject('userId')
const user = ref({})

onMounted(() => {
    user.value = users.value.find(
        u => u.id === userId.value
    )
    console.log(user.value)
})

const signOut = () => {
    localStorage.removeItem('user')
}
</script>

<!-- <style scoped>
/* Optional: add some styling for the toggle button */
button {
    background: transparent;
    border: none;
}
</style> -->