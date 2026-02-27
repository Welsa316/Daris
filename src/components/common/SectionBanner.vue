<template>
  <section class="relative overflow-hidden bg-primary py-20 md:py-24">
    <!-- Subtle depth — no pattern, clean surface -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/20 to-primary-900/40" aria-hidden="true"></div>
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>

    <div class="section-container relative text-center">
      <p
        v-if="eyebrow"
        class="text-gold/80 text-xs font-semibold tracking-[0.25em] uppercase mb-3"
      >
        {{ eyebrow }}
      </p>
      <h1 class="heading-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.15] mb-4 text-balance">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-base text-cream/65 max-w-lg mx-auto leading-relaxed"
      >
        {{ description }}
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  description: { type: String, default: '' }
});
</script>
