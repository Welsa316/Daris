<template>
  <!-- Why Daris — layered panel-over-image with floating badge.
       Layout: full-bleed image backdrop + solid cream panel anchored right.
       Two visual layers create depth. Badge breaks panel boundary.
       Cream bands above/below interrupt the dark-section streak.
       Mobile: image block stacked above panel block. -->

  <!-- Cream transition band — breaks dark Fiqh → dark CTA streak -->
  <div class="bg-cream-50">
    <div class="h-10 md:h-14" aria-hidden="true"></div>

    <section class="relative overflow-hidden">

      <!-- ── Image layer ──
           Mobile: relative block (visible, takes space)
           Desktop: absolute full-bleed behind panel -->
      <div class="relative h-[42vh] sm:h-[48vh] md:absolute md:inset-0 md:h-auto">
        <img
          src="/images/islamic-study.png"
          :alt="$t('home.credibilityImageAlt')"
          class="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <!-- Mobile overlay — bottom fade so badge/panel transition is smooth -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/40 md:hidden"
          aria-hidden="true"
        ></div>
        <!-- Desktop overlay — directional: light left (image vivid), darker right (behind panel) -->
        <div
          class="absolute inset-0 hidden md:block"
          style="background: linear-gradient(110deg, rgba(0,0,0,0.2) 0%, rgba(12,32,25,0.4) 40%, rgba(12,32,25,0.6) 100%)"
          aria-hidden="true"
        ></div>
        <div class="absolute inset-0 grain-texture opacity-35" aria-hidden="true"></div>
      </div>

      <!-- ── Content layer ── -->
      <div class="relative z-10 md:py-20 lg:py-28">
        <div class="section-wide">

          <!-- Panel wrapper — anchored right on desktop, overlaps image on mobile -->
          <div class="relative -mt-14 md:mt-0 md:ml-auto md:w-[560px] lg:w-[600px] xl:w-[640px]">

            <!-- ── Floating credential badge ──
                 Sits partially outside panel top-left corner.
                 Gold accent line + dark backing. -->
            <div
              class="absolute -top-5 left-5 sm:left-8 md:-left-6 z-20"
              data-reveal
            >
              <div class="flex items-stretch bg-primary-950/95 backdrop-blur-sm shadow-lg shadow-black/20">
                <div class="w-1 bg-gold shrink-0" aria-hidden="true"></div>
                <div class="px-4 py-3">
                  <p class="text-[10px] font-semibold tracking-[0.25em] uppercase text-gold leading-tight mb-0.5">
                    {{ $t('home.azharTitle') }}
                  </p>
                  <p class="text-[11px] text-cream/45 leading-snug max-w-[260px]">
                    {{ $t('home.azharBody') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ── Content panel — cream foreground surface ── -->
            <div class="bg-cream-50 shadow-2xl shadow-black/8 pt-14 pb-10 px-7 sm:px-9 md:px-12 md:py-14 lg:px-14 lg:py-16">

              <!-- Heading -->
              <h2
                class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.08] mb-10 md:mb-14"
                data-reveal="cinematic"
              >
                {{ $t('home.credibilityTitle') }}
              </h2>

              <!-- Stats — staggered 2-column, right column offset down -->
              <div
                class="grid grid-cols-2 gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-7"
                data-reveal
                data-reveal-delay="150"
              >
                <div
                  v-for="(stat, i) in stats"
                  :key="stat.labelKey"
                  :class="[
                    'flex flex-col',
                    i % 2 === 1 ? 'md:translate-y-5' : ''
                  ]"
                >
                  <!-- Hairline divider above each stat — alternating gold/slate -->
                  <div
                    class="w-8 h-px mb-4"
                    :class="i % 2 === 0 ? 'bg-gold/40' : 'bg-slate-200'"
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

    </section>

    <div class="h-10 md:h-14" aria-hidden="true"></div>
  </div>
</template>

<script setup>
const stats = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
  { valueKey: 'home.stat4Value', labelKey: 'home.stat4Label' }
];
</script>
