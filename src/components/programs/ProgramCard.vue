<template>
  <article
    class="flex flex-col rounded-2xl bg-white border border-emerald-900/5 shadow-sm hover:shadow-soft-lg transition-shadow"
  >
    <div class="p-5 flex-1 flex flex-col">
      <h3 class="text-lg font-semibold text-slate-900 mb-1">
        {{ title }}
      </h3>
      <p class="text-xs font-medium uppercase tracking-[0.16em] text-gold mb-3">
        {{ tag }}
      </p>
      <p class="text-sm text-slate-700 mb-4">
        {{ description }}
      </p>
      <ul v-if="bullets && bullets.length" class="space-y-1.5 text-sm text-slate-700 mb-4">
        <li v-for="item in bullets" :key="item" class="flex gap-2">
          <span class="mt-1 h-1 w-4 rounded-full bg-gold" aria-hidden="true"></span>
          <span>{{ item }}</span>
        </li>
      </ul>
      <p v-if="note" class="mt-auto text-xs text-slate-500">
        {{ note }}
      </p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  bullets: {
    type: Array,
    default: () => []
  },
  note: {
    type: String,
    default: ''
  }
});
</script>

