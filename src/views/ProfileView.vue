<template>
    <div class="min-h-screen py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- 未登入狀態 -->
            <div v-if="!isLoggedIn && !route.params.userId" class="text-center py-12">
                <div class="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                    <div class="text-gray-400 mb-4">
                        <font-awesome-icon icon="fa-solid fa-user-slash" class="text-6xl" />
                    </div>
                    <h2 class="text-2xl font-bold text-gray-800 mb-4">尚未登入</h2>
                    <p class="text-gray-600 mb-6">請先登入以查看個人資料</p>
                    <button @click="$router.push('/')"
                        class="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                        返回首頁
                    </button>
                </div>
            </div>

            <!-- 已登入或查看他人資料 -->
            <div v-else>
                <!-- 用戶資料卡片 -->
                <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div class="flex flex-col sm:flex-row items-center gap-2">
                        <!-- 用戶頭像 -->
                        <img :src="userProfile.avatar" alt=""
                            class="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md" />
                        <div>
                            <div class="text-center sm:text-left">
                                <h2 class="text-2xl font-bold text-gray-800">{{ userProfile.name }}</h2>
                                <p class="text-gray-600 mt-1">用戶ID: {{ userProfile.id }}</p>
                            </div>
                        </div>
                        <!-- 用戶資訊 -->
                        <div class="flex-1 text-center sm:text-left">
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 items-center">
                                <div class="text-center">
                                    <p class="text-sm text-gray-500">年級</p>
                                    <p class="text-lg font-semibold text-gray-700">{{ userProfile.grade || '未設定' }}</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-sm text-gray-500">生日</p>
                                    <p class="text-md font-semibold text-gray-700">{{ userProfile.birthday || '未設定' }}
                                    </p>
                                </div>
                                <div class="text-center">
                                    <p class="text-sm text-gray-500">感情狀態</p>
                                    <p class="text-lg font-semibold text-gray-700">{{ userProfile.relationshipStatus ||
                                        '未設定' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-sm text-gray-500">自我介紹</p>
                        <p class="text-md font-semibold text-gray-700 text-start" v-html="userProfile.selfIntro"></p>
                    </div>
                </div>

                <!-- 統計圖表區域 - 只有查看自己的資料時才顯示 -->
                <div v-if="isCurrentUser" class="grid grid-cols-2 gap-6 mb-6">
                    <!-- 發文趨勢圖 - 左側 1/2 -->
                    <div class="col-span-2 lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">發文熱度</h3>
                        <div class="h-64 flex items-end justify-between gap-1 overflow-x-auto">
                            <img :src="userProfile.postTrend" alt="發文熱度圖" class="w-full rounded-lg shadow" />
                        </div>
                    </div>


                    <!-- 右側圖表區域 - 1/2 -->
                    <div class="col-span-2 lg:col-span-1 flex flex-col gap-6">
                        <!-- 常逛版面 - 右上 2/7 -->
                        <div class="bg-white rounded-lg shadow-lg p-4">
                            <h3 class="text-base font-semibold text-gray-800 mb-3">常逛版面</h3>
                            <div class="flex items-center justify-center">
                                <div v-if="userProfile.favoriteBoard && userProfile.favoriteBoard !== '未設定'"
                                    class="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-lg font-medium">
                                    {{ userProfile.favoriteBoard }}
                                </div>
                                <div v-else class="text-center text-gray-500 text-base">
                                    未設定常逛版面
                                </div>
                            </div>
                        </div>

                        <!-- 下方圖表區域 - 5/7 -->
                        <div class="flex gap-4">
                            <!-- 發文時間分佈 - 左側 -->
                            <div class="bg-white rounded-lg shadow-lg p-4 flex-1">
                                <h3 class="text-base font-semibold text-gray-800 mb-3">發文時間</h3>
                                <div class="flex items-center justify-center h-32">
                                    <div class="relative w-28 h-28">
                                        <svg class="w-full h-full" viewBox="0 0 36 36">
                                            <!-- 背景圓 -->
                                            <path class="text-gray-200" d="M18 2.0845
                                                     a 15.9155 15.9155 0 0 1 0 31.831
                                                     a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                                                stroke="currentColor" stroke-width="2" />
                                            <!-- 白天 -->
                                            <path class="text-yellow-400" :d="`M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831`" fill="none"
                                                stroke="currentColor" stroke-width="2"
                                                :stroke-dasharray="`${postTimeData.day}, 100`" />
                                            <!-- 晚上 -->
                                            <path class="text-blue-600" :d="`M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831`" fill="none"
                                                stroke="currentColor" stroke-width="2"
                                                :stroke-dasharray="`${postTimeData.night}, 100`"
                                                :stroke-dashoffset="`${-postTimeData.day}`" />
                                        </svg>
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="text-xs font-medium text-gray-700">時間</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3 space-y-1">
                                    <div class="flex items-center text-xs">
                                        <div class="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                                        <span class="text-gray-600">白天</span>
                                        <span class="ml-auto font-medium text-gray-700">{{ postTimeData.dayPercent
                                            }}%</span>
                                    </div>
                                    <div class="flex items-center text-xs">
                                        <div class="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                                        <span class="text-gray-600">晚上</span>
                                        <span class="ml-auto font-medium text-gray-700">{{ postTimeData.nightPercent
                                            }}%</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 發文習慣 - 右側 -->
                            <div class="bg-white rounded-lg shadow-lg p-4 flex-1">
                                <h3 class="text-base font-semibold text-gray-800 mb-3">發文習慣</h3>
                                <div class="flex items-center justify-center h-32">
                                    <div class="relative w-28 h-28">
                                        <svg class="w-full h-full" viewBox="0 0 36 36">
                                            <!-- 背景圓 -->
                                            <path class="text-gray-200" d="M18 2.0845
                                                     a 15.9155 15.9155 0 0 1 0 31.831
                                                     a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                                                stroke="currentColor" stroke-width="2" />
                                            <!-- 有圖 -->
                                            <path class="text-green-500" :d="`M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831`" fill="none"
                                                stroke="currentColor" stroke-width="2"
                                                :stroke-dasharray="`${postImageData.withImage}, 100`" />
                                            <!-- 沒圖 -->
                                            <path class="text-gray-400" :d="`M18 2.0845
                                                      a 15.9155 15.9155 0 0 1 0 31.831
                                                      a 15.9155 15.9155 0 0 1 0 -31.831`" fill="none"
                                                stroke="currentColor" stroke-width="2"
                                                :stroke-dasharray="`${postImageData.withoutImage}, 100`"
                                                :stroke-dashoffset="`${-postImageData.withImage}`" />
                                        </svg>
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="text-xs font-medium text-gray-700">習慣</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3 space-y-1">
                                    <div class="flex items-center text-xs">
                                        <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                        <span class="text-gray-600">文圖並茂</span>
                                        <span class="ml-auto font-medium text-gray-700">{{
                                            postImageData.withImagePercent }}%</span>
                                    </div>
                                    <div class="flex items-center text-xs">
                                        <div class="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                                        <span class="text-gray-600">純文字</span>
                                        <span class="ml-auto font-medium text-gray-700">{{
                                            postImageData.withoutImagePercent }}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 近期發文 -->
                <div v-if="isCurrentUser" class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        {{ isCurrentUser ? '我的發文' : `${userProfile.name}的發文` }}
                    </h3>

                    <div v-if="isLoading" class="text-center py-8">
                        <div class="text-gray-400 mb-4">
                            <font-awesome-icon icon="fa-solid fa-spinner" class="text-3xl animate-spin" />
                        </div>
                        <p class="text-gray-500">載入中...</p>
                    </div>

                    <div v-else-if="userPosts.length > 0" class="space-y-4">
                        <Post v-for="post in userPosts" :key="post.id" :post="post" />
                    </div>

                    <div v-else class="text-center py-8">
                        <div class="text-gray-400 mb-4">
                            <font-awesome-icon icon="fa-solid fa-inbox" class="text-4xl" />
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">
                            {{ isCurrentUser ? '目前沒有發文' : `${userProfile.name}還沒有發文` }}
                        </h3>
                        <p class="text-gray-500">
                            {{ isCurrentUser ? '開始分享你的想法吧！' : '期待他的第一篇文章' }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Post from '../components/Post.vue'
import type { User, PostData } from '../data'

const route = useRoute()

// 獲取當前登入用戶 ID 從 localStorage
const getCurrentUserId = () => {
    return localStorage.getItem('user') || ''
}

// 當前登入用戶 ID
const currentUserId = ref(getCurrentUserId())

// 監聽 localStorage 變化
const watchLocalStorage = () => {
    const interval = setInterval(() => {
        const newUserId = getCurrentUserId()
        if (newUserId !== currentUserId.value) {
            currentUserId.value = newUserId
            // 如果當前顯示的是用戶自己的資料，需要重新載入
            if (!route.params.userId) {
                loadUsersData()
            }
        }
    }, 100)

    return () => clearInterval(interval)
}

// 從路由參數獲取要顯示的用戶 ID，如果沒有則顯示當前用戶
const displayUserId = computed(() => {
    const routeUserId = route.params.userId as string
    return routeUserId || currentUserId.value
})

// 用戶資料
const userProfile = ref<User>({
    id: '',
    name: '',
    avatar: '',
    password: '',
    grade: '未設定',
    birthday: '未設定',
    relationshipStatus: '未設定',
    favoriteBoard: '未設定',
    postTrend: 'https://placehold.co/400x600',
    selfIntro: ''
})

// 所有用戶資料
const users = ref<User[]>([])

// 文章資料
const postsData = ref<PostData[]>([])
const isLoading = ref(true)

// 判斷是否已登入
const isLoggedIn = computed(() => !!currentUserId.value)

// 判斷是否是當前用戶
const isCurrentUser = computed(() => displayUserId.value === currentUserId.value || currentUserId.value == 'admin')

// 版面資料
const boardsData = ref<any[]>([])

// 獲取作者名稱
const getAuthorName = (authorId: string) => {
    const user = users.value.find(u => u.id === authorId)
    return user ? user.name : '匿名用戶'
}

// 獲取作者頭像
const getAuthorAvatar = (authorId: string) => {
    const user = users.value.find(u => u.id === authorId)
    return user?.avatar
}

// 格式化日期
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW')
}

// 發文時間統計（白天/晚上，以下午6點為界）
const postTimeData = computed(() => {
    const userPostsData = postsData.value.filter(post => post.authorId === displayUserId.value)

    if (userPostsData.length === 0) {
        return { day: 0, night: 0, dayPercent: 0, nightPercent: 0 }
    }

    let dayCount = 0
    let nightCount = 0

    userPostsData.forEach(post => {
        const date = new Date(post.createdAt)
        const hour = date.getHours()

        if (hour >= 6 && hour < 18) {
            dayCount++
        } else {
            nightCount++
        }
    })

    const dayPercent = Math.round((dayCount / userPostsData.length) * 100)
    const nightPercent = Math.round((nightCount / userPostsData.length) * 100)

    return {
        day: dayPercent,
        night: nightPercent,
        dayPercent,
        nightPercent
    }
})

// 發文習慣統計（有圖/沒圖）
const postImageData = computed(() => {
    const userPostsData = postsData.value.filter(post => post.authorId === displayUserId.value)

    if (userPostsData.length === 0) {
        return { withImage: 0, withoutImage: 0, withImagePercent: 0, withoutImagePercent: 0 }
    }

    let withImageCount = 0
    let withoutImageCount = 0

    userPostsData.forEach(post => {
        if (post.image) {
            withImageCount++
        } else {
            withoutImageCount++
        }
    })

    const withImagePercent = Math.round((withImageCount / userPostsData.length) * 100)
    const withoutImagePercent = Math.round((withoutImageCount / userPostsData.length) * 100)
    console.log({
        withImage: withImagePercent,
        withoutImage: withoutImagePercent,
        withImagePercent,
        withoutImagePercent
    })
    return {
        withImage: withImagePercent,
        withoutImage: withoutImagePercent,
        withImagePercent,
        withoutImagePercent
    }
})

// 用戶發文
const userPosts = computed(() => {
    const userPostsData = postsData.value.filter(post => post.authorId === displayUserId.value)

    // 按置頂狀態和時間排序（置頂在前，然後按最新時間排序）
    const sortedPosts = [...userPostsData].sort((a, b) => {
        // 首先按置頂狀態排序
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1

        // 如果置頂狀態相同，按時間排序（最新的在前）
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return sortedPosts.map(postData => ({
        id: parseInt(postData.id.replace('post_', '')),
        title: postData.title,
        content: postData.content,
        image: postData.image,
        author: getAuthorName(postData.authorId),
        authorId: postData.authorId,
        avatar: getAuthorAvatar(postData.authorId),
        createdAt: formatDate(postData.createdAt),
        likes: postData.likes,
        comments: (postData as any).displayComments || postData.comments.length,
        shares: postData.shares,
        tags: postData.tags,
        isPinned: postData.isPinned, // 傳遞置頂狀態
        commentsList: postData.comments.map(comment => ({
            id: `${postData.id}_comment_${comment.userId}_${comment.time}`,
            author: getAuthorName(comment.userId),
            authorId: comment.userId,
            avatar: getAuthorAvatar(comment.userId),
            content: comment.content,
            createdAt: formatDate(comment.time)
        }))
    }))
})

// 載入版面資料
const loadBoardsData = async () => {
    try {
        const response = await fetch('/data/board.json')
        const data = await response.json()
        boardsData.value = data.boards
    } catch (error) {
        console.error('載入版面數據失敗:', error)
    }
}

// 載入用戶資料
const loadUsersData = async () => {
    try {
        const response = await fetch('/data/user.json')
        const data = await response.json()
        users.value = data

        // 檢查是否有要顯示的用戶 ID
        if (!displayUserId.value) {
            // 如果沒有登入且沒有指定用戶 ID，顯示未登入狀態
            userProfile.value = {
                id: '',
                name: '請先登入',
                avatar: '',
                password: '',
                grade: '未知',
                birthday: '未知',
                relationshipStatus: '未知',
                favoriteBoard: '未知'
            }
            return
        }

        // 設定要顯示的用戶資料
        const targetUser = users.value.find(u => u.id === displayUserId.value)
        if (targetUser) {
            userProfile.value = {
                ...targetUser,
                grade: targetUser.grade || '未設定',
                birthday: targetUser.birthday || '未設定',
                relationshipStatus: targetUser.relationshipStatus || '未設定',
                favoriteBoard: targetUser.favoriteBoard || '未設定'
            }
        } else {
            // 如果找不到用戶，設定一個預設的錯誤狀態
            userProfile.value = {
                id: '',
                name: '用戶不存在',
                avatar: '',
                password: '',
                grade: '未知',
                birthday: '未知',
                relationshipStatus: '未知',
                favoriteBoard: '未知'
            }
        }
    } catch (error) {
        console.error('載入用戶數據失敗:', error)
    }
}

// 載入文章資料
const loadPostsData = async () => {
    try {
        const response = await fetch('/data/post.json')
        const data = await response.json()
        postsData.value = data
    } catch (error) {
        console.error('載入文章數據失敗:', error)
    }
}

// 監聽路由變化，當用戶 ID 改變時重新載入資料
watch(() => route.params.userId, async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
        isLoading.value = true
        try {
            await loadUsersData()
            await loadBoardsData()
            // 模仿真實網站載入延遲
            await new Promise(resolve => setTimeout(resolve, 500))

            // 更新頁面標題
            if (userProfile.value.name && userProfile.value.name !== '用戶不存在') {
                document.title = `${userProfile.value.name}的個人資料 | 成仁樹洞`
            } else {
                document.title = '用戶不存在 | 成仁樹洞'
            }
        } catch (error) {
            console.error('載入數據時發生錯誤:', error)
        } finally {
            isLoading.value = false
        }
    }
})

// 組件掛載時載入資料
onMounted(async () => {
    // 開始監聽 localStorage 變化
    const stopWatching = watchLocalStorage()

    // 在組件卸載時停止監聽
    onUnmounted(() => {
        stopWatching()
    })

    try {
        await Promise.all([
            loadUsersData(),
            loadPostsData(),
            loadBoardsData()
        ])
        // 模仿真實網站載入延遲
        await new Promise(resolve => setTimeout(resolve, 500))

        // 設定頁面標題
        if (userProfile.value.name && userProfile.value.name !== '用戶不存在') {
            document.title = `${userProfile.value.name}的個人資料 | 成仁樹洞`
        } else {
            document.title = '用戶不存在 | 成仁樹洞'
        }
    } catch (error) {
        console.error('載入數據時發生錯誤:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
/* 自定義樣式 */
.chart-bar {
    transition: height 0.3s ease;
}

.chart-bar:hover {
    opacity: 0.8;
}
</style>
