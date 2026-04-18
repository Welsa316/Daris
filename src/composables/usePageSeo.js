import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useSeoMeta, useHead } from '@unhead/vue';

const SITE_URL = 'https://daris.education';

/**
 * Structured-data schemas per page. Kept intentionally organisation-only
 * (no named Person / founder). Daris is the brand; individual instructors
 * are not surfaced in schema. Institutional credibility comes from the
 * explicit Al-Azhar methodology signal in the description.
 *
 * Server-side counterpart lives in `server/src/seoMeta.js` and is the
 * primary SEO surface (server injects before hydration). The client-side
 * schemas below re-assert matching structured data during SPA navigation.
 */
const schemas = {
  home: (locale) => [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Daris',
      url: SITE_URL,
      logo: `${SITE_URL}/images/daris-logo.png`,
      description: 'Online Quran, Arabic language, and Islamic studies lessons in the methodology of Al-Azhar Al-Sharif. For men and children, worldwide.',
      availableLanguage: ['English', 'Arabic'],
      areaServed: 'Worldwide',
      knowsAbout: ['Quran recitation', 'Tajwid', 'Tafsir', 'Classical Arabic', 'Hanafi fiqh', 'Aqeedah', 'Hadith'],
      sameAs: ['https://wa.me/message/OCKC2UPLHGOOG1'],
      inLanguage: locale === 'ar' ? 'ar' : 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Daris',
      url: SITE_URL,
      inLanguage: ['en', 'ar'],
    },
  ],

  about: (locale) => [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Daris',
      url: `${SITE_URL}/${locale}/about`,
      inLanguage: locale === 'ar' ? 'ar' : 'en',
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Daris',
        url: SITE_URL,
      },
    },
  ],

  programs: (locale) => [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Daris Programs',
      url: `${SITE_URL}/${locale}/programs`,
      inLanguage: locale === 'ar' ? 'ar' : 'en',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Course',
            name: 'Quran Studies',
            description: 'Recitation correction, tajwid rules, and tafsir understanding.',
            url: `${SITE_URL}/${locale}/programs#quran`,
            provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
            inLanguage: ['en', 'ar'],
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Course',
            name: 'Arabic Language',
            description: 'Classical Arabic grammar, vocabulary, and guided reading with classical texts.',
            url: `${SITE_URL}/${locale}/programs#arabic`,
            provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
            inLanguage: ['en', 'ar'],
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Course',
            name: 'Fiqh & Islamic Studies',
            description: 'Hanafi fiqh, aqeedah, stories of the prophets, and the 40 Nawawi hadiths.',
            url: `${SITE_URL}/${locale}/programs#fiqh`,
            provider: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
            inLanguage: 'ar',
          },
        },
      ],
    },
  ],

  contact: (locale) => [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Daris',
      url: `${SITE_URL}/${locale}/contact`,
      inLanguage: locale === 'ar' ? 'ar' : 'en',
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Daris',
        url: SITE_URL,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Arabic'],
          email: 'hello@daris.education',
          url: 'https://wa.me/message/OCKC2UPLHGOOG1',
        },
      },
    },
  ],

  // FAQ schema is built from the same i18n keys that render on the page so
  // the JSON-LD cannot drift from the visible content. Google only surfaces
  // FAQ rich results when the two match.
  faq: (locale, tFn) => [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      name: tFn ? tFn('faq.title') : 'FAQ | Daris',
      url: `${SITE_URL}/${locale}/faq`,
      inLanguage: locale === 'ar' ? 'ar' : 'en',
      mainEntity: tFn
        ? Array.from({ length: 10 }, (_, i) => ({
            '@type': 'Question',
            name: tFn(`faq.q${i + 1}`),
            acceptedAnswer: { '@type': 'Answer', text: tFn(`faq.a${i + 1}`) },
          }))
        : [],
    },
  ],
};

/**
 * Set per-page SEO meta tags + structured data + hreflang alternates.
 * Reads titles/descriptions from i18n so they switch with language.
 *
 * @param {string} pageKey - One of: 'home', 'about', 'programs', 'contact'
 */
export function usePageSeo(pageKey) {
  const { t, locale } = useI18n();
  const route = useRoute();

  const title = computed(() => t(`seo.${pageKey}.title`));
  const description = computed(() => t(`seo.${pageKey}.description`));
  const currentOgLocale = computed(() => locale.value === 'ar' ? 'ar_SA' : 'en_US');
  const alternateOgLocale = computed(() => locale.value === 'ar' ? 'en_US' : 'ar_SA');

  // Canonical path rebuilds from current locale + pageKey so it's stable
  // across client-side nav (vs reading window.location which races hydration).
  const pagePath = pageKey === 'home' ? '' : `/${pageKey}`;
  const canonicalUrl = computed(() => `${SITE_URL}/${locale.value}${pagePath}`);
  const enUrl = `${SITE_URL}/en${pagePath}`;
  const arUrl = `${SITE_URL}/ar${pagePath}`;

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
    ogUrl: canonicalUrl,
    ogLocale: currentOgLocale,
    ogLocaleAlternate: alternateOgLocale,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${SITE_URL}/images/daris-og.png`,
  });

  // Build JSON-LD script tags from schema map, fed the current locale.
  // The FAQ schema builder additionally receives `t` so it can emit the
  // same question/answer strings the page is rendering.
  const schemaFn = schemas[pageKey];
  const scriptTags = computed(() =>
    schemaFn
      ? schemaFn(locale.value, t).map((schema) => ({
          type: 'application/ld+json',
          innerHTML: JSON.stringify(schema),
        }))
      : []
  );

  useHead({
    htmlAttrs: {
      lang: computed(() => locale.value),
      dir: computed(() => locale.value === 'ar' ? 'rtl' : 'ltr'),
    },
    link: [
      { rel: 'canonical', href: canonicalUrl },
      // Hreflang alternates. Bidirectional, self-referencing, with
      // English as x-default. Both locales point at one another so crawlers
      // can index each as its own entity.
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'ar', href: arUrl },
      { rel: 'alternate', hreflang: 'x-default', href: enUrl },
    ],
    script: scriptTags,
  });

  // Suppress unused-variable warnings for route (useful if a caller wants
  // to extend usePageSeo later to react to route params).
  void route;
}
