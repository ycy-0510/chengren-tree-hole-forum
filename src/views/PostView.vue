<template>
    <div class="min-h-screen">
        <!-- Post Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <font-awesome-icon icon="fa-solid fa-spinner" class="text-4xl animate-spin" />
                </div>
                <p class="text-gray-500">載入中...</p>
            </div>

            <!-- Post Not Found -->
            <div v-else-if="!currentPost" class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <font-awesome-icon icon="fa-solid fa-exclamation-triangle" class="text-6xl" />
                </div>
                <h2 class="text-xl font-medium text-gray-900 mb-2">找不到文章</h2>
                <p class="text-gray-500 mb-4">此文章可能已被刪除或不存在</p>
                <RouterLink to="/" class="text-amber-600 hover:text-amber-700 font-medium">
                    返回首頁
                </RouterLink>
            </div>

            <!-- Post Display -->
            <div v-else class="space-y-6">
                <!-- Main Post -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <Post :post="currentPost" />
                </div>

                <!-- More Posts Section -->
                <div v-if="morePosts.length > 0" class="bg-white rounded-lg shadow-sm p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <font-awesome-icon icon="fa-solid fa-newspaper" class="text-amber-600 mr-2" />
                        更多文章
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="post in morePosts" :key="post.id"
                            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            @click="navigateToPost(post.id)">
                            <!-- Post Thumbnail -->
                            <div class="mb-3">
                                <div v-if="post.image" class="w-full h-32 rounded-lg overflow-hidden">
                                    <img :src="post.image" :alt="post.title"
                                        class="w-full h-full object-cover hover:scale-105 transition-transform">
                                </div>
                                <div v-else
                                    class="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                    <font-awesome-icon icon="fa-solid fa-image" class="text-gray-400 text-2xl" />
                                </div>
                            </div>

                            <!-- Post Info -->
                            <div class="space-y-2">
                                <h4
                                    class="font-medium text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors">
                                    {{ post.title }}
                                </h4>
                                <p class="text-sm text-gray-600 line-clamp-3">
                                    {{ post.content }}
                                </p>

                                <!-- Post Meta -->
                                <div class="flex items-center justify-between text-xs text-gray-500">
                                    <div class="flex items-center space-x-1">
                                        <div
                                            class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                                            <img v-if="post.avatar" :src="post.avatar" :alt="post.author"
                                                class="w-full h-full object-cover">
                                            <font-awesome-icon v-else icon="fa-solid fa-user"
                                                class="text-gray-600 text-xs" />
                                        </div>
                                        <span>{{ post.author }}</span>
                                    </div>
                                    <span>{{ formatRelativeTime(post.createdAt) }}</span>
                                </div>

                                <!-- Post Stats -->
                                <div class="flex items-center space-x-4 text-xs text-gray-500">
                                    <div class="flex items-center space-x-1">
                                        <font-awesome-icon icon="fa-solid fa-heart" />
                                        <span>{{ post.likes }}</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <font-awesome-icon icon="fa-solid fa-comments" />
                                        <span>{{ post.comments }}</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <font-awesome-icon icon="fa-solid fa-share" />
                                        <span>{{ post.shares }}</span>
                                    </div>
                                </div>

                                <!-- Tags -->
                                <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1">
                                    <span v-for="tag in post.tags.slice(0, 3)" :key="tag"
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                        #{{ tag }}
                                    </span>
                                    <span v-if="post.tags.length > 3" class="text-xs text-gray-500">
                                        +{{ post.tags.length - 3 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Post from '../components/Post.vue'
import type { PostData, User, Post as PostType } from '../data'

const route = useRoute()
const router = useRouter()
const postId = computed(() => route.params.postId as string)

// Data
const postsData = ref<PostData[]>([])
const users = ref<User[]>([])
const isLoading = ref(true)

// Current post
const currentPost = computed(() => {
    if (!postsData.value.length) return null

    const postData = postsData.value.find(post => post.id === postId.value)
    if (!postData) return null

    return convertPostDataToPost(postData)
})

// More posts (random selection excluding current post)
const morePosts = computed(() => {
    if (!postsData.value.length || !currentPost.value) return []

    // Filter out current post and get random posts
    const otherPosts = postsData.value.filter(post => post.id !== postId.value)

    // Shuffle and take 6 random posts
    const shuffled = [...otherPosts].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3).map(convertPostDataToPost)
})

// Helper function to convert PostData to Post
const convertPostDataToPost = (postData: PostData): PostType => {
    return {
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
        commentsList: postData.comments.map(comment => ({
            id: `${postData.id}_comment_${comment.userId}_${comment.time}`,
            author: getAuthorName(comment.userId),
            authorId: comment.userId,
            avatar: getAuthorAvatar(comment.userId),
            content: comment.content,
            createdAt: formatDate(comment.time)
        }))
    }
}

// Helper function to get author name from ID
const getAuthorName = (authorId: string) => {
    const user = users.value.find(u => u.id === authorId)
    return user ? user.name : '匿名用戶'
}

// Helper function to get author avatar from ID
const getAuthorAvatar = (authorId: string) => {
    const user = users.value.find(u => u.id === authorId)
    return user?.avatar
}

// Helper function to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW')
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小時前`
    if (minutes > 0) return `${minutes}分鐘前`
    return '剛剛'
}

// Navigation function
const navigateToPost = (postId: number) => {
    router.push(`/post/post_${postId.toString().padStart(3, '0')}`)
}

// Load posts data
const loadPostsData = async () => {
    try {
        const response = await fetch('/data/post.json')
        const data = await response.json()
        postsData.value = data
    } catch (error) {
        console.error('載入文章數據失敗:', error)
    }
}

// Load users data
const loadUsersData = async () => {
    try {
        const response = await fetch('/data/user.json')
        const data = await response.json()
        users.value = data
    } catch (error) {
        console.error('載入用戶數據失敗:', error)
    }
}

onMounted(async () => {
    try {
        await Promise.all([
            loadPostsData(),
            loadUsersData()
        ])

        // Set page title
        if (currentPost.value) {
            document.title = `${currentPost.value.title} | 成仁樹洞`
        } else {
            document.title = '文章不存在 | 成仁樹洞'
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
        console.error('載入數據時發生錯誤:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
