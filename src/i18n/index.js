import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ar from './locales/ar.json';

function detectInitialLocale() {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('daris-locale');
  if (saved === 'en' || saved === 'ar') return saved;
  const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const detected = nav.startsWith('ar') ? 'ar' : 'en';
  // Persist so api.js sends the matching Accept-Language header from the first request
  localStorage.setItem('daris-locale', detected);
  return detected;
}

export const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, ar }
});

export function setLocale(locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('daris-locale', locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

// Apply initial direction on load
export function initLocale() {
  const locale = i18n.global.locale.value;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}
