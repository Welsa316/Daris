<template>
  <!-- Why Daris — full-width cinematic background, centered narrow column.
       No split layout. No grid columns. No container-based image block.
       Image is the canvas. Text floats over it in a 900px column.
       Inverted palette: cream/gold text on dark image. -->
  <section class="relative overflow-hidden">

    <!-- Full-bleed background image — edge to edge -->
    <div class="absolute inset-0">
      <img
        src="/images/islamic-study.png"
        :alt="$t('home.credibilityImageAlt')"
        class="w-full h-full object-cover object-center"
        loading="lazy"
      />
    </div>

    <!-- Dark overlay — text readability + cinematic mood -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/70"
      aria-hidden="true"
    ></div>

    <!-- Grain texture -->
    <div class="absolute inset-0 grain-texture opacity-40" aria-hidden="true"></div>

    <!-- Content — narrow centered column, no split -->
    <div class="relative z-10 flex flex-col items-center justify-center text-center px-5 sm:px-6 py-28 md:py-40 lg:py-48">
      <div class="max-w-[900px]">

        <!-- Heading -->
        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-10 md:mb-14"
          data-reveal="cinematic"
        >
          {{ $t('home.credibilityTitle') }}
        </h2>

        <!-- Al-Azhar credential — gold-accent badge -->
        <div
          class="inline-block mb-14 md:mb-20"
          data-reveal
          data-reveal-delay="100"
        >
          <div class="border-l-2 border-gold/60 pl-5 text-left">
            <p class="text-sm font-semibold text-gold tracking-wide mb-1">
              {{ $t('home.azharTitle') }}
            </p>
            <p class="text-sm text-cream/40 leading-relaxed max-w-md">
              {{ $t('home.azharBody') }}
            </p>
          </div>
        </div>

        <!-- Stats — single horizontal row, large typography, no cards -->
        <div
          class="flex flex-wrap justify-center gap-y-8"
          data-reveal
          data-reveal-delay="200"
        >
          <div
            v-for="(stat, i) in stats"
            :key="stat.labelKey"
            class="flex items-center"
          >
            <div class="px-5 sm:px-7 md:px-9">
              <p class="heading-display text-3xl sm:text-4xl md:text-5xl text-cream font-bold leading-none mb-2">
                {{ $t(stat.valueKey) }}
              </p>
              <p class="text-[10px] text-cream/30 tracking-[0.2em] uppercase">
                {{ $t(stat.labelKey) }}
              </p>
            </div>
            <!-- Hairline divider between stats -->
            <div
              v-if="i < stats.length - 1"
              class="hidden sm:block w-px h-12 bg-cream/10 self-center"
              aria-hidden="true"
            ></div>
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
</script>
