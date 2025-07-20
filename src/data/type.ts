// 用戶相關接口
export interface User {
    id: string
    name: string
    avatar: string
    password: string
    grade?: string
    birthday?: string
    relationshipStatus?: string
    favoriteBoard?: string
    postTrend?: string
    selfIntro?: string
}

// 評論接口
export interface Comment {
    id: string
    author: string
    authorId: string
    avatar?: string
    content: string
    createdAt: string
}

// 原始評論數據接口（從JSON文件中的格式）
export interface CommentData {
    userId: string
    time: string
    content: string
}

// 原始文章數據接口（從JSON文件讀取的格式）
export interface PostData {
    id: string
    boardId: string
    authorId: string
    title: string
    content: string
    image: string | null
    tags: string[]
    label: string
    createdAt: string
    likes: number
    shares: number
    comments: CommentData[]
    isPinned?: boolean // 是否置頂
}

// 組件使用的文章接口（經過處理的格式）
export interface Post {
    id: number
    title: string
    content: string
    image: string | null
    author: string
    authorId: string
    avatar?: string
    createdAt: string
    likes: number
    comments: number
    shares: number
    tags?: string[]
    commentsList?: Comment[]
    // 用於顯示的假留言數（可選，如果不設定則使用實際留言數）
    displayComments?: number
    isPinned?: boolean // 是否置頂
}

// 版塊接口
export interface Board {
    id: string
    name: string
    path: string
    description: string
    icon: string
    color: string
    createdAt: string
}

// 版塊分類接口
export interface Category {
    id: string
    name: string
    boards: string[]
}

// 版塊設置接口
export interface BoardSettings {
    defaultBoard: string
    allowAnonymousPost: boolean
    maxPostLength: number
    maxCommentLength: number
    postCooldownMinutes: number
    commentCooldownMinutes: number
}

// 版塊數據接口（從JSON文件讀取的格式）
export interface BoardData {
    boards: Board[]
    categories: Category[]
    settings: BoardSettings
}

// 用戶統計數據接口
export interface UserStats {
    postCount: number
    likesCount: number
    commentsCount: number
}

// 全局統計數據接口
export interface GlobalStats {
    totalPosts: number
    totalLikes: number
    totalComments: number
    totalUsers: number
}