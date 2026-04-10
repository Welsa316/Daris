<template>
  <div
    role="group"
    aria-label="Language"
    class="inline-flex items-center rounded-full border p-0.5 text-xs font-semibold transition-colors duration-300"
    :class="dark
      ? 'border-white/15 bg-white/5'
      : 'border-primary/10 bg-white/60'"
    dir="ltr"
  >
    <button
      type="button"
      class="rounded-full px-3 py-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      :class="[
        currentLocale === 'en'
          ? (dark ? 'bg-gold text-primary-950' : 'bg-primary text-cream')
          : (dark ? 'text-cream/70 hover:text-cream' : 'text-slate-700 hover:text-primary'),
        dark ? 'focus-visible:ring-gold focus-visible:ring-offset-primary-950' : 'focus-visible:ring-primary focus-visible:ring-offset-cream',
      ]"
      :aria-pressed="currentLocale === 'en'"
      aria-label="Switch to English"
      @click="setLang('en')"
    >
      English
    </button>
    <button
      type="button"
      class="rounded-full px-3 py-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      :class="[
        currentLocale === 'ar'
          ? (dark ? 'bg-gold text-primary-950' : 'bg-primary text-cream')
          : (dark ? 'text-cream/70 hover:text-cream' : 'text-slate-700 hover:text-primary'),
        dark ? 'focus-visible:ring-gold focus-visible:ring-offset-primary-950' : 'focus-visible:ring-primary focus-visible:ring-offset-cream',
      ]"
      :aria-pressed="currentLocale === 'ar'"
      aria-label="التبديل إلى العربية"
      @click="setLang('ar')"
    >
      العربية
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale } from '@/i18n';

defineProps({
  dark: { type: Boolean, default: false }
});

const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

function setLang(next) {
  if (locale.value === next) return;
  setLocale(next);
}
</script>
