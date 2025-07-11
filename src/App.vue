<template>
  <LoginView v-if="user == ''" />
  <div v-else class="min-h-screen flex flex-col bg-stone-200">
    <Header />
    <main class="flex-1 container mx-auto p-5 bg-stone-200">
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
import { provide, ref } from 'vue';

const user = ref('')
setInterval(() => {
  user.value = localStorage.getItem('user') ?? ''
}, 100);
provide('userId',user)

const users = ref([])
provide('users', users)
fetch('/data/user.json')
  .then(res => res.json())
  .then(data => {
    users.value = data
  })
  .catch(err => {
    console.error(err)
  })
</script>