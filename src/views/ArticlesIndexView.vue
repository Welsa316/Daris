<template>
  <div>
    <!-- ═══════════════════════════════════════════
         SECTION 1: Editorial Hero
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-28 md:py-36">
      <div class="absolute top-1/2 ltr:left-1/3 rtl:right-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.025] blur-[140px]" aria-hidden="true"></div>
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="max-w-3xl">
          <p class="text-gold/50 text-[10px] font-semibold tracking-[0.45em] uppercase mb-8 hero-entrance hero-entrance-1">
            {{ $t('articles.eyebrow') }}
          </p>
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-8 hero-entrance hero-entrance-2 text-balance">
            {{ $t('articles.title') }}
          </h1>
          <p class="text-lg md:text-xl text-cream/40 leading-relaxed max-w-xl hero-entrance hero-entrance-3 text-pretty">
            {{ $t('articles.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: Article list
         Simple editorial stack. title, excerpt, tag
         + read-time meta. Each row is a RouterLink.
         ═══════════════════════════════════════════ -->
    <section class="bg-cream py-20 md:py-28">
      <div class="section-wide">
        <div class="max-w-3xl mx-auto">
          <div class="w-10 h-px bg-gold/40 mb-12" aria-hidden="true"></div>

          <ol class="divide-y divide-slate-200/60">
            <li
              v-for="(a, i) in articles"
              :key="a.slug"
              class="py-8 md:py-10 first:pt-0 last:pb-0"
              data-reveal
              :data-reveal-delay="i * 40"
            >
              <RouterLink
                :to="`/${locale}/articles/${a.slug}`"
                class="group flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl"
              >
                <div class="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
                  <span class="text-gold">{{ a.tag }}</span>
                  <span class="text-slate-300" aria-hidden="true">·</span>
                  <span class="text-slate-500 tabular-nums">{{ a.readMins }} min read</span>
                </div>
                <h2 class="font-display text-2xl md:text-3xl text-primary-950 leading-[1.2] text-balance group-hover:text-primary transition-colors duration-200">
                  {{ a.title }}
                </h2>
                <p class="text-base text-slate-600 leading-relaxed text-pretty max-w-2xl">
                  {{ a.excerpt }}
                </p>
              </RouterLink>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSeoMeta, useHead } from '@unhead/vue';
import { useScrollReveal } from '@/composables/useScrollReveal';
import { articles } from '@/content/articles/registry';

const SITE_URL = 'https://daris.education';
const { t, locale } = useI18n();

// Articles are currently English-only. We deliberately DON'T emit hreflang
// alternates because the AR counterpart (`/ar/articles`) 301-redirects to
// the EN page. pointing a `hreflang="ar"` at a redirect confuses crawlers.
// When real AR translations exist, swap back to `usePageSeo('articles')`.
const title = computed(() => t('seo.articles.title'));
const description = computed(() => t('seo.articles.description'));
const canonicalUrl = `${SITE_URL}/en/articles`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogSiteName: 'Daris',
  ogImage: `${SITE_URL}/images/daris-og.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogUrl: canonicalUrl,
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: `${SITE_URL}/images/daris-og.png`,
});

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Daris Articles',
        url: canonicalUrl,
        inLanguage: 'en',
        description:
          'Long-form articles on learning Quran, Arabic, and fiqh online. Methodology, ijazah, classical Arabic, Hanafi tradition, and choosing a teacher.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/en/articles/${a.slug}`,
            name: a.title,
          })),
        },
      }),
    },
  ],
});

useScrollReveal();
</script>
