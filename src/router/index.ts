import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import MemberView from '@/views/MemberView.vue'
import RobotsView from '@/views/RobotsView.vue'
import ContactView from '@/views/ContactView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView },
  { path: '/member', name: 'Member', component: MemberView },
  { path: '/robots', name: 'Robots', component: RobotsView },
  { path: '/contact', name: 'Contact', component: ContactView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router