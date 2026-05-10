<template>
  <section class="relative overflow-hidden bg-primary">
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/30 to-primary-900/40" aria-hidden="true"></div>

    <div class="section-container relative py-20 md:py-28">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 text-center">
        <div v-for="stat in stats" :key="stat.labelKey">
          <p class="heading-display text-4xl md:text-5xl text-gold mb-2 tabular-nums">
            {{ stat.value }}
          </p>
          <p class="text-sm text-cream/60 tracking-wide text-balance">
            {{ $t(stat.labelKey) }}
          </p>
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

// Live counts come from /api/public-stats. Cached server-side at 5min TTL.
// While the request is pending we render the localized fallback values
// so the row never flashes "—" or empty cells.
const studentsCount = ref(null);
const countriesCount = ref(null);

onMounted(async () => {
  try {
    const data = await api.get('/api/public-stats');
    if (typeof data.studentsCount === 'number') studentsCount.value = data.studentsCount;
    if (typeof data.countriesCount === 'number') countriesCount.value = data.countriesCount;
  } catch {
    // Network failure leaves the fallbacks. Worst case the marketing
    // row shows reasonable static numbers instead of breaking.
  }
});

// Fallbacks shown until /public-stats responds (and as the final value
// if the API errors). 9 countries matches the country pill row that
// already lists Egypt / USA / etc. by hand.
const STUDENTS_FALLBACK = '10+';
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
