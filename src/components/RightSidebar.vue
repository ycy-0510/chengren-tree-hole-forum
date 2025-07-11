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
                class="w-full mb-4 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-bold">
                我要發文
            </button>
            <div class="border border-green-700 rounded-xl p-5 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
                <p class="my-2 text-lg font-semibold text-green-800 flex items-center gap-2">
                    <i class="fa-solid fa-fire text-amber-500"></i>
                    熱門排行榜
                </p>
                <ul class="list-decimal list-inside p-0 m-0 space-y-2">
                    <li v-for="board in boards" :key="board.path" class="flex items-center gap-2">
                        <font-awesome-icon :icon="board.icon" class=" w-10 text-green-600" />
                        <RouterLink :to="board.path"
                            class="no-underline font-medium hover:text-amber-700 transition-colors rounded px-2 py-1 hover:bg-green-200"
                            active-class="text-amber-800 font-bold bg-green-100">
                            {{ board.name }}
                        </RouterLink>
                    </li>
                </ul>
            </div>

        </nav>
    </aside>
</template>

<style scoped></style>