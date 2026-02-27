<template>
  <!-- Why Daris — structural asymmetry, not a rectangular band.
       Layout: CSS Grid (63/37), image as structural element.
       Container broken: image extends 80-120px left of section-wide.
       Vertical offset: image drops 60px below text.
       Text crosses column boundary into gradient zone (layering).
       Stats stagger non-uniformly (20-28px range). -->
  <section
    class="relative bg-cream-50 mb-[-5rem]"
    style="overflow-x: clip;"
  >
    <!-- Gold accent — top edge only, bottom is dissolved -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

    <!-- Grain -->
    <div class="absolute inset-0 grain-texture opacity-20 pointer-events-none" aria-hidden="true"></div>

    <!-- ======= MOBILE: stacked, image as background ======= -->
    <div class="md:hidden relative min-h-[55vh] flex items-end">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          src="/images/islamic-study.png"
          :alt="$t('home.credibilityImageAlt')"
          class="w-full h-full object-cover object-top"
        />
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-cream-50/60 to-cream-50"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 px-5 sm:px-6 pb-14 pt-14">
        <h2
          class="font-display text-4xl sm:text-5xl text-slate-900 leading-[1.05] mb-6"
          data-reveal="cinematic"
        >
          {{ $t('home.credibilityTitle') }}
        </h2>

        <div class="mb-10" data-reveal data-reveal-delay="100">
          <div class="w-10 h-[2px] bg-gold/50 mb-4" aria-hidden="true"></div>
          <p class="text-sm font-semibold text-primary-700 mb-1">
            {{ $t('home.azharTitle') }}
          </p>
          <p class="text-sm text-slate-500 leading-relaxed max-w-sm">
            {{ $t('home.azharBody') }}
          </p>
        </div>

        <div
          class="grid grid-cols-2 gap-x-8 gap-y-6"
          data-reveal
          data-reveal-delay="200"
        >
          <div v-for="stat in stats" :key="stat.labelKey" class="flex flex-col">
            <p class="heading-display text-3xl text-primary font-bold leading-none mb-1">
              {{ $t(stat.valueKey) }}
            </p>
            <p class="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
              {{ $t(stat.labelKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ======= DESKTOP: asymmetric CSS Grid ======= -->
    <div class="hidden md:block">
      <div class="section-wide relative">
        <div
          class="grid min-h-[75vh]"
          style="grid-template-columns: 63% 37%;"
        >

          <!-- Image column — breaks container left, drops below text -->
          <div
            class="relative -ml-[80px] lg:-ml-[100px] xl:-ml-[120px] mt-10 lg:mt-[60px]"
          >
            <img
              src="/images/islamic-study.png"
              :alt="$t('home.credibilityImageAlt')"
              class="absolute inset-0 w-full h-full object-cover object-top"
            />
            <!-- Right-edge gradient: image → dark band → cream -->
            <div
              class="absolute inset-0"
              style="background: linear-gradient(to right, transparent 45%, rgba(12,32,25,0.7) 72%, #FDFCF9 100%)"
              aria-hidden="true"
            ></div>
            <div class="absolute inset-0 grain-texture opacity-30" aria-hidden="true"></div>
          </div>

          <!-- Text column — sits higher, z-layered above image fade -->
          <div class="relative z-10 flex flex-col justify-center py-20 lg:py-24 pl-6 lg:pl-10">

            <!-- Heading — crosses column boundary into gradient zone -->
            <h2
              class="font-display text-5xl lg:text-6xl xl:text-7xl text-slate-900 leading-[1.05] mb-6 -ml-12 lg:-ml-20 xl:-ml-28"
              data-reveal="cinematic"
            >
              {{ $t('home.credibilityTitle') }}
            </h2>

            <!-- Credential — overlaps image fade boundary -->
            <div
              class="mb-14 -ml-8 lg:-ml-14"
              data-reveal
              data-reveal-delay="100"
            >
              <div class="w-10 h-[2px] bg-gold/50 mb-4" aria-hidden="true"></div>
              <p class="text-sm font-semibold text-primary-700 mb-1">
                {{ $t('home.azharTitle') }}
              </p>
              <p class="text-sm text-slate-500 leading-relaxed max-w-sm">
                {{ $t('home.azharBody') }}
              </p>
            </div>

            <!-- Stats — staggered, non-uniform vertical offsets -->
            <div
              class="grid grid-cols-2 gap-x-8 lg:gap-x-10 gap-y-6"
              data-reveal
              data-reveal-delay="200"
            >
              <div
                v-for="(stat, i) in stats"
                :key="stat.labelKey"
                :class="['flex flex-col', statOffsets[i]]"
              >
                <p class="heading-display text-3xl lg:text-4xl text-primary font-bold leading-none mb-1">
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
</template>

<script setup>
const stats = [
  { valueKey: 'home.stat1Value', labelKey: 'home.stat1Label' },
  { valueKey: 'home.stat2Value', labelKey: 'home.stat2Label' },
  { valueKey: 'home.stat3Value', labelKey: 'home.stat3Label' },
  { valueKey: 'home.stat4Value', labelKey: 'home.stat4Label' }
];

// Non-uniform stagger — 20-28px range, no predictable pattern
const statOffsets = [
  '',                 // 0px — baseline
  'translate-y-7',   // +28px — drops hard
  '-translate-y-1',  // -4px — slight rise above baseline
  'translate-y-5'    // +20px — lower, but less than stat 1
];
</script>
