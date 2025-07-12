import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: '首頁', component: () => import('@/views/HomeView.vue') },
  { path: '/board/:boardId', name: '版面', component: () => import('@/views/BoardView.vue') },
  { path: '/profile', name: '個人帳號', component: () => import('@/views/ProfileView.vue') },
  { path: '/profile/:userId', name: '個人頁面', component: () => import('@/views/ProfileView.vue') },
  //if not found, redirect to home
  { path: '/:catchAll(.*)', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router