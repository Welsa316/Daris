<template>
  <section class="relative overflow-hidden" :class="sectionBg">
    <div class="grid md:grid-cols-2 min-h-[520px] md:min-h-[600px]">
      <!-- Visual half — full bleed -->
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
        <!-- Solid color fill when no image — no pattern, no clutter -->
        <div v-else class="absolute inset-0" :class="fillClass" aria-hidden="true"></div>
        <!-- Subtle vignette for depth -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-black/4" aria-hidden="true"></div>
      </div>

      <!-- Text half — generous padding, left-aligned -->
      <div
        :class="[
          'flex items-center',
          reversed ? 'md:order-1' : 'md:order-2'
        ]"
      >
        <div
          class="px-8 md:px-16 lg:px-24 py-20 md:py-28 max-w-xl"
          :class="reversed ? 'ltr:md:ml-auto rtl:md:mr-auto' : ''"
          data-reveal
        >
          <p class="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold mb-4">
            {{ $t(eyebrowKey) }}
          </p>
          <h2 class="heading-display text-3xl md:text-4xl lg:text-5xl leading-[1.12] mb-6" :class="textColor">
            {{ $t(titleKey) }}
          </h2>
          <p class="text-base md:text-lg leading-relaxed" :class="bodyColor">
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
    case 'light': return 'bg-cream-100';
    case 'deep': return 'bg-primary-50';
    default: return 'bg-cream';
  }
});

// Solid fills — no pattern overlay, each surface is visually distinct
const fillClass = computed(() => {
  switch (props.surface) {
    case 'warm': return 'bg-primary-800';
    case 'light': return 'bg-cream-200';
    case 'deep': return 'bg-primary-950';
    default: return 'bg-primary-800';
  }
});

const textColor = computed(() => {
  return 'text-slate-900';
});

const bodyColor = computed(() => {
  return 'text-slate-500';
});
</script>
