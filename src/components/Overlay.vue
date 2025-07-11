<template>
    <div class=" fixed z-10 w-full h-full bg-gray-600/40 transition-all duration-300" @click="emit('click')">
    </div>
</template>
<script setup lang="ts">
const emit = defineEmits(['click'])
</script>