<template>
  <!-- COUNTRIES + CTA — One continuous dark section.
       3D spinning globe with gold markers, country labels surrounding it, flowing into CTA. -->
  <section class="relative overflow-hidden bg-primary-950">
    <!-- Grain texture -->
    <div class="absolute inset-0 grain-texture opacity-30 pointer-events-none" aria-hidden="true"></div>

    <!-- Subtle radial glow behind CTA area -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gold/[0.03] blur-[160px]" aria-hidden="true"></div>

    <div class="relative z-10 py-24 md:py-32">

      <!-- ─── Large heading — Cinzel Decorative to match "Language of Revelation" ─── -->
      <h2
        class="font-ornate text-4xl md:text-5xl lg:text-6xl text-cream text-center mb-12 md:mb-20 px-6 uppercase tracking-tighter"
        data-reveal
      >
        {{ $t('home.countriesLabel') }}
      </h2>

      <!-- ─── DESKTOP: 3D Globe with surrounding labels ─── -->
      <div
        class="hidden md:block mx-auto max-w-2xl px-6"
        data-reveal
        data-reveal-delay="100"
      >
        <div class="relative">
          <!-- Globe -->
          <div class="aspect-square">
            <GlobeCanvas />
          </div>

          <!-- Static country labels positioned around the globe edges -->
          <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
            <!-- Top-left cluster: Western countries -->
            <span class="globe-label" style="top: 6%; left: -2%;">
              {{ $t('home.countries.usa') }}
            </span>
            <span class="globe-label" style="top: 17%; left: -4%;">
              {{ $t('home.countries.england') }}
            </span>

            <!-- Top-right cluster: European countries -->
            <span class="globe-label" style="top: 4%; right: -2%;">
              {{ $t('home.countries.netherlands') }}
            </span>
            <span class="globe-label" style="top: 15%; right: -4%;">
              {{ $t('home.countries.poland') }}
            </span>

            <!-- Middle-right: Central Asian -->
            <span class="globe-label" style="top: 36%; right: -8%;">
              {{ $t('home.countries.uzbekistan') }}
            </span>
            <span class="globe-label" style="top: 48%; right: -6%;">
              {{ $t('home.countries.pakistan') }}
            </span>

            <!-- Bottom-right: Middle East -->
            <span class="globe-label" style="bottom: 24%; right: -2%;">
              {{ $t('home.countries.saudiArabia') }}
            </span>
            <span class="globe-label" style="bottom: 14%; right: 4%;">
              {{ $t('home.countries.qatar') }}
            </span>

            <!-- Bottom-left: North Africa -->
            <span class="globe-label" style="bottom: 20%; left: -2%;">
              {{ $t('home.countries.egypt') }}
            </span>
          </div>
        </div>
      </div>

      <!-- ─── MOBILE: Country chips fallback ─── -->
      <ul
        class="flex flex-wrap justify-center gap-3 md:hidden list-none p-0 m-0 px-6"
        role="list"
        :aria-label="$t('home.countriesLabel')"
        data-reveal
        data-reveal-delay="100"
      >
        <li
          v-for="marker in countryKeys"
          :key="marker"
          class="inline-flex items-center px-5 py-2.5 rounded-full border border-gold/25 bg-gold/[0.04] text-cream/80 font-display text-sm tracking-wide"
        >
          {{ $t('home.countries.' + marker) }}
        </li>
      </ul>

      <!-- ─── CTA (merged from BoldCTA) ─── -->
      <div class="section-wide relative text-center mt-24 md:mt-40 pb-16 md:pb-24">
        <div class="w-12 h-px bg-gold/40 mx-auto mb-12" data-reveal aria-hidden="true"></div>

        <h2
          class="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.05] mb-8 max-w-4xl mx-auto text-balance"
          data-reveal="cinematic"
        >
          {{ $t('home.ctaTitle') }}
        </h2>

        <p
          class="text-base text-cream/35 max-w-sm mx-auto mb-16"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('home.ctaText') }}
        </p>

        <div data-reveal data-reveal-delay="300">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 rounded-full bg-gold px-12 py-4.5 text-lg font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
          >
            {{ $t('home.ctaWhatsApp') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useWhatsApp } from '@/composables/useWhatsApp';
import GlobeCanvas from './GlobeCanvas.vue';

const { t } = useI18n();
const { whatsAppHref } = useWhatsApp();

const countryKeys = [
  'usa', 'england', 'netherlands', 'poland', 'egypt',
  'saudiArabia', 'qatar', 'uzbekistan', 'pakistan',
];
</script>

<style scoped>
.globe-label {
  position: absolute;
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(200, 169, 81, 0.5);
  white-space: nowrap;
}
</style>
