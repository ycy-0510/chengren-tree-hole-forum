<template>
    <div v-if="isVisible" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/70 bg-opacity-50 transition-opacity" @click="closeModal"></div>
        
        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(max(80vh,630px))] overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between py-2 px-4 border-b border-gray-200">
                    <h2 class="text-xl font-semibold text-gray-900">發表新文章</h2>
                    <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <font-awesome-icon icon="fa-solid fa-times" class="text-xl" />
                    </button>
                </div>

                <!-- Content -->
                <div class="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <form @submit.prevent="submitPost" class="space-y-1">
                        <!-- Title Input -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                                標題 <span class="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                v-model="form.title"
                                type="text"
                                placeholder="為你的文章取個標題..."
                                class="w-full px-4 py-3 border border-gray-300 focus:border-green-600 focus: rounded-lg transition-colors"
                                required
                            />
                        </div>

                        <!-- Content Input -->
                        <div>
                            <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                                內容 <span class="text-red-500">*</span>
                            </label>
                            <textarea
                                id="content"
                                v-model="form.content"
                                rows="8"
                                placeholder="分享你的想法..."
                                class="w-full px-4 py-3 border border-gray-300 focus:border-green-600 focus: rounded-lg transition-colors resize-none"
                                required
                            ></textarea>
                        </div>

                        <!-- Tags Input -->
                        <div>
                            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                                標籤
                            </label>
                            <div class="space-y-3">
                                <input
                                    v-model="tagInput"
                                    type="text"
                                    placeholder="輸入標籤，按 Enter 新增"
                                    class="w-full px-4 py-3 border border-gray-300 focus:border-green-600 focus: rounded-lg transition-colors"
                                    @keydown.enter.prevent="addTag"
                                />
                                
                                <!-- Tags Display -->
                                <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
                                    <span
                                        v-for="(tag, index) in form.tags"
                                        :key="index"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                    >
                                        #{{ tag }}
                                        <button
                                            type="button"
                                            @click="removeTag(index)"
                                            class="ml-2 text-green-600 hover:text-green-800 transition-colors"
                                        >
                                            <font-awesome-icon icon="fa-solid fa-times" class="text-xs" />
                                        </button>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Board Display -->
                        <div v-if="boardName" class="p-4 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-2">
                                <font-awesome-icon icon="fa-solid fa-clipboard-list" class="text-gray-500" />
                                <span class="text-sm text-gray-600">發表到：</span>
                                <span class="text-sm font-medium text-gray-900">{{ boardName }}</span>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between py-3 px-4 border-t border-gray-200 bg-gray-50">
                    <div class="text-sm text-gray-500">
                        <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
                        請遵守社群規範，友善發言
                    </div>
                    <div class="flex space-x-3">
                        <button
                            type="button"
                            @click="closeModal"
                            class="px-6 py-2 border border-gray-300 focus:border-green-600 focus: text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            @click="submitPost"
                            :disabled="!isFormValid"
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            發表文章
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Props
interface Props {
    isVisible: boolean
    boardName?: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    close: []
    submit: [formData: {
        title: string
        content: string
        tags: string[]
    }]
}>()

// Form data
const form = ref({
    title: '',
    content: '',
    tags: [] as string[]
})

const tagInput = ref('')

// Computed
const isFormValid = computed(() => {
    return form.value.title.trim() !== '' && form.value.content.trim() !== ''
})

// Methods
const closeModal = () => {
    emit('close')
}

const addTag = () => {
    const tag = tagInput.value.trim()
    if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
        form.value.tags.push(tag)
        tagInput.value = ''
    }
}

const removeTag = (index: number) => {
    form.value.tags.splice(index, 1)
}

const submitPost = () => {
    if (!isFormValid.value) return
    
    emit('submit', {
        title: form.value.title,
        content: form.value.content,
        tags: form.value.tags
    })
    
    // Reset form
    form.value.title = ''
    form.value.content = ''
    form.value.tags = []
    tagInput.value = ''
    
    closeModal()
}

// Reset form when modal closes
watch(() => props.isVisible, (newValue) => {
    if (!newValue) {
        form.value.title = ''
        form.value.content = ''
        form.value.tags = []
        tagInput.value = ''
    }
    
    // 控制頁面滾動
    if (newValue) {
        // 開啟模態框時禁用背景滾動
        document.body.style.overflow = 'hidden'
    } else {
        // 關閉模態框時恢復背景滾動
        document.body.style.overflow = 'auto'
    }
})

// 確保組件銷毀時恢復滾動
onUnmounted(() => {
    document.body.style.overflow = 'auto'
})
</script>
