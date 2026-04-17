<template>
  <div v-if="article">
    <!-- ═══════════════════════════════════════════
         SECTION 1: Article hero — eyebrow tag, title,
         excerpt, read-time meta. Same register as
         /about and /faq so the site reads as one world.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-28 md:py-36">
      <div class="absolute top-1/2 ltr:left-1/3 rtl:right-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.025] blur-[140px]" aria-hidden="true"></div>
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="max-w-3xl">
          <div class="flex items-center gap-3 text-[11px] font-semibold tracking-[0.25em] uppercase mb-8 hero-entrance hero-entrance-1">
            <span class="text-gold">{{ article.tag }}</span>
            <span class="text-cream/30" aria-hidden="true">·</span>
            <span class="text-cream/40 tabular-nums">{{ article.readMins }} min read</span>
            <span class="text-cream/30" aria-hidden="true">·</span>
            <time :datetime="article.date" class="text-cream/40 tabular-nums">{{ formattedDate }}</time>
          </div>
          <h1 class="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.12] mb-8 hero-entrance hero-entrance-2 text-balance">
            {{ article.title }}
          </h1>
          <p class="text-lg md:text-xl text-cream/40 leading-relaxed max-w-2xl hero-entrance hero-entrance-3 text-pretty">
            {{ article.excerpt }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: Article body
         Renders the article's own Vue component, which
         supplies the prose + headings under a prose class
         for typography consistency.
         ═══════════════════════════════════════════ -->
    <article class="bg-cream py-20 md:py-28">
      <div class="section-wide">
        <div class="max-w-2xl mx-auto">
          <div class="w-10 h-px bg-gold/40 mb-12" aria-hidden="true"></div>
          <div class="article-prose">
            <component :is="bodyComponent" />
          </div>

          <!-- Byline + CTA footer -->
          <footer class="mt-16 pt-10 border-t border-slate-200/60">
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
              Written by Daris
            </p>
            <p class="text-sm text-slate-500 leading-relaxed mb-6 text-pretty">
              Daris is an online Islamic-education platform teaching Quran, Arabic, and Fiqh in the methodology of Al-Azhar Al-Sharif. One-on-one live instruction, bilingual (English + Arabic), worldwide.
            </p>
            <div class="flex flex-wrap gap-3">
              <RouterLink :to="`/${locale}/programs`" class="inline-flex items-center gap-2 rounded-full bg-primary text-cream px-5 py-2.5 text-sm font-semibold hover:bg-primary-800 transition-colors">
                See programmes
                <svg class="h-3.5 w-3.5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </RouterLink>
              <RouterLink :to="`/${locale}/articles`" class="inline-flex items-center gap-2 rounded-full border border-slate-300 text-slate-600 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
                More articles
              </RouterLink>
            </div>
          </footer>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, ref, watchEffect } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSeoMeta, useHead } from '@unhead/vue';
import { findArticle } from '@/content/articles/registry';

const SITE_URL = 'https://daris.education';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();

// Resolve slug → article entry. Unknown slugs bounce to the articles index
// rather than 404 the SPA so the user always lands on something useful.
const article = computed(() => findArticle(route.params.slug));
watchEffect(() => {
  if (!article.value && route.params.slug) {
    router.replace(`/${locale.value}/articles`);
  }
});

// Lazy-load the body component declared in the registry.
const bodyComponent = ref(null);
watchEffect(async () => {
  if (!article.value) return;
  const mod = await article.value.component();
  bodyComponent.value = mod.default;
});

const formattedDate = computed(() => {
  if (!article.value) return '';
  return new Date(article.value.date).toLocaleDateString(
    locale.value === 'ar' ? 'ar-EG' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );
});

// Per-article SEO: unique title, description, canonical, and JSON-LD
// Article schema. The hreflang alternates point at the same slug under
// both locales — when AR translations land the same URL serves the AR
// version; until then the /ar/articles/<slug> URL is intentionally
// omitted from the sitemap so Google does not try to index an empty page.
const articleUrl = computed(() =>
  article.value ? `${SITE_URL}/${locale.value}/articles/${article.value.slug}` : SITE_URL
);
const metaTitle = computed(() =>
  article.value ? `${article.value.title} — Daris` : 'Daris'
);
const metaDesc = computed(() => article.value?.description || '');

useSeoMeta({
  title: metaTitle,
  description: metaDesc,
  ogTitle: metaTitle,
  ogDescription: metaDesc,
  ogType: 'article',
  ogImage: `${SITE_URL}/images/daris-og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: articleUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: metaTitle,
  twitterDescription: metaDesc,
  twitterImage: `${SITE_URL}/images/daris-og.png`,
});

useHead({
  link: [{ rel: 'canonical', href: articleUrl }],
  script: computed(() =>
    article.value
      ? [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.value.title,
              description: article.value.description,
              inLanguage: locale.value === 'ar' ? 'ar' : 'en',
              datePublished: article.value.date,
              dateModified: article.value.date,
              image: `${SITE_URL}/images/daris-og.png`,
              author: { '@type': 'Organization', name: 'Daris', url: SITE_URL },
              publisher: {
                '@type': 'Organization',
                name: 'Daris',
                url: SITE_URL,
                logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/daris-logo.png` },
              },
              mainEntityOfPage: articleUrl.value,
            }),
          },
        ]
      : []
  ),
});
</script>

<style>
/* Typography scale for article body content. Lives outside `scoped` so
   each per-article component's <h2>, <p>, <ul>, <blockquote>, etc. pick
   it up without needing to restate typography in every file. */
.article-prose {
  color: theme('colors.slate.700');
  font-size: 1.0625rem;
  line-height: 1.8;
}
.article-prose > * + * { margin-top: 1.5em; }
.article-prose h2 {
  font-family: theme('fontFamily.display');
  color: theme('colors.primary.950');
  font-size: 1.75rem;
  line-height: 1.2;
  text-wrap: balance;
  margin-top: 2.25em;
  margin-bottom: 0.6em;
}
.article-prose h3 {
  font-family: theme('fontFamily.display');
  color: theme('colors.primary.900');
  font-size: 1.3125rem;
  line-height: 1.3;
  text-wrap: balance;
  margin-top: 2em;
  margin-bottom: 0.5em;
}
.article-prose p { text-wrap: pretty; }
.article-prose ul, .article-prose ol {
  list-style: disc;
  padding-inline-start: 1.5em;
}
.article-prose ol { list-style: decimal; }
.article-prose li + li { margin-top: 0.4em; }
.article-prose blockquote {
  border-inline-start: 3px solid theme('colors.gold.DEFAULT');
  padding-inline-start: 1.25em;
  font-style: italic;
  color: theme('colors.slate.600');
}
.article-prose strong { color: theme('colors.primary.950'); font-weight: 600; }
.article-prose a {
  color: theme('colors.primary.DEFAULT');
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-prose a:hover { color: theme('colors.primary.800'); }
.article-prose code {
  background: theme('colors.cream.100');
  padding: 0.125em 0.4em;
  border-radius: 0.25em;
  font-size: 0.9em;
}
</style>
