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
        class="fixed top-0 right-0 z-10 w-64 h-auto max-h-screen p-6 pt-30 transition-all duration-300 md:translate-x-0 md:opacity-100"
        :class="{ 'translate-x-64 opacity-0': !prop.show }">
        <div class="space-y-6">
            

            <!-- Hot Rankings -->
            <div class="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 shadow-xl">
                <div class="flex items-center gap-2 mb-4">
                    <div
                        class="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                        <font-awesome-icon icon="fa-solid fa-fire" class="text-white text-sm" />
                    </div>
                    <h3 class="text-lg font-bold text-gray-800">熱門排行榜</h3>
                </div>
                <ul class="space-y-3">
                    <li v-for="(board, index) in boards" :key="board.path" class="flex items-center gap-3">
                        <div
                            class="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                            {{ index + 1 }}
                        </div>
                        <div class="flex items-center gap-2 flex-1">
                            <div class="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                                <font-awesome-icon :icon="board.icon" class="text-emerald-600 text-xs" />
                            </div>
                            <RouterLink :to="board.path"
                                class="no-underline font-medium text-gray-700 hover:text-emerald-600 transition-colors text-sm"
                                active-class="text-emerald-600 font-semibold">
                                {{ board.name }}
                            </RouterLink>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </aside>
</template>

<style scoped></style>