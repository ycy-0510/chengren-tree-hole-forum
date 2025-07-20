<script setup lang="ts">


const prop = defineProps({
    show: Boolean
})

const emit = defineEmits(['click'])
const boards = [
    {
        name: "首頁",
        path: "/",
        icon: "fa-solid fa-house"
    },
    {
        name: "學術",
        path: "/board/academic",
        icon: "fa-solid fa-graduation-cap"
    },
    {
        name: "美食",
        path: "/board/food",
        icon: "fa-solid fa-utensils"
    },
    {
        name: "時尚",
        path: "/board/fashion",
        icon: "fa-solid fa-shirt"
    },
    {
        name: "八卦",
        path: "/board/gossip",
        icon: "fa-solid fa-comments"
    },
    {
        name: "運動",
        path: "/board/sports",
        icon: "fa-solid fa-basketball"
    },
    {
        name: "校園",
        path: "/board/school",
        icon: "fa-solid  fa-school"
    }
]
</script>

<template>
    <aside
        class="fixed top-0 left-0 z-30 w-64 h-screen bg-gradient-to-b from-emerald-900 via-green-900 to-teal-900 text-white shadow-2xl transition-all duration-300 lg:translate-x-0 lg:opacity-100"
        :class="{ '-translate-x-64 opacity-0': !prop.show }">

        <!-- Logo Section -->
        <div class="p-6 border-b border-emerald-700/30">
            <h2 class="text-xl font-bold text-emerald-200 flex items-center gap-2">
                <img src="/assets/images/treehodeicon.png" class=" h-12 w-12" alt="">
                成仁樹洞
            </h2>
        </div>

        <!-- Navigation -->
        <nav class="pt-4">
            <ul class="list-none p-0 m-0 space-y-1">
                <li v-for="board in boards" :key="board.path" class="px-3">
                    <RouterLink :to="board.path" @click="emit('click')"
                        class="group flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-emerald-800/50 hover:text-emerald-200 transition-all duration-200 no-underline"
                        active-class="bg-emerald-700/70 text-emerald-200 font-semibold shadow-lg">
                        <div
                            class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700/30 group-hover:bg-emerald-600/50 transition-colors">
                            <font-awesome-icon :icon="board.icon" class="text-sm" />
                        </div>
                        <span class="text-base">{{ board.name }}</span>
                    </RouterLink>
                </li>
            </ul>
        </nav>

        <!-- Bottom decoration -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
    </aside>
</template>

<style scoped></style>