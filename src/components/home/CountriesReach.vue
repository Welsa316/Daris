<template>
  <!-- COUNTRIES REACH — Dark editorial band with world map and country markers.
       Desktop: cosmic map with gold pulsing dots at geographic positions.
       Mobile: gold-bordered country chips in flowing wrap layout. -->
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
      <div class="max-w-6xl mx-auto text-center">
        <!-- Eyebrow label -->
        <p
          class="text-[10px] font-semibold tracking-[0.5em] uppercase text-gold/50 mb-10 md:mb-14"
          data-reveal
        >
          {{ $t('home.countriesLabel') }}
        </p>

        <!-- ─── DESKTOP: World map with positioned markers ─── -->
        <div
          class="hidden md:block relative mx-auto max-w-5xl"
          dir="ltr"
          data-reveal
          data-reveal-delay="100"
        >
          <!-- Map container with fixed aspect ratio -->
          <div
            class="relative w-full aspect-[2/1]"
            role="img"
            :aria-label="$t('home.countriesLabel') + ': ' + countryMarkers.map(m => $t('home.countries.' + m.key)).join(', ')"
          >
            <!-- World map background -->
            <img
              src="/images/world-map.png"
              alt=""
              aria-hidden="true"
              loading="lazy"
              width="512"
              height="512"
              class="world-map absolute inset-0 w-full h-full object-contain"
            />

            <!-- Country markers -->
            <div
              v-for="(marker, index) in countryMarkers"
              :key="marker.key"
              class="absolute flex flex-col items-center"
              :class="labelClasses(marker.labelPos)"
              :style="{
                top: marker.top + '%',
                left: marker.left + '%',
                transform: 'translate(-50%, -50%)',
              }"
            >
              <!-- Pulsing glow behind dot -->
              <span
                class="absolute w-8 h-8 rounded-full bg-gold/10 animate-map-pulse"
                :style="{ animationDelay: index * 300 + 'ms' }"
                aria-hidden="true"
              ></span>

              <!-- Gold dot -->
              <span class="relative w-2 h-2 rounded-full bg-gold shadow-[0_0_6px_rgba(200,169,81,0.6)]"></span>

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
          class="flex flex-wrap justify-center gap-3 md:hidden list-none p-0 m-0"
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

        <!-- Gold decorative divider below -->
        <div class="flex items-center justify-center gap-3 mt-10 md:mt-14" aria-hidden="true" data-reveal data-reveal-delay="200">
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Geographic positions (% relative to map container)
const countryMarkers = [
  { key: 'usa',          top: 38, left: 22,  labelPos: 'bottom' },
  { key: 'england',      top: 26, left: 46,  labelPos: 'top' },
  { key: 'netherlands',  top: 24, left: 49,  labelPos: 'top' },
  { key: 'poland',       top: 27, left: 52,  labelPos: 'bottom' },
  { key: 'egypt',        top: 46, left: 54,  labelPos: 'left' },
  { key: 'saudiArabia',  top: 48, left: 58,  labelPos: 'right' },
  { key: 'qatar',        top: 52, left: 57,  labelPos: 'bottom' },
  { key: 'uzbekistan',   top: 32, left: 63,  labelPos: 'top' },
  { key: 'pakistan',      top: 40, left: 66,  labelPos: 'bottom' },
];

// Label position classes for avoiding collisions
function labelClasses(pos) {
  return pos === 'left' || pos === 'right' ? 'flex-row' : 'flex-col';
}

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

<style scoped>
.world-map {
  filter: brightness(0.8) sepia(0.5) hue-rotate(-20deg) saturate(1.5);
  mix-blend-mode: screen;
  opacity: 0.15;
}
</style>
