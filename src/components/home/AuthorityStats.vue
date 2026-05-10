<template>
  <!-- Why Daris. photo-as-card anchored right, bg provided by parent wrapper in HomeView -->

  <section class="relative overflow-hidden py-20 md:py-28 lg:py-32">

    <!-- Soft gold radial glow. shifted right to back the card -->
    <div
      class="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-gold/[0.06] blur-[140px]"
      aria-hidden="true"
    ></div>

    <!-- ── Card. right-anchored ── -->
    <div class="relative z-10 section-wide">
      <div class="relative max-w-4xl ml-auto">

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

        <!-- ── Photo card. image is the surface ── -->
        <div class="relative rounded-2xl md:rounded-3xl shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-black/[0.06]">

          <!-- Background photo. object-top to show the subject properly.
               WebP saves ~2MB vs the old PNG; explicit width/height avoid
               CLS while Tailwind's object-cover handles the real layout. -->
          <img
            src="/images/islamic-study.webp"
            :alt="$t('home.credibilityImageAlt')"
            width="1200"
            height="800"
            class="absolute inset-0 w-full h-full object-cover object-top"
            loading="lazy"
            decoding="async"
          />

          <!-- Dark overlay gradient for text readability -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-black/65"
            aria-hidden="true"
          ></div>

          <!-- Grain texture over photo -->
          <div class="absolute inset-0 grain-texture opacity-35" aria-hidden="true"></div>

          <!-- ── Content overlaid on the photo ── -->
          <div class="relative z-10 px-7 sm:px-10 md:px-14 lg:px-16 pt-16 pb-12 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20">

            <!-- Heading -->
            <h2
              class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-cream leading-[1.08] mb-12 md:mb-16 max-w-md"
              data-reveal="cinematic"
            >
              {{ $t('home.credibilityTitle') }}
            </h2>

            <!-- Stats. staggered 2-column -->
            <div
              class="grid grid-cols-2 gap-x-8 md:gap-x-12 max-w-md"
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
                <!-- Hairline divider. alternating gold / cream -->
                <div
                  class="h-px mb-4 md:mb-5"
                  :class="[
                    i % 2 === 0 ? 'w-10 bg-gold/50' : 'w-7 bg-cream/20'
                  ]"
                  aria-hidden="true"
                ></div>
                <p class="heading-display text-xl sm:text-2xl md:text-3xl text-cream font-bold leading-none mb-1.5 text-balance tabular-nums">
                  {{ stat.value }}
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';

const { t } = useI18n();

// Live counts from /api/public-stats. See StatsRow.vue for the same
// pattern — the two components share the source of truth so the home
// page can't accidentally drift.
const studentsCount = ref(null);
const countriesCount = ref(null);

onMounted(async () => {
  try {
    const data = await api.get('/api/public-stats');
    if (typeof data.studentsCount === 'number') studentsCount.value = data.studentsCount;
    if (typeof data.countriesCount === 'number') countriesCount.value = data.countriesCount;
  } catch {
    // Fall back to the static numbers below.
  }
});

// Fallbacks match the server-side baseline so the number doesn't
// briefly flash a smaller value before the API response lands.
const STUDENTS_FALLBACK = '100+';
const COUNTRIES_FALLBACK = '9+';

const stats = computed(() => [
  { labelKey: 'home.stat1Label', value: t('home.stat1Value') },
  { labelKey: 'home.stat2Label', value: t('home.stat2Value') },
  {
    labelKey: 'home.stat3Label',
    value: studentsCount.value !== null ? `${studentsCount.value}+` : STUDENTS_FALLBACK,
  },
  {
    labelKey: 'home.stat4Label',
    value: countriesCount.value !== null ? `${countriesCount.value}+` : COUNTRIES_FALLBACK,
  },
]);
</script>
