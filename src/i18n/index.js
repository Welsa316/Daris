import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ar from './locales/ar.json';

/**
 * The URL is the source of truth for locale — /en/* is always English and
 * /ar/* is always Arabic. On first paint we read the pathname so the initial
 * i18n locale matches the URL and no "wrong locale flash" occurs before the
 * router's nav guard runs. localStorage + navigator.language are fallbacks
 * only for non-locale-prefixed paths (auth pages, dashboard).
 */
function detectInitialLocale() {
  if (typeof window === 'undefined') return 'en';

  // 1. URL — authoritative for marketing routes
  const match = window.location.pathname.match(/^\/(en|ar)(\/|$)/);
  if (match) return match[1];

  // 2. localStorage — user's last explicit choice
  const saved = localStorage.getItem('daris-locale');
  if (saved === 'en' || saved === 'ar') return saved;

  // 3. Browser preference
  const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  const detected = nav.startsWith('ar') ? 'ar' : 'en';
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
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }
}

// Apply initial direction on load
export function initLocale() {
  const locale = i18n.global.locale.value;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }
}
