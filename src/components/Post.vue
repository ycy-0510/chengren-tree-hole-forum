<template>
    <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <!-- Post Header -->
        <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img v-if="post.avatar" :src="post.avatar" :alt="post.author" class="w-full h-full object-cover">
                <font-awesome-icon v-else icon="fa-solid fa-user" class="text-gray-600" />
            </div>
            <div>
                <RouterLink :to="`/profile/${post.authorId}`">
                    <div class="flex items-center space-x-1">
                        <p class="font-medium text-gray-900 hover:text-green-600">{{ post.author }}</p>
                        <font-awesome-icon v-if="post.authorId === 'admin'" icon="fa-solid fa-check-circle"
                            class="text-blue-500 text-sm" title="管理員驗證" />
                    </div>
                </RouterLink>
                <p class="text-sm text-gray-500">{{ post.createdAt }}</p>
            </div>
        </div>

        <!-- Post Content -->
        <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ post.title }}</h3>
            <p class="text-gray-700 leading-relaxed mb-3">{{ post.content }}</p>

            <!-- Post Image -->
            <div v-if="post.image" class="mt-3">
                <img :src="post.image" :alt="post.title"
                    class="w-full max-w-lg rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    @click="openImageModal(post.image)">
            </div>

            <!-- Tags -->
            <div v-if="post.tags && post.tags.length > 0" class="mt-3">
                <div class="flex flex-wrap gap-2">
                    <span v-for="tag in post.tags" :key="tag"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
                        #{{ tag }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Post Actions -->
        <div class="flex items-center space-x-6 text-sm text-gray-500">
            <button class="flex items-center space-x-1 hover:text-amber-600 transition-colors">
                <font-awesome-icon icon="fa-solid fa-heart" />
                <span>{{ post.likes }}</span>
            </button>
            <button @click="toggleComments" class="flex items-center space-x-1 hover:text-amber-600 transition-colors">
                <font-awesome-icon icon="fa-solid fa-comments" />
                <span>{{ post.comments }}</span>
            </button>
            <button @click="share(post.title)"
                class="flex items-center space-x-1 hover:text-amber-600 transition-colors">
                <font-awesome-icon icon="fa-solid fa-share" />
                <span>分享</span>
                <span>{{ post.shares }}</span>
            </button>
        </div>

        <!-- Comments Section -->
        <div v-if="showComments && post.commentsList && post.commentsList.length > 0"
            class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-medium text-gray-700">評論 ({{ post.commentsList.length }})</h4>
                <button @click="toggleComments" class="text-sm text-gray-500 hover:text-gray-700">
                    <font-awesome-icon icon="fa-solid fa-chevron-up" />
                </button>
            </div>
            <div class="space-y-3">
                <div v-for="comment in post.commentsList" :key="comment.id"
                    class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div
                        class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img v-if="comment.avatar" :src="comment.avatar" :alt="comment.author"
                            class="w-full h-full object-cover">
                        <font-awesome-icon v-else icon="fa-solid fa-user" class="text-gray-600 text-sm" />
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-1">
                            <RouterLink :to="`/profile/${comment.authorId}`">
                                <div class="flex items-center space-x-1">
                                    <span class="text-sm font-medium text-gray-900 hover:text-green-600"> {{ comment.author }}</span>
                                    <font-awesome-icon v-if="comment.authorId === 'admin'"
                                        icon="fa-solid fa-check-circle" class="text-blue-500 text-xs" title="管理員驗證" />
                                </div>
                            </RouterLink>
                            <span class="text-xs text-gray-500">{{ comment.createdAt }}</span>
                        </div>
                        <p class="text-sm text-gray-700">{{ comment.content }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal"
            class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            @click="closeImageModal">
            <div class="relative max-w-4xl max-h-full">
                <img :src="selectedImage || ''" :alt="'放大圖片'"
                    class="max-w-full max-h-full object-contain rounded-lg shadow-2xl">
                <button @click="closeImageModal"
                    class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors">
                    <font-awesome-icon icon="fa-solid fa-times" class="text-2xl" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Post } from '../data'

// Props
defineProps<{
    post: Post
}>()

// Image modal state
const showImageModal = ref(false)
const selectedImage = ref<string | null>(null)

// Comments state
const showComments = ref(false)

// Image modal functions
const openImageModal = (imageUrl: string) => {
    selectedImage.value = imageUrl
    showImageModal.value = true
}

const closeImageModal = () => {
    showImageModal.value = false
    selectedImage.value = null
}

// Toggle comments visibility
const toggleComments = () => {
    showComments.value = !showComments.value
}

// Share function
const share = async (text: string) => {
    const shareData = {
        title: '成仁樹洞',
        text: text,
        url: location.href
    }
    try {
        await navigator.share(shareData)
    } catch (error) {
        console.error('分享失敗:', error)
    }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>