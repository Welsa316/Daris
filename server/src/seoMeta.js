/**
 * Server-side SEO meta injection for marketing pages.
 *
 * When crawlers (Google, Facebook, Twitter) request a page, the SPA fallback
 * injects route-specific <title>, <meta>, and JSON-LD structured data into
 * the HTML *before* serving it. This means crawlers see full SEO content
 * without needing JavaScript execution or SSR.
 *
 * Client-side @unhead/vue still manages meta reactively after hydration.
 */

const SITE_URL = 'https://daris.education';

const seoRoutes = {
  '/': {
    title: 'Daris | Quran, Arabic & Fiqh Guidance Online',
    description: 'Personalised online Quran, Arabic language, and Islamic studies lessons with an Al-Azhar-trained Sheikh. Available worldwide for men, women, and children.',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Daris',
        url: SITE_URL,
        logo: `${SITE_URL}/images/daris-logo.png`,
        description: 'Personalised online Quran, Arabic language, and Islamic studies lessons with an Al-Azhar-trained Sheikh.',
        availableLanguage: ['English', 'Arabic'],
        areaServed: 'Worldwide',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Daris',
        url: SITE_URL,
        inLanguage: ['en', 'ar'],
      },
    ],
  },

  '/about': {
    title: 'About Daris | Al-Azhar Methodology Online',
    description: 'Learn about Daris and our Al-Azhar-trained instructor. Over 12 years of teaching experience, 500+ students across 30+ countries.',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Daris',
        url: `${SITE_URL}/about`,
        mainEntity: { '@type': 'EducationalOrganization', name: 'Daris', url: SITE_URL },
      },
    ],
  },

  '/programs': {
    title: 'Programs | Quran, Arabic & Fiqh Courses — Daris',
    description: 'Explore our structured programs in Quran recitation and tajwid, classical Arabic language, and Hanafi fiqh. Group and individual sessions available.',
    schema: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Daris Programs',
        url: `${SITE_URL}/programs`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@type': 'Course', name: 'Quran Studies', description: 'Recitation correction, tajwid rules, and tafsir understanding.', provider: { '@type': 'EducationalOrganization', name: 'Daris' } } },
          { '@type': 'ListItem', position: 2, item: { '@type': 'Course', name: 'Arabic Language', description: 'Classical Arabic grammar, vocabulary, and guided reading with classical texts.', provider: { '@type': 'EducationalOrganization', name: 'Daris' } } },
          { '@type': 'ListItem', position: 3, item: { '@type': 'Course', name: 'Fiqh & Islamic Studies', description: 'Hanafi fiqh, aqeedah, stories of the prophets, and the 40 Nawawi hadiths.', provider: { '@type': 'EducationalOrganization', name: 'Daris' } } },
        ],
      },
    ],
  },

  '/contact': {
    title: 'Contact Daris | Start Your Learning Journey',
    description: 'Get in touch with Daris via WhatsApp for personalised Quran, Arabic, and Islamic studies guidance. English and Arabic support available.',
    schema: [
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
  },
};

/**
 * Build the meta HTML string to inject into <head> for a given route.
 * Returns null if route has no SEO config (auth pages, etc.)
 */
export function buildMetaHtml(routePath) {
  const seo = seoRoutes[routePath];
  if (!seo) return null;

  const ogImage = `${SITE_URL}/images/daris-og.png`;

  const metaTags = `
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Daris" />
    <meta property="og:title" content="${seo.title}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${SITE_URL}${routePath === '/' ? '' : routePath}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${seo.title}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${SITE_URL}${routePath === '/' ? '' : routePath}" />`;

  const schemaScripts = seo.schema
    .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');

  return `${metaTags}\n    ${schemaScripts}`;
}
