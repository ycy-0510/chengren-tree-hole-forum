<template>
  <LoginView v-if="user == '' && path != '/'" />
  <div v-else class="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <Header />
    <main class="flex-1 container p-6 lg:ps-72 md:pe-52">
      <RouterView />
    </main>
    <Footer />
    <AiChat />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import AiChat from './components/AiChat.vue';
import LoginView from './views/LoginView.vue';
import { ref } from 'vue';
import router from './router';

const path = ref('')

router.afterEach((to, _, __) => {
  path.value = to.path
  console.log(path.value)
  document.title = `${String(to.name)} | 成仁樹洞`
})

const user = ref('')
setInterval(() => {
  user.value = localStorage.getItem('user') ?? ''
}, 100)
</script>