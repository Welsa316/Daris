<template>
  <!-- COUNTRIES + CTA — One continuous dark section.
       Large inline SVG world map with gold dot markers, flowing into "Ready to begin?" CTA. -->
  <section class="relative overflow-hidden bg-primary-950">
    <!-- Grain texture -->
    <div class="absolute inset-0 grain-texture opacity-30 pointer-events-none" aria-hidden="true"></div>

    <!-- Subtle radial glow behind CTA area -->
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gold/[0.03] blur-[160px]" aria-hidden="true"></div>

    <div class="relative z-10 py-24 md:py-32">

      <!-- ─── Large heading ─── -->
      <h2
        class="heading-display text-4xl md:text-5xl lg:text-6xl text-cream text-center mb-16 md:mb-24 px-6"
        data-reveal
      >
        {{ $t('home.countriesLabel') }}
      </h2>

      <!-- ─── DESKTOP: SVG world map with markers ─── -->
      <div
        class="hidden md:block relative mx-auto max-w-5xl px-6"
        dir="ltr"
        data-reveal
        data-reveal-delay="100"
      >
        <div
          class="relative w-full aspect-[2/1]"
          role="img"
          :aria-label="$t('home.countriesLabel') + ': ' + countryMarkers.map(m => $t('home.countries.' + m.key)).join(', ')"
        >
          <!-- Accurate Natural Earth world map SVG -->
          <WorldMapSvg class="absolute inset-0 w-full h-full opacity-[0.25]" aria-hidden="true" />

          <!-- Country markers — static gold dots with labels -->
          <div
            v-for="marker in countryMarkers"
            :key="marker.key"
            class="absolute"
            :style="{
              top: marker.top + '%',
              left: marker.left + '%',
              transform: 'translate(-50%, -50%)',
            }"
          >
            <!-- Static gold dot with glow -->
            <span class="block w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(200,169,81,0.5)]"></span>

            <!-- Country label -->
            <span
              class="absolute whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.15em] text-cream/70"
              :class="labelPositionClasses(marker.labelPos)"
            >
              {{ $t('home.countries.' + marker.key) }}
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
          v-for="marker in countryMarkers"
          :key="marker.key"
          class="inline-flex items-center px-5 py-2.5 rounded-full border border-gold/25 bg-gold/[0.04] text-cream/80 font-display text-sm tracking-wide"
        >
          {{ $t('home.countries.' + marker.key) }}
        </li>
      </ul>

      <!-- ─── CTA (was BoldCTA, now merged) ─── -->
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
import WorldMapSvg from './WorldMapSvg.vue';

const { t } = useI18n();
const { whatsAppHref } = useWhatsApp();

// Geographic positions (% based on equirectangular projection in 1000x500 viewBox)
// lon_to_x = (lon + 180) / 360 * 100%
// lat_to_y = (90 - lat) / 180 * 100%
const countryMarkers = [
  { key: 'usa',          top: 28, left: 24,  labelPos: 'bottom' },  // Washington DC: 38.9°N, 77°W
  { key: 'england',      top: 21, left: 50,  labelPos: 'top' },     // London: 51.5°N, 0.1°W
  { key: 'netherlands',  top: 20, left: 51,  labelPos: 'top' },     // Amsterdam: 52.4°N, 4.9°E
  { key: 'poland',       top: 21, left: 55,  labelPos: 'bottom' },  // Warsaw: 52.2°N, 21°E
  { key: 'egypt',        top: 33, left: 59,  labelPos: 'left' },    // Cairo: 30.0°N, 31.2°E
  { key: 'saudiArabia',  top: 36, left: 63,  labelPos: 'right' },   // Riyadh: 24.7°N, 46.7°E
  { key: 'qatar',        top: 36, left: 64,  labelPos: 'bottom' },  // Doha: 25.3°N, 51.5°E
  { key: 'uzbekistan',   top: 27, left: 68,  labelPos: 'top' },     // Tashkent: 41.3°N, 69.3°E
  { key: 'pakistan',      top: 32, left: 70,  labelPos: 'bottom' },  // Islamabad: 33.7°N, 73.0°E
];

function labelPositionClasses(pos) {
  switch (pos) {
    case 'top':    return '-top-5 left-1/2 -translate-x-1/2';
    case 'bottom': return 'top-5 left-1/2 -translate-x-1/2';
    case 'left':   return 'top-1/2 -translate-y-1/2 right-5';
    case 'right':  return 'top-1/2 -translate-y-1/2 left-5';
    default:       return '-top-5 left-1/2 -translate-x-1/2';
  }
}
</script>
