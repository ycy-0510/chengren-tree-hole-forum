<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-white">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <font-awesome-icon icon="fa-solid fa-seedling" class="text-lg sm:text-2xl" />
        </div>
        <div class="text-center sm:text-left">
          <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">歡迎來到成仁樹洞</h1>
          <p class="text-emerald-100 mt-1 sm:mt-2 text-sm sm:text-base">一個安全、匿名的分享空間</p>
        </div>
      </div>
      <p
        class="text-base sm:text-lg md:text-xl text-emerald-100 mb-6 max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
        在這裡，你可以自由地分享想法、尋求建議，或者只是找個地方傾訴。每個聲音都值得被聽見，每個故事都值得被分享。
      </p>
      <div class="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
        <span class="bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">🤫 完全匿名</span>
        <span class="bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">💭 自由分享</span>
        <span class="bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">🤝 互相支持</span>
      </div>
    </div>

    <!-- All Posts Section -->
    <div class="bg-white rounded-xl shadow-lg border border-emerald-100 p-4 sm:p-6">
      <div class="flex items-center gap-3 mb-4 sm:mb-6">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <font-awesome-icon icon="fa-solid fa-clock" class="text-emerald-600 text-sm sm:text-base" />
        </div>
        <h2 class="text-lg sm:text-xl font-semibold text-gray-800">最新文章</h2>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="text-gray-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-spinner" class="text-3xl animate-spin" />
        </div>
        <p class="text-gray-500">載入中...</p>
      </div>

      <!-- Posts List -->
      <div v-else-if="allPosts.length > 0" class="space-y-4">
        <Post v-for="post in allPosts" :key="post.id" :post="post" />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <div class="text-gray-400 mb-4">
          <font-awesome-icon icon="fa-solid fa-inbox" class="text-4xl" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">目前沒有文章</h3>
        <p class="text-gray-500">成為第一個發表文章的人！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Post from '../components/Post.vue'
import type { User, PostData, Post as PostType } from '../data'

// Users data
const users = ref<User[]>([])
const isLoading = ref(true)

// Posts data
const postsData = ref<PostData[]>([])
const allPosts = computed(() => {
  // Sort posts by creation time (newest first)
  const sortedPosts = [...postsData.value].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Take only the latest 10 posts
  const latestPosts = sortedPosts.slice(0, 10)

  // Convert PostData to Post format for the component
  return latestPosts.map(postData => ({
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

onMounted(async () => {
  try {
    await Promise.all([
      loadUsersData(),
      loadPostsData()
    ])
    // 模仿真實網站載入延遲
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('載入數據時發生錯誤:', error)
  } finally {
    isLoading.value = false
  }
})
</script>