<template>
  <section class="relative overflow-hidden" :class="sectionBg">
    <div class="grid md:grid-cols-2 min-h-[520px] md:min-h-[600px]">
      <!-- Image half — full bleed, no rounding, no card -->
      <div
        :class="[
          'relative overflow-hidden',
          reversed ? 'md:order-2' : 'md:order-1'
        ]"
      >
        <img
          v-if="image"
          :src="image"
          :alt="imageAlt"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Rich gradient when no image — unique per surface variant -->
        <div v-else class="absolute inset-0" :class="gradientClass" aria-hidden="true"></div>
        <!-- Pattern texture layer -->
        <div class="absolute inset-0 hero-pattern" :class="patternOpacity" aria-hidden="true"></div>
        <!-- Subtle vignette -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" aria-hidden="true"></div>
      </div>

      <!-- Text half — generous padding, left-aligned -->
      <div
        :class="[
          'flex items-center',
          reversed ? 'md:order-1' : 'md:order-2'
        ]"
      >
        <div class="px-8 md:px-16 lg:px-24 py-20 md:py-28 max-w-xl" :class="reversed ? 'ltr:md:ml-auto rtl:md:mr-auto' : ''">
          <p class="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            {{ $t(eyebrowKey) }}
          </p>
          <h2 class="heading-display text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-[1.12] mb-6">
            {{ $t(titleKey) }}
          </h2>
          <p class="text-base md:text-lg text-slate-500 leading-relaxed">
            {{ $t(bodyKey) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  eyebrowKey: { type: String, required: true },
  titleKey: { type: String, required: true },
  bodyKey: { type: String, required: true },
  image: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
  surface: {
    type: String,
    default: 'warm',
    validator: (v) => ['warm', 'light', 'deep'].includes(v)
  }
});

const sectionBg = computed(() => {
  switch (props.surface) {
    case 'light': return 'bg-white';
    case 'deep': return 'bg-primary-50';
    default: return 'bg-cream';
  }
});

const gradientClass = computed(() => {
  switch (props.surface) {
    case 'warm': return 'bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600';
    case 'light': return 'bg-gradient-to-br from-cream-200 via-cream-300 to-gold-50';
    case 'deep': return 'bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800';
    default: return 'bg-gradient-to-br from-primary-800 to-primary-600';
  }
});

const patternOpacity = computed(() => {
  switch (props.surface) {
    case 'light': return 'opacity-60';
    default: return 'opacity-20';
  }
});
</script>
