<template>
  <section :class="bgClass">
    <div class="section-container py-24 md:py-32">
      <div class="grid gap-12 lg:gap-20 md:grid-cols-2 items-center">
        <!-- Image -->
        <div :class="reversed ? 'md:order-2' : 'md:order-1'">
          <div class="relative">
            <div class="absolute -inset-6 rounded-3xl bg-primary/[0.03] blur-2xl" aria-hidden="true"></div>
            <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200 shadow-card">
              <img
                v-if="image"
                :src="image"
                :alt="imageAlt"
                class="h-full w-full object-cover"
              />
              <div v-else class="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/[0.06] to-primary/[0.02]">
                <div class="text-center p-8">
                  <div class="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
                    <span v-html="icon" class="text-primary"></span>
                  </div>
                  <p class="text-xs text-slate-400 uppercase tracking-widest">{{ $t(placeholderKey) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Text -->
        <div :class="reversed ? 'md:order-1' : 'md:order-2'">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            {{ $t(eyebrowKey) }}
          </p>
          <h2 class="heading-display text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-6 leading-[1.15]">
            {{ $t(titleKey) }}
          </h2>
          <p class="text-base md:text-lg text-slate-500 leading-relaxed max-w-md">
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
  icon: { type: String, default: '' },
  placeholderKey: { type: String, default: '' },
  reversed: { type: Boolean, default: false },
  bg: { type: String, default: 'cream' }
});

const bgClass = computed(() =>
  props.bg === 'white' ? 'bg-white' : 'bg-cream'
);
</script>
