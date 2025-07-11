<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">Our Robots</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gray-100 p-4 rounded shadow" v-for="robot in robots" :key="robot.year">
        <h3 class="text-xl font-semibold">{{ robot.name }} ({{ robot.year }})</h3>
        <p class="text-gray-700">{{ robot.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const robots = [
  { name: 'Titan', year: 2024, description: 'High-speed scoring bot.' },
  { name: 'Atlas', year: 2023, description: 'Heavy-lift climbing bot.' },
]
</script>