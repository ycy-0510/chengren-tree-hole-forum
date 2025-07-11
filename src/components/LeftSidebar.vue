<script setup lang="ts">


const prop = defineProps({
    show: Boolean
})
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
        name: "生活",
        path: "/board/life",
        icon: "fa-solid fa-leaf"
    }
]
</script>

<template>
    <aside
        class="fixed top-0 left-0 z-30 w-52 h-screen bg-green-900 text-white border-r border-green-600 p-5 transition-all duration-300 md:translate-x-0 md:opacity-100"
        :class="{ '-translate-x-52 opacity-20': !prop.show }">
        <nav>
            <ul class="list-none p-0 m-0">
                <li v-for="board in boards" :key="board.path" class="my-2">
                    <RouterLink :to="board.path"
                        class="no-underline hover:text-amber-700 transition-colors text-lg flex items-center gap-2"
                        active-class="text-amber-600 font-bold">
                        <font-awesome-icon :icon="board.icon" class=" w-10" />
                        {{ board.name }}
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </aside>
</template>

<style scoped></style>