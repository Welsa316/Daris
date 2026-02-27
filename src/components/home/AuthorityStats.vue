<template>
  <!-- Why Daris — featured card on patterned dark surface.
       Layout: dark bg (primary-950) with low-opacity Islamic geometric
       SVG overlay. Single centred card: photo left / cream content right.
       Floating Al-Azhar badge anchored to card edge.
       Cream transition bands above/below. -->

  <!-- Cream band — top transition -->
  <div class="h-12 md:h-16 bg-cream-50" aria-hidden="true"></div>

  <section class="relative overflow-hidden bg-primary-950 py-20 md:py-28 lg:py-32">

    <!-- ── Islamic geometric pattern overlay ── -->
    <div
      class="absolute inset-0 opacity-[0.07]"
      :style="patternStyle"
      aria-hidden="true"
    ></div>

    <!-- ── Gold radial glow behind card ── -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-gold/[0.04] blur-[140px]"
      aria-hidden="true"
    ></div>

    <!-- Grain texture -->
    <div class="absolute inset-0 grain-texture opacity-30" aria-hidden="true"></div>

    <!-- ── Featured card ── -->
    <div class="relative z-10 section-container">
      <div class="relative max-w-6xl mx-auto">

        <!-- ── Floating credential badge ──
             Anchored to card top-left corner, overlapping edge. -->
        <div
          class="absolute -top-5 left-4 sm:left-6 md:left-[calc(45%-2rem)] lg:left-[calc(45%-1.5rem)] z-30"
          data-reveal
        >
          <div class="flex items-stretch rounded-lg bg-primary-950/95 backdrop-blur-sm shadow-xl shadow-black/25 ring-1 ring-gold/15">
            <div class="w-1 rounded-l-lg bg-gold shrink-0" aria-hidden="true"></div>
            <div class="px-4 py-3 sm:px-5 sm:py-3.5">
              <p class="text-[10px] font-semibold tracking-[0.25em] uppercase text-gold leading-tight mb-0.5">
                {{ $t('home.azharTitle') }}
              </p>
              <p class="text-[11px] text-cream/40 leading-snug max-w-[260px]">
                {{ $t('home.azharBody') }}
              </p>
            </div>
          </div>
        </div>

        <!-- ── Card shell ── -->
        <div class="rounded-2xl md:rounded-3xl shadow-2xl shadow-black/30 overflow-hidden ring-1 ring-white/[0.06]">
          <div class="flex flex-col md:flex-row">

            <!-- ── Photo half ── -->
            <div class="relative md:w-[45%] lg:w-[47%] shrink-0">
              <div class="h-[280px] sm:h-[340px] md:h-full md:min-h-[520px]">
                <img
                  src="/images/islamic-study.png"
                  :alt="$t('home.credibilityImageAlt')"
                  class="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <!-- Subtle overlay to darken slightly -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/10"
                  aria-hidden="true"
                ></div>
              </div>
            </div>

            <!-- ── Content half ── -->
            <div class="relative bg-cream-50 md:w-[55%] lg:w-[53%] px-7 sm:px-9 md:px-12 lg:px-14 pt-12 pb-10 md:py-14 lg:py-16 flex flex-col justify-center">

              <!-- Heading -->
              <h2
                class="font-display text-3xl sm:text-4xl md:text-[2.65rem] lg:text-5xl text-slate-900 leading-[1.08] mb-10 md:mb-14"
                data-reveal="cinematic"
              >
                {{ $t('home.credibilityTitle') }}
              </h2>

              <!-- Stats — staggered 2-column -->
              <div
                class="grid grid-cols-2 gap-x-6 md:gap-x-10"
                data-reveal
                data-reveal-delay="150"
              >
                <div
                  v-for="(stat, i) in stats"
                  :key="stat.labelKey"
                  :class="[
                    'flex flex-col',
                    i < 2 ? 'mb-8 md:mb-9' : '',
                    i % 2 === 1 ? 'md:translate-y-4' : ''
                  ]"
                >
                  <!-- Hairline divider — alternating gold / slate -->
                  <div
                    class="h-px mb-4 md:mb-5"
                    :class="[
                      i % 2 === 0 ? 'w-10 bg-gold/40' : 'w-7 bg-slate-200'
                    ]"
                    aria-hidden="true"
                  ></div>
                  <p class="heading-display text-2xl sm:text-3xl md:text-4xl text-primary font-bold leading-none mb-1.5">
                    {{ $t(stat.valueKey) }}
                  </p>
                  <p class="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
                    {{ $t(stat.labelKey) }}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

  </section>

  <!-- Cream band — bottom transition -->
  <div class="h-12 md:h-16 bg-cream-50" aria-hidden="true"></div>
</template>

<script setup>
const stats = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
  { valueKey: 'home.stat4Value', labelKey: 'home.stat4Label' }
];

// Islamic geometric star pattern — 8-pointed star tessellation.
// Thin strokes, abstract, tiles at 80×80. Encoded as inline SVG data URI.
const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
  <g fill='none' stroke='%23C8A951' stroke-width='0.5'>
    <!-- 8-pointed star at center -->
    <polygon points='40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26'/>
    <!-- Inner octagon -->
    <polygon points='40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5'/>
    <!-- Corner stars (quarter portions that tile) -->
    <polygon points='0,0 6.5,14 0,18 -6.5,14' transform='translate(0,0)'/>
    <polygon points='80,0 86.5,14 80,18 73.5,14' transform='translate(0,0)'/>
    <polygon points='0,80 6.5,66 0,62 -6.5,66' transform='translate(0,0)'/>
    <polygon points='80,80 86.5,66 80,62 73.5,66' transform='translate(0,0)'/>
    <!-- Connecting lines between tiles -->
    <line x1='0' y1='40' x2='8' y2='40'/>
    <line x1='72' y1='40' x2='80' y2='40'/>
    <line x1='40' y1='0' x2='40' y2='8'/>
    <line x1='40' y1='72' x2='40' y2='80'/>
  </g>
</svg>`;

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,${patternSvg.replace(/\n\s*/g, '')}")`,
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat'
};
</script>
