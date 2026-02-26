<template>
  <section class="relative overflow-hidden bg-primary">
    <div class="absolute inset-0 hero-pattern opacity-40" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/30 to-primary-900/40" aria-hidden="true"></div>

    <div class="section-container relative py-20 md:py-28">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-center">
        <div v-for="stat in stats" :key="stat.labelKey">
          <p class="heading-display text-4xl md:text-5xl text-gold mb-2">
            {{ $t(stat.valueKey) }}
          </p>
          <p class="text-sm text-cream/60 tracking-wide">
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
