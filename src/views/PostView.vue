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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Post from '../components/Post.vue'
import type { PostData, User, Post as PostType } from '../data'

const route = useRoute()
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

// Load posts data
const loadPostsData = async () => {
    try {
        const response = await fetch(`/data/post.json?$timestamp=${new Date().getTime()}`)
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
