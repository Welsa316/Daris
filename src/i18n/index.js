import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ar from './locales/ar.json';

const savedLocale = typeof localStorage !== 'undefined'
  ? localStorage.getItem('daris-locale')
  : null;

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale || 'en',
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
