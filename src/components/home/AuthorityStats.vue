<template>
  <!-- Why Daris — cinematic credibility with structural tension.
       Breaks rectangular monotony through:
       1. Diagonal bottom edge (angled transition into BoldCTA)
       2. Cascading left edge (heading indented → stats flush)
       3. Staggered stat baselines
       4. Image depth layering under content zone -->
  <section class="relative overflow-hidden bg-cream-50 min-h-[55vh] md:min-h-[70vh]">

    <!-- Image — extends into content zone for depth layering -->
    <div class="absolute inset-0 md:right-[30%]" aria-hidden="true">
      <img
        src="/images/islamic-study.png"
        :alt="$t('home.credibilityImageAlt')"
        class="w-full h-full object-cover object-top"
      />
    </div>

    <!-- Gradient overlays -->
    <!-- Mobile: vertical fade to cream -->
    <div
      class="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-cream-50/60 to-cream-50"
      aria-hidden="true"
    ></div>
    <!-- Desktop: image → dark band → semi-transparent cream (depth) → opaque cream -->
    <div
      class="absolute inset-0 hidden md:block"
      style="background: linear-gradient(to right, transparent 12%, rgba(12,32,25,0.9) 36%, rgba(253,252,249,0.92) 52%, #FDFCF9 68%)"
      aria-hidden="true"
    ></div>

    <!-- Grain — subtle on light base -->
    <div class="absolute inset-0 grain-texture opacity-20" aria-hidden="true"></div>

    <!-- Gold accent top edge -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

    <!-- Angled bottom — dark triangle breaks rectangular boundary.
         Matches BoldCTA color so the next section "rises" diagonally into this one. -->
    <div
      class="hidden md:block absolute bottom-0 inset-x-0 z-[1] pointer-events-none"
      aria-hidden="true"
    >
      <div
        class="h-16 bg-primary-950"
        style="clip-path: polygon(0 100%, 100% 0, 100% 100%)"
      ></div>
    </div>

    <!-- Content — cascading alignment creates asymmetric composition -->
    <div class="section-wide relative z-10 flex items-end md:items-center min-h-[55vh] md:min-h-[70vh] py-14 md:pt-24 md:pb-36">
      <div class="w-full md:w-[55%] md:ml-auto">

        <!-- Heading — most indented, narrow measure, away from image -->
        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-[1.05] mb-6 md:pl-8"
          data-reveal="cinematic"
        >
          {{ $t('home.credibilityTitle') }}
        </h2>

        <!-- Credential — mid-indent, bridges heading and stats -->
        <div class="mb-12 md:mb-16 md:pl-4" data-reveal data-reveal-delay="100">
          <div class="w-10 h-[2px] bg-gold/50 mb-4" aria-hidden="true"></div>
          <p class="text-sm font-semibold text-primary-700 mb-1">
            {{ $t('home.azharTitle') }}
          </p>
          <p class="text-sm text-slate-500 leading-relaxed max-w-sm">
            {{ $t('home.azharBody') }}
          </p>
        </div>

        <!-- Stats — flush left (widest reach toward image), staggered baselines -->
        <div
          class="flex flex-wrap gap-x-8 md:gap-x-12 gap-y-6"
          data-reveal
          data-reveal-delay="200"
        >
          <div
            v-for="(stat, i) in stats"
            :key="stat.labelKey"
            :class="['transition-transform', statOffsets[i]]"
          >
            <p class="heading-display text-3xl md:text-4xl text-primary font-bold leading-none mb-1">
              {{ $t(stat.valueKey) }}
            </p>
            <p class="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
              {{ $t(stat.labelKey) }}
            </p>
          </div>
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

// Staggered vertical offsets — breaks mechanical horizontal alignment
const statOffsets = [
  '',                   // baseline
  'md:translate-y-2',   // 8px lower
  'md:-translate-y-1',  // 4px higher
  'md:translate-y-3'    // 12px lowest — anchors the cascade
];
</script>
