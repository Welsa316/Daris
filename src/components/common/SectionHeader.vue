<template>
  <div :class="['mb-12 md:mb-16', centered ? 'max-w-2xl mx-auto text-center' : 'max-w-2xl']">
    <p
      v-if="eyebrow"
      class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-3"
    >
      {{ eyebrow }}
    </p>
    <h2 class="heading-display text-3xl sm:text-4xl text-slate-900 mb-4 text-balance leading-[1.15]">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-base text-slate-500 leading-relaxed"
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  description: { type: String, default: '' },
  centered: { type: Boolean, default: true }
});
</script>
