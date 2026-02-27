<template>
  <!-- Why Daris — photo-as-card on bright patterned surface.
       Layout: white/cream bg with low-opacity Islamic geometric pattern.
       Single centred card where the photo IS the surface — text overlaid
       on the image with a dark gradient for readability.
       Floating Al-Azhar badge on card edge.
       Stats staggered 2-col inside the card. -->

  <!-- Top transition band -->
  <div class="h-10 md:h-14 bg-cream-50" aria-hidden="true"></div>

  <section class="relative overflow-hidden bg-white py-20 md:py-28 lg:py-32">

    <!-- ── Islamic geometric pattern overlay (bright on white) ── -->
    <div
      class="absolute inset-0 opacity-[0.045]"
      :style="patternStyle"
      aria-hidden="true"
    ></div>

    <!-- Soft gold radial glow centred behind the card -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gold/[0.07] blur-[140px]"
      aria-hidden="true"
    ></div>

    <!-- ── Card ── -->
    <div class="relative z-10 section-container">
      <div class="relative max-w-5xl mx-auto">

        <!-- ── Floating credential badge ──
             Anchored to card top-left, overlapping edge. -->
        <div
          class="absolute -top-5 left-4 sm:left-8 md:left-10 z-30"
          data-reveal
        >
          <div class="flex items-stretch rounded-lg bg-primary-950/95 backdrop-blur-sm shadow-xl shadow-black/25 ring-1 ring-gold/20">
            <div class="w-1 rounded-l-lg bg-gold shrink-0" aria-hidden="true"></div>
            <div class="px-4 py-3 sm:px-5 sm:py-3.5">
              <p class="text-[10px] font-semibold tracking-[0.25em] uppercase text-gold leading-tight mb-0.5">
                {{ $t('home.azharTitle') }}
              </p>
              <p class="text-[11px] text-cream/45 leading-snug max-w-[260px]">
                {{ $t('home.azharBody') }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Photo card — image is the surface ── -->
        <div class="relative rounded-2xl md:rounded-3xl shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-black/[0.06]">

          <!-- Background photo -->
          <img
            src="/images/islamic-study.png"
            :alt="$t('home.credibilityImageAlt')"
            class="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />

          <!-- Dark overlay gradient for text readability -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/70"
            aria-hidden="true"
          ></div>

          <!-- Grain texture over photo -->
          <div class="absolute inset-0 grain-texture opacity-35" aria-hidden="true"></div>

          <!-- ── Content overlaid on the photo ── -->
          <div class="relative z-10 px-7 sm:px-10 md:px-14 lg:px-20 pt-16 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">

            <!-- Heading -->
            <h2
              class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream leading-[1.08] mb-12 md:mb-16 max-w-xl"
              data-reveal="cinematic"
            >
              {{ $t('home.credibilityTitle') }}
            </h2>

            <!-- Stats — staggered 2-column -->
            <div
              class="grid grid-cols-2 gap-x-8 md:gap-x-14 max-w-lg"
              data-reveal
              data-reveal-delay="150"
            >
              <div
                v-for="(stat, i) in stats"
                :key="stat.labelKey"
                :class="[
                  'flex flex-col',
                  i < 2 ? 'mb-9 md:mb-11' : '',
                  i % 2 === 1 ? 'md:translate-y-5' : ''
                ]"
              >
                <!-- Hairline divider — alternating gold / cream -->
                <div
                  class="h-px mb-4 md:mb-5"
                  :class="[
                    i % 2 === 0 ? 'w-10 bg-gold/50' : 'w-7 bg-cream/20'
                  ]"
                  aria-hidden="true"
                ></div>
                <p class="heading-display text-2xl sm:text-3xl md:text-4xl text-cream font-bold leading-none mb-1.5">
                  {{ $t(stat.valueKey) }}
                </p>
                <p class="text-[10px] text-cream/35 tracking-[0.2em] uppercase">
                  {{ $t(stat.labelKey) }}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

  </section>

  <!-- Bottom transition band -->
  <div class="h-10 md:h-14 bg-cream-50" aria-hidden="true"></div>
</template>

<script setup>
const stats = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
  { valueKey: 'home.stat4Value', labelKey: 'home.stat4Label' }
];

// Islamic geometric star pattern — 8-pointed star tessellation.
// Gold strokes on white = bright, airy. Tiles at 80×80.
const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23C8A951' stroke-width='0.5'><polygon points='40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26'/><polygon points='40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5'/><polygon points='0,0 6.5,14 0,18 -6.5,14'/><polygon points='80,0 86.5,14 80,18 73.5,14'/><polygon points='0,80 6.5,66 0,62 -6.5,66'/><polygon points='80,80 86.5,66 80,62 73.5,66'/><line x1='0' y1='40' x2='8' y2='40'/><line x1='72' y1='40' x2='80' y2='40'/><line x1='40' y1='0' x2='40' y2='8'/><line x1='40' y1='72' x2='40' y2='80'/></g></svg>`;

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat'
};
</script>
