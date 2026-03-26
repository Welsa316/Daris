<template>
  <!-- COUNTRIES REACH — Dark editorial band showcasing global student reach.
       Each country displayed as an individual gold-bordered chip with staggered reveal. -->
  <section class="relative overflow-hidden bg-primary-950 py-20 md:py-28">
    <!-- Islamic geometric pattern overlay -->
    <div class="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden="true">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="countriesPattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26" fill="none" stroke="#C8A951" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#countriesPattern)" />
      </svg>
    </div>

    <!-- Subtle grain texture -->
    <div class="absolute inset-0 grain-texture opacity-30 pointer-events-none" aria-hidden="true"></div>

    <!-- Top gold hairline -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true"></div>

    <div class="relative z-10 section-wide">
      <div class="max-w-5xl mx-auto text-center">
        <!-- Eyebrow label -->
        <p
          class="text-[10px] font-semibold tracking-[0.5em] uppercase text-gold/50 mb-10"
          data-reveal
        >
          {{ $t('home.countriesLabel') }}
        </p>

        <!-- Country chips — flowing wrap layout -->
        <ul
          class="flex flex-wrap justify-center gap-3 md:gap-4 list-none p-0 m-0"
          role="list"
          :aria-label="$t('home.countriesLabel')"
          data-reveal
          data-reveal-delay="100"
        >
          <li
            v-for="country in countries"
            :key="country"
            class="inline-flex items-center px-5 py-2.5 md:px-7 md:py-3 rounded-full border border-gold/25 bg-gold/[0.04] text-cream/80 font-display text-sm md:text-base tracking-wide hover:border-gold/50 hover:text-gold transition-all duration-300 cursor-default"
          >
            {{ country }}
          </li>
        </ul>

        <!-- Gold decorative divider below -->
        <div class="flex items-center justify-center gap-3 mt-10" aria-hidden="true" data-reveal data-reveal-delay="200">
          <div class="w-12 h-px bg-gradient-to-r from-transparent to-gold/30"></div>
          <div class="w-1.5 h-1.5 rotate-45 bg-gold/25"></div>
          <div class="w-12 h-px bg-gradient-to-l from-transparent to-gold/30"></div>
        </div>
      </div>
    </div>

    <!-- Bottom gold hairline -->
    <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const countries = computed(() => {
  const list = t('home.countriesList');
  const separator = locale.value === 'ar' ? '،' : ',';
  return list.split(separator).map(c => c.trim()).filter(Boolean);
});
</script>

