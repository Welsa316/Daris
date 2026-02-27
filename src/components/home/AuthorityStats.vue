<template>
  <!-- Why Daris — cinematic credibility on warm neutral base.
       Breaks the dark-green-on-dark-green monotony.
       Image left with green gradient. Right side: warm ivory.
       Creates Dark → Light → Dark rhythm in the page flow. -->
  <section class="relative overflow-hidden bg-cream-50 min-h-[55vh] md:min-h-[70vh]">

    <!-- Image — left portion, full bleed vertically -->
    <div class="absolute inset-0 md:right-[40%]" aria-hidden="true">
      <img
        src="/images/islamic-study.png"
        :alt="$t('home.credibilityImageAlt')"
        class="w-full h-full object-cover object-top"
      />
    </div>

    <!-- Gradient overlays — image → dark green band → cream -->
    <!-- Mobile: vertical fade to cream so text reads over image -->
    <div
      class="absolute inset-0 md:hidden bg-gradient-to-b from-transparent via-cream-50/60 to-cream-50"
      aria-hidden="true"
    ></div>
    <!-- Desktop: horizontal — cinematic green stays on image, cream breathes on right -->
    <div
      class="absolute inset-0 hidden md:block"
      style="background: linear-gradient(to right, transparent 15%, rgba(12,32,25,0.88) 42%, #FDFCF9 58%)"
      aria-hidden="true"
    ></div>

    <!-- Grain — lighter for the warm side -->
    <div class="absolute inset-0 grain-texture opacity-20" aria-hidden="true"></div>

    <!-- Subtle gold accent at section edges -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>
    <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/12 to-transparent" aria-hidden="true"></div>

    <!-- Content — right side, on warm neutral background -->
    <div class="section-wide relative flex items-end md:items-center min-h-[55vh] md:min-h-[70vh] py-14 md:py-24">
      <div class="w-full md:w-[50%] md:ml-auto">

        <!-- Heading — dark text on cream -->
        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 leading-[1.05] mb-6"
          data-reveal="cinematic"
        >
          {{ $t('home.credibilityTitle') }}
        </h2>

        <!-- Al-Azhar credential — anchored, grounded, not a card -->
        <div class="mb-12 md:mb-16" data-reveal data-reveal-delay="100">
          <div class="w-10 h-[2px] bg-gold/50 mb-4" aria-hidden="true"></div>
          <p class="text-sm font-semibold text-primary-700 mb-1">
            {{ $t('home.azharTitle') }}
          </p>
          <p class="text-sm text-slate-500 leading-relaxed max-w-sm">
            {{ $t('home.azharBody') }}
          </p>
        </div>

        <!-- Stats — typographic rhythm, not cards -->
        <div
          class="flex flex-wrap gap-x-8 md:gap-x-10 gap-y-6"
          data-reveal
          data-reveal-delay="200"
        >
          <div
            v-for="(stat, i) in stats"
            :key="stat.labelKey"
            class="flex items-start gap-x-8 md:gap-x-10"
          >
            <div>
              <p class="heading-display text-3xl md:text-4xl text-primary font-bold leading-none mb-1">
                {{ $t(stat.valueKey) }}
              </p>
              <p class="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
                {{ $t(stat.labelKey) }}
              </p>
            </div>
            <!-- Hairline divider — warm tone -->
            <div
              v-if="i < stats.length - 1"
              class="hidden md:block w-px h-10 bg-primary/10 self-center"
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
