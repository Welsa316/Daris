import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta, useHead } from '@unhead/vue';

const SITE_URL = 'https://daris.education';

/**
 * Sets per-page SEO meta tags reactively.
 * Reads titles/descriptions from i18n so they switch with language.
 *
 * @param {string} pageKey - One of: 'home', 'about', 'programs', 'contact'
 */
export function usePageSeo(pageKey) {
  const { t, locale } = useI18n();

  const title = computed(() => t(`seo.${pageKey}.title`));
  const description = computed(() => t(`seo.${pageKey}.description`));
  const currentLocale = computed(() => locale.value === 'ar' ? 'ar_SA' : 'en_US');
  const alternateLocale = computed(() => locale.value === 'ar' ? 'en_US' : 'ar_SA');

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${SITE_URL}/images/daris-og.png`,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogType: 'website',
    ogSiteName: 'Daris',
    ogLocale: currentLocale,
    ogLocaleAlternate: alternateLocale,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${SITE_URL}/images/daris-og.png`,
  });

  useHead({
    htmlAttrs: {
      lang: computed(() => locale.value),
      dir: computed(() => locale.value === 'ar' ? 'rtl' : 'ltr'),
    },
    link: [
      { rel: 'canonical', href: computed(() => `${SITE_URL}${window.location.pathname}`) },
    ],
  });
}
