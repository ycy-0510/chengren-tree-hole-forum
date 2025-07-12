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

const post = () => {
    alert('累積經驗值後即可發文')
}
</script>

<template>
    <aside
        class="fixed top-0 right-0 z-10 w-64 h-auto max-h-screen p-6 pt-42 transition-all duration-300 md:translate-x-0 md:opacity-100"
        :class="{ 'translate-x-64 opacity-0': !prop.show }">
        <div class="space-y-6">
            <!-- Post Button -->
            <button @click="post"
                class="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <font-awesome-icon icon="fa-solid fa-plus" class="text-sm" />
                我要發文
            </button>

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

            <!-- Quick Stats -->
            <div class="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl p-6 shadow-xl">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-chart-line" class="text-emerald-600" />
                    今日統計
                </h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 text-sm">新增貼文</span>
                        <span class="text-emerald-600 font-semibold">42</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 text-sm">活躍用戶</span>
                        <span class="text-emerald-600 font-semibold">128</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-600 text-sm">回覆數</span>
                        <span class="text-emerald-600 font-semibold">256</span>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped></style>