<template>
    <div class="min-h-screen">
        <!-- Board Header -->
        <div class="bg-white shadow-sm border border-green-400 rounded-lg">
            <div class="max-w-4xl mx-auto px-4 py-6">
                <div v-if="currentBoard" class="flex items-center space-x-4">
                    <div class="flex items-center justify-center w-16 h-16 rounded-full"
                        :style="{ backgroundColor: currentBoard.color + '20' }">
                        <font-awesome-icon :icon="currentBoard.icon" class="text-2xl"
                            :style="{ color: currentBoard.color }" />
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">{{ currentBoard.name }}</h1>
                        <p class="text-gray-600 mt-1">{{ currentBoard.description }}</p>
                    </div>
                </div>
                <div v-else class="text-center py-8">
                    <p class="text-gray-500">版塊不存在</p>
                </div>
            </div>
        </div>

        <!-- Board Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
            <div v-if="isLoading" class="text-center py-12">
                <div class="text-gray-400 mb-4">
                    <font-awesome-icon icon="fa-solid fa-spinner" class="text-4xl animate-spin" />
                </div>
                <p class="text-gray-500">載入中...</p>
            </div>

            <div v-else-if="currentBoard" class="space-y-6">
                <!-- Post Creation Button -->
                <div class="bg-white rounded-lg shadow-sm p-4">
                    <button @click="openCreatePostModal"
                        class="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <div class="flex items-center space-x-3">
                            <div v-if="currentUser && currentUser.avatar" class="w-8 h-8">
                                <img :src="currentUser.avatar" :alt="currentUser.name"
                                    class="w-8 h-8 rounded-full object-cover border-2 border-emerald-200" />
                            </div>
                            <div v-else class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <font-awesome-icon icon="fa-solid fa-user" class="text-gray-600" />
                            </div>
                            <span class="text-gray-500">分享你的想法...</span>
                        </div>
                    </button>
                </div>

                <!-- Posts List -->
                <div v-if="boardPosts.length > 0" class="space-y-4">
                    <Post v-for="post in boardPosts" :key="post.id" :post="post" />
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-12">
                    <div class="text-gray-400 mb-4">
                        <font-awesome-icon icon="fa-solid fa-inbox" class="text-6xl" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">目前沒有文章</h3>
                    <p class="text-gray-500">成為第一個在此版塊發表文章的人！</p>
                </div>

                <!-- Load More Button -->
                <div v-if="hasMorePosts" class="text-center">
                    <button @click="loadMorePosts"
                        class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                        查看更多文章...
                    </button>
                </div>
            </div>
        </div>

        <!-- Create Post Modal -->
        <CreatePostModal :is-visible="showCreatePostModal" :board-name="currentBoard?.name"
            @close="closeCreatePostModal" @submit="handlePostSubmit" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Post from '../components/Post.vue'
import CreatePostModal from '../components/CreatePostModal.vue'
import type { Board, PostData, User, Post as PostType } from '../data'

const route = useRoute()
const boardId = computed(() => route.params.boardId as string)

// Board data
const boards = ref<Board[]>([])
const currentBoard = computed(() => {
    return boards.value.find(board => board.id === boardId.value)
})

// Users data
const users = ref<User[]>([])
const isLoading = ref(true)

// Current user data
const currentUser = ref<User | null>(null)

// Modal state
const showCreatePostModal = ref(false)

// Pagination state
const currentPage = ref(1)
const postsPerPage = 5

// Posts data
const postsData = ref<PostData[]>([])
const filteredPosts = computed(() => {
    if (!currentBoard.value) return []
    return postsData.value.filter(post =>
        post.boardId === currentBoard.value!.id
    )
})

const totalPages = computed(() => {
    return Math.ceil(filteredPosts.value.length / postsPerPage)
})

const hasMorePosts = computed(() => {
    return currentPage.value < totalPages.value
})

const loadMorePosts = () => {
    if (hasMorePosts.value) {
        currentPage.value++
    }
}

const boardPosts = computed(() => {
    if (!currentBoard.value) return []

    // Get posts for current page
    const startIndex = 0
    const endIndex = currentPage.value * postsPerPage
    const paginatedPosts = filteredPosts.value.slice(startIndex, endIndex)

    // Convert PostData to Post format for the component
    return paginatedPosts.map(postData => ({
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
    }) as PostType)
})

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

// Load board data
const loadBoardData = async () => {
    try {
        const response = await fetch('/data/board.json')
        const data = await response.json()
        boards.value = data.boards
    } catch (error) {
        console.error('載入版塊數據失敗:', error)
    }
}

// Load users data
const loadUsersData = async () => {
    try {
        const response = await fetch('/data/user.json')
        const data = await response.json()
        users.value = data

        // 載入當前用戶
        const currentUserId = localStorage.getItem('user')
        if (currentUserId) {
            currentUser.value = users.value.find(u => u.id === currentUserId) || null
        }
    } catch (error) {
        console.error('載入用戶數據失敗:', error)
    }
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

// Modal methods
const openCreatePostModal = () => {
    showCreatePostModal.value = true
}

const closeCreatePostModal = () => {
    showCreatePostModal.value = false
}

const handlePostSubmit = (formData: { title: string; content: string; tags: string[] }) => {
    // 模擬發文成功的提示
    console.log('發文成功！', formData)
    // 可以在這裡添加實際的發文邏輯
    closeCreatePostModal()
}

onMounted(async () => {
    try {
        await Promise.all([
            loadBoardData(),
            loadUsersData(),
            loadPostsData()
        ])
        // 模仿真實網站載入延遲
        await new Promise(resolve => setTimeout(resolve, 500))
        document.title = `${(currentBoard.value || {}).name ?? '找不到頁面'} | 成仁樹洞`
    } catch (error) {
        console.error('載入數據時發生錯誤:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>