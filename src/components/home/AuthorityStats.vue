<template>
  <!-- Why Daris — cinematic credibility statement.
       Image bleeds from left into dark background via gradient.
       Text, credential, and stats layer over the dark side.
       One unified editorial frame, not image + boxes. -->
  <section class="relative overflow-hidden bg-primary-950 min-h-[60vh] md:min-h-[70vh]">
    <!-- Image — left half, full bleed, portrait orientation -->
    <div class="absolute inset-0 md:right-[45%]" aria-hidden="true">
      <img
        src="/images/islamic-study.png"
        :alt="$t('home.credibilityImageAlt')"
        class="w-full h-full object-cover object-top"
      />
    </div>

    <!-- Gradient overlays — fuse image into dark background -->
    <!-- Right-to-left fade: image dissolves into primary-950 -->
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary-950/60 to-primary-950" aria-hidden="true"></div>
    <!-- Bottom fade for grounding -->
    <div class="absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent" aria-hidden="true"></div>
    <!-- Grain for cinematic texture -->
    <div class="absolute inset-0 grain-texture opacity-40" aria-hidden="true"></div>
    <!-- Subtle gold top border -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>

    <!-- Content — right-aligned, layered over the dark gradient -->
    <div class="section-wide relative flex items-center min-h-[60vh] md:min-h-[70vh] py-16 md:py-24">
      <div class="w-full md:w-[55%] md:ml-auto">

        <!-- Heading -->
        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-6"
          data-reveal="cinematic"
        >
          {{ $t('home.credibilityTitle') }}
        </h2>

        <!-- Al-Azhar credential — anchored, not a floating card -->
        <div class="mb-12 md:mb-16" data-reveal data-reveal-delay="100">
          <div class="w-10 h-[2px] bg-gold/50 mb-4" aria-hidden="true"></div>
          <p class="text-sm font-semibold text-gold/80 mb-1">
            {{ $t('home.azharTitle') }}
          </p>
          <p class="text-sm text-cream/35 leading-relaxed max-w-sm">
            {{ $t('home.azharBody') }}
          </p>
        </div>

        <!-- Stats — typographic, not cards -->
        <div
          class="flex flex-wrap gap-x-8 md:gap-x-12 gap-y-6"
          data-reveal
          data-reveal-delay="200"
        >
          <div
            v-for="(stat, i) in stats"
            :key="stat.labelKey"
            class="flex items-start gap-x-8 md:gap-x-12"
          >
            <div>
              <p class="heading-display text-3xl md:text-4xl text-gold font-bold leading-none mb-1">
                {{ $t(stat.valueKey) }}
              </p>
              <p class="text-[10px] text-cream/30 tracking-[0.2em] uppercase">
                {{ $t(stat.labelKey) }}
              </p>
            </div>
            <!-- Hairline divider between stats (not after last) -->
            <div
              v-if="i < stats.length - 1"
              class="hidden md:block w-px h-10 bg-cream/10 self-center"
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
