<template>
    <header
        class="text-black sticky top-0 z-20 bg-green-200/30 backdrop-blur border-b border-green-500/20 px-5 py-3 md:ms-52">
        <nav class="flex justify-between items-center container mx-auto">
            <!-- Hamburger Icon for mobile -->
            <div class="block md:hidden">
                <button @click="toggleMenu" class="text-2xl h-8 w-8 relative">
                    <font-awesome-icon :icon="['fas', 'bars']"
                        class="absolute left-0 top-0 h-8 w-8 transition-all duration-300"
                        :class="{ 'translate-x-0 opacity-100': !menuOpen, 'rotate-90 opacity-0': menuOpen }" />
                    <font-awesome-icon :icon="['fas', 'xmark']"
                        class="absolute left-0 top-0 h-8 w-8 transition-all duration-300"
                        :class="{ 'translate-x-0 opacity-100': menuOpen, '-rotate-90 opacity-0': !menuOpen }" />
                </button>
            </div>
            <!-- Logo/Title -->
            <h1 class="text-3xl font-bold tracking-wide text-amber-800 flex-1 text-left ms-4">成仁樹洞</h1>
            <!-- Avatar and Name Placeholder -->
            <div class="flex items-center space-x-3">
                <img :src="user.avatar" alt="Avatar" class="w-9 h-9 rounded-full object-cover bg-green-800" />
                <span class="text-lg font-medium text-amber-900">{{ user.name }}</span>
            </div>
            <button @click="signOut" class="ml-4 px-4 py-2 rounded  text-amber-800 hover:text-red-600 transition">
                <font-awesome-icon :icon="['fas', 'sign-out']" class="mr-2" />
            </button>
        </nav>
    </header>
    <LeftSidebar :show="menuOpen" />
    <Overlay :class="{ 'invisible opacity-20': !menuOpen }" @click="toggleMenu" />
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