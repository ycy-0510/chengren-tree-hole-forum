<script setup lang="ts">

const prop = defineProps({
    show: Boolean
})
const boards = [
    {
        name: "八卦",
        path: "/board/gossip",
        icon: "fa-solid fa-comments"
    },
    {
        name: "美食",
        path: "/board/food",
        icon: "fa-solid fa-utensils"
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
        class="fixed top-0 right-0 z-10 w-52 h-[300px] p-5 pt-20 transition-all duration-300 md:translate-x-0 md:opacity-100"
        :class="{ 'translate-x-52 opacity-20': !prop.show }">
        <nav>
            <button
                class="w-full mb-4 py-2 px-4 bg-theme-green text-white rounded hover:bg-theme-green-dark transition-colors font-bold">
                我要發文
            </button>
            <div class="border border-theme-green-dark rounded-xl p-5 bg-theme-green-light shadow-lg">
                <p class="my-2 text-lg font-semibold text-theme-green-dark flex items-center gap-2">
                    <i class="fa-solid fa-fire text-theme-brown"></i>
                    熱門排行榜
                </p>
                <ul class="list-decimal list-inside p-0 m-0 space-y-2">
                    <li v-for="board in boards" :key="board.path" class="flex items-center gap-2">
                        <font-awesome-icon :icon="board.icon" class=" w-10 text-theme-green" />
                        <RouterLink :to="board.path"
                            class="no-underline font-medium hover:text-theme-brown transition-colors rounded px-2 py-1 hover:bg-theme-green-xlight"
                            active-class="text-theme-brown font-bold bg-theme-green-xlight">
                            {{ board.name }}
                        </RouterLink>
                    </li>
                </ul>
            </div>

        </nav>
    </aside>
</template>

<style scoped></style>