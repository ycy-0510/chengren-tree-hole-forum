<template>
    <div class=" fixed z-10 w-full h-full bg-theme-green-dark/30 transition-all duration-300" @click="emit('click')">
    </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['click'])
</script>