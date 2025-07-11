<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">Our Team</h2>
    <ul class="grid md:grid-cols-3 gap-6">
      <li v-for="member in members" :key="member.name" class=" bg-slate-100 border border-slate-300 hover:border-sky-500 p-4 rounded transition-shadow duration-300 h-[200px]">
        <h3 class="text-xl font-semibold">{{ member.name }}</h3>
        <p class="text-gray-700">{{ member.role }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const members = [
  { name: 'Alice', role: 'Captain' },
  { name: 'Bob', role: 'Programmer' },
  { name: 'Charlie', role: 'Mechanical Lead' },
  { name: 'Dana', role: 'Electrical Lead' },
]
</script>