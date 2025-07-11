<template>
    <div class="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm transition-all duration-300" @click="emit('click')">
    </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['click'])
</script>