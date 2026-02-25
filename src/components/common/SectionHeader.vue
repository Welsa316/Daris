<template>
  <div :class="['max-w-2xl mb-10', centered ? 'mx-auto text-center' : '']">
    <p
      v-if="eyebrow"
      class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2"
    >
      {{ eyebrow }}
    </p>
    <h2 class="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3 text-balance leading-snug">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-sm sm:text-base text-slate-600 leading-relaxed"
    >
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
  },
  centered: {
    type: Boolean,
    default: true
  }
});
</script>
