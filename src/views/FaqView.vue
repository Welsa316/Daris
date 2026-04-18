<template>
  <div>
    <!-- ═══════════════════════════════════════════
         SECTION 1: Editorial Hero
         Short, direct. FAQ is a utility page, not a
         brand statement. Same visual register as
         /about so the site reads as one world.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-28 md:py-36">
      <div class="absolute top-1/2 ltr:left-1/3 rtl:right-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.025] blur-[140px]" aria-hidden="true"></div>
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="max-w-3xl">
          <p class="text-gold/50 text-[10px] font-semibold tracking-[0.45em] uppercase mb-8 hero-entrance hero-entrance-1">
            {{ $t('faq.eyebrow') }}
          </p>
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-8 hero-entrance hero-entrance-2 text-balance">
            {{ $t('faq.title') }}
          </h1>
          <p class="text-lg md:text-xl text-cream/40 leading-relaxed max-w-xl hero-entrance hero-entrance-3 text-pretty">
            {{ $t('faq.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: FAQ entries
         Semantic <details> elements. keyboard-
         friendly, native expand/collapse, indexable
         by crawlers even if closed.
         ═══════════════════════════════════════════ -->
    <section class="bg-cream py-20 md:py-28">
      <div class="section-wide">
        <div class="max-w-3xl mx-auto">
          <div class="w-10 h-px bg-gold/40 mb-12" aria-hidden="true"></div>

          <ol class="space-y-4">
            <li
              v-for="(entry, i) in faqEntries"
              :key="entry.qKey"
              class="rounded-2xl border border-cream-200/60 bg-cream-50"
              data-reveal
              :data-reveal-delay="i * 40"
            >
              <details class="group">
                <summary
                  class="flex w-full items-start gap-4 cursor-pointer px-5 py-5 md:px-7 md:py-6 text-start list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-2xl"
                >
                  <span class="text-[11px] font-semibold text-gold tabular-nums tracking-[0.2em] mt-1 shrink-0">
                    {{ String(i + 1).padStart(2, '0') }}
                  </span>
                  <span class="flex-1 font-display text-lg md:text-xl text-primary-950 leading-snug text-balance">
                    {{ $t(entry.qKey) }}
                  </span>
                  <!-- Chevron that rotates on open -->
                  <svg
                    class="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div class="px-5 pb-5 md:px-7 md:pb-7 ltr:pl-[3.5rem] rtl:pr-[3.5rem]">
                  <p class="text-sm md:text-base text-slate-600 leading-relaxed text-pretty">
                    {{ $t(entry.aKey) }}
                  </p>
                </div>
              </details>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 3: CTA close
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-24 md:py-32">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gold/[0.02] blur-[150px]" aria-hidden="true"></div>

      <div class="section-wide relative text-center">
        <div class="w-10 h-px bg-gold/30 mx-auto mb-10" data-reveal aria-hidden="true"></div>

        <h2
          class="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.1] mb-6 max-w-2xl mx-auto text-balance"
          data-reveal="cinematic"
        >
          {{ $t('faq.ctaTitle') }}
        </h2>

        <p
          class="text-base text-cream/30 max-w-sm mx-auto mb-12 text-pretty"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('faq.ctaText') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center" data-reveal data-reveal-delay="300">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="gold">
            {{ $t('faq.ctaWhatsApp') }}
          </CTAButton>
          <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
            <span class="text-cream">{{ $t('faq.ctaEmail') }}</span>
          </CTAButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/useScrollReveal';
import { usePageSeo } from '@/composables/usePageSeo';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';
import { useWhatsApp } from '@/composables/useWhatsApp';

usePageSeo('faq');
const { contactEmail } = contactConfig;
const { whatsAppHref } = useWhatsApp();

// 10 FAQ entries. question/answer i18n key pairs. The same list drives
// FAQPage schema on both server (seoMeta.js) and client (usePageSeo.js).
const faqEntries = Array.from({ length: 10 }, (_, i) => ({
  qKey: `faq.q${i + 1}`,
  aKey: `faq.a${i + 1}`,
}));

useScrollReveal();
</script>

<style scoped>
/* Strip the default <details> marker so our custom chevron is the only
   disclosure indicator, and preserve Safari's list-marker handling. */
summary::-webkit-details-marker {
  display: none;
}
summary::marker {
  content: '';
}
</style>
