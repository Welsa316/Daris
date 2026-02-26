<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full border border-primary/10 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    :aria-label="currentLocale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'"
    @click="toggleLocale"
  >
    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
    <span>{{ currentLocale === 'en' ? $t('langSwitcher.ar') : $t('langSwitcher.en') }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale } from '@/i18n';

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

function toggleLocale() {
  const next = locale.value === 'en' ? 'ar' : 'en';
  setLocale(next);
}
</script>
