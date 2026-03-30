import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta, useHead } from '@unhead/vue';

const SITE_URL = 'https://daris.education';

/**
 * Structured data schemas per page.
 * Injected as <script type="application/ld+json"> in <head>.
 */
const schemas = {
  home: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Daris',
      url: SITE_URL,
      logo: `${SITE_URL}/images/daris-logo.png`,
      description: 'Personalised online Quran, Arabic language, and Islamic studies lessons with an Al-Azhar-trained Sheikh.',
      availableLanguage: ['English', 'Arabic'],
      areaServed: 'Worldwide',
      founder: {
        '@type': 'Person',
        jobTitle: 'Islamic Studies Instructor',
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Al-Azhar University',
          address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
        },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Daris',
      url: SITE_URL,
      inLanguage: ['en', 'ar'],
    },
  ],

  about: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Daris',
      url: `${SITE_URL}/about`,
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Daris',
        url: SITE_URL,
      },
    },
  ],

  programs: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Daris Programs',
      url: `${SITE_URL}/programs`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Course',
            name: 'Quran Studies',
            description: 'Recitation correction, tajwid rules, and tafsir understanding.',
            provider: { '@type': 'EducationalOrganization', name: 'Daris' },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Course',
            name: 'Arabic Language',
            description: 'Classical Arabic grammar, vocabulary, and guided reading with classical texts.',
            provider: { '@type': 'EducationalOrganization', name: 'Daris' },
          },
        },
        {
          '@type': 'ListItem',
          position: 3,
          item: {
            '@type': 'Course',
            name: 'Fiqh & Islamic Studies',
            description: 'Hanafi fiqh, aqeedah, stories of the prophets, and the 40 Nawawi hadiths.',
            provider: { '@type': 'EducationalOrganization', name: 'Daris' },
          },
        },
      ],
    },
  ],

  contact: () => [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Daris',
      url: `${SITE_URL}/contact`,
      mainEntity: {
        '@type': 'EducationalOrganization',
        name: 'Daris',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Arabic'],
          url: 'https://wa.me/message/OCKC2UPLHGOOG1',
        },
      },
    },
  ],
};

/**
 * Sets per-page SEO meta tags + structured data reactively.
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

  // Build JSON-LD script tags from schema map
  const schemaFn = schemas[pageKey];
  const scriptTags = schemaFn
    ? schemaFn().map((schema) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(schema),
      }))
    : [];

  useHead({
    htmlAttrs: {
      lang: computed(() => locale.value),
      dir: computed(() => locale.value === 'ar' ? 'rtl' : 'ltr'),
    },
    link: [
      {
        rel: 'canonical',
        href: computed(() =>
          typeof window !== 'undefined'
            ? `${SITE_URL}${window.location.pathname}`
            : SITE_URL
        ),
      },
    ],
    script: scriptTags,
  });
}
