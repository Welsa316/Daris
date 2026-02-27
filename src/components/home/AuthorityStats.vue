<template>
  <section class="relative overflow-hidden">
    <!-- Horizontal gradient — distinct from hero's vertical -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900" aria-hidden="true"></div>
    <!-- Grain texture -->
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
    <!-- Subtle top/bottom borders via gradient -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>
    <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

    <div class="section-wide relative py-20 md:py-28">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
        <div
          v-for="(stat, i) in stats"
          :key="stat.labelKey"
          class="text-center md:text-left"
          data-reveal="fade"
          :data-reveal-delay="i * 120"
        >
          <p class="heading-display text-5xl md:text-6xl text-gold font-bold mb-3 leading-none">
            {{ $t(stat.valueKey) }}
          </p>
          <p class="text-xs text-cream/50 tracking-wide uppercase">
            {{ $t(stat.labelKey) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const stats = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
  { valueKey: 'home.stat4Value', labelKey: 'home.stat4Label' }
];
</script>
