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
                    <div class="flex flex-col sm:flex-row items-center gap-6">
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
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1 items-center">
                                <div class="text-center">
                                    <p class="text-sm text-gray-500">性別</p>
                                    <p class="text-lg font-semibold text-gray-700">{{ userProfile.gender || '未設定' }}</p>
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
                                <div class="text-center">
                                    <p class="text-sm text-gray-500">常逛版面</p>
                                    <p class="text-lg font-semibold text-gray-700">{{ userProfile.favoriteBoard || '未設定'
                                        }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 統計圖表區域 - 只有查看自己的資料時才顯示 -->
                <div v-if="isCurrentUser" class="grid grid-cols-9 gap-6 mb-6">
                    <!-- 發文趨勢圖 - 左側 4/9 -->
                    <div class="col-span-9 lg:col-span-4 bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">發文趨勢</h3>
                        <div class="h-64 flex items-end justify-between gap-1 overflow-x-auto">
                            <img :src="userProfile.postTrend" alt="發文趨勢圖" class="w-full rounded-lg shadow" />
                        </div>
                    </div>

                    <!-- 社群活躍度 - 中間 3/9 -->
                    <div class="col-span-9 lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">社群活躍度</h3>
                        <div class="h-64 flex items-center justify-center">
                            <div class="relative">
                                <div class="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                                    <div
                                        class="w-20 h-20 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold">
                                        {{ userStats.postCount }}
                                    </div>
                                </div>
                                <div class="absolute -bottom-6 left-0 right-0 text-center">
                                    <p class="text-sm font-medium text-gray-700">發文活躍度</p>
                                    <p class="text-xs text-gray-500">過去 30 天</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右側圖表區域 - 2/9 -->
                    <div class="col-span-9 lg:col-span-2 flex flex-col gap-6">
                        <!-- 發文時間分佈 - 右上 -->
                        <div class="bg-white rounded-lg shadow-lg p-4 flex-1">
                            <h3 class="text-base font-semibold text-gray-800 mb-3">發文時間</h3>
                            <div class="space-y-3">
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">正午</span>
                                        <span class="text-xs font-medium text-gray-700">44.7%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-amber-800 h-2 rounded-full" :style="{ width: '44.7%' }"></div>
                                    </div>
                                </div>
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">晚上</span>
                                        <span class="text-xs font-medium text-gray-700">41.2%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-gray-400 h-2 rounded-full" :style="{ width: '41.2%' }"></div>
                                    </div>
                                </div>
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">早上</span>
                                        <span class="text-xs font-medium text-gray-700">14.1%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-gray-400 h-2 rounded-full" :style="{ width: '14.1%' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 發文習慣 - 右下 -->
                        <div class="bg-white rounded-lg shadow-lg p-4 flex-1">
                            <h3 class="text-base font-semibold text-gray-800 mb-3">發文習慣</h3>
                            <div class="space-y-3">
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">正午</span>
                                        <span class="text-xs font-medium text-gray-700">44.7%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-amber-800 h-2 rounded-full" :style="{ width: '44.7%' }"></div>
                                    </div>
                                </div>
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">晚上</span>
                                        <span class="text-xs font-medium text-gray-700">41.2%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-gray-400 h-2 rounded-full" :style="{ width: '41.2%' }"></div>
                                    </div>
                                </div>
                                <div class="flex flex-col space-y-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs text-gray-600">早上</span>
                                        <span class="text-xs font-medium text-gray-700">14.1%</span>
                                    </div>
                                    <div class="bg-gray-200 rounded-full h-2">
                                        <div class="bg-gray-400 h-2 rounded-full" :style="{ width: '14.1%' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 近期發文 -->
                <div class="bg-white rounded-lg shadow-lg p-6">
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
    gender: '未設定',
    birthday: '未設定',
    relationshipStatus: '未設定',
    favoriteBoard: '未設定',
    postTrend: 'https://placehold.co/400x600'
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

// 用戶統計數據
const userStats = computed(() => {
    const userPostsCount = postsData.value.filter(post => post.authorId === displayUserId.value).length
    const userLikesCount = postsData.value
        .filter(post => post.authorId === displayUserId.value)
        .reduce((sum, post) => sum + post.likes, 0)
    const userCommentsCount = postsData.value
        .filter(post => post.authorId === displayUserId.value)
        .reduce((sum, post) => sum + post.comments.length, 0)

    return {
        postCount: userPostsCount,
        likesCount: userLikesCount,
        commentsCount: userCommentsCount
    }
})

// 用戶發文
const userPosts = computed(() => {
    const userPostsData = postsData.value.filter(post => post.authorId === displayUserId.value)

    // 按時間排序（最新的在前）
    const sortedPosts = [...userPostsData].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

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
        comments: postData.comments.length,
        shares: postData.shares,
        tags: postData.tags,
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
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
        return '1 天前'
    } else if (diffDays < 7) {
        return `${diffDays} 天前`
    } else {
        return date.toLocaleDateString('zh-TW')
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
                gender: '未知',
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
                gender: targetUser.gender || '未設定',
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
                gender: '未知',
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
            loadPostsData()
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
