<template>
  <div class="text-center max-w-2xl mx-auto mb-8">
    <p v-if="eyebrow" class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
      {{ eyebrow }}
    </p>
    <h2 class="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
      {{ title }}
    </h2>
    <p v-if="description" class="text-sm sm:text-base text-slate-600">
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  eyebrow: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
});
</script>

