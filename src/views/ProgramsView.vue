<template>
  <div>
    <!-- ═══════════════════════════════════════════
         SECTION 1: Editorial Hero
         Matches About page register — dark surface,
         large serif headline, no generic banner.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 pt-36 md:pt-44 pb-24 md:pb-32">
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <div class="absolute top-1/2 ltr:right-1/4 rtl:left-1/4 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-gold/[0.02] blur-[130px]" aria-hidden="true"></div>
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="max-w-3xl">
          <p class="text-gold/50 text-[10px] font-semibold tracking-[0.45em] uppercase mb-8 hero-entrance hero-entrance-1">
            {{ $t('programs.eyebrow') }}
          </p>
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-6 hero-entrance hero-entrance-2">
            {{ $t('programs.title') }}
          </h1>
          <p class="text-lg text-cream/40 leading-relaxed max-w-xl hero-entrance hero-entrance-3">
            {{ $t('programs.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: Program Cards + Sidebar
         Enhanced card design with scroll-reveal and
         stronger visual hierarchy.
         ═══════════════════════════════════════════ -->
    <section class="bg-white py-20 md:py-32">
      <div class="section-wide">
        <div class="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)] items-start">
          <!-- Program cards -->
          <div class="space-y-10">
            <article
              v-for="(program, i) in programs"
              :key="program.titleKey"
              class="rounded-2xl bg-cream-50 border border-cream-200/60 overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
              data-reveal
              :data-reveal-delay="i * 100"
            >
              <!-- Visual header — deeper gradient, more presence -->
              <div class="relative h-32 bg-gradient-to-br from-primary-800 via-primary to-primary-950 flex items-center overflow-hidden">
                <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
                <!-- Subtle lateral glow -->
                <div class="absolute top-0 ltr:right-0 rtl:left-0 w-1/2 h-full bg-gradient-to-l from-gold/[0.04] to-transparent ltr:block rtl:hidden" aria-hidden="true"></div>
                <div class="absolute top-0 ltr:left-0 rtl:right-0 w-1/2 h-full bg-gradient-to-r from-gold/[0.04] to-transparent rtl:block ltr:hidden" aria-hidden="true"></div>

                <div class="relative px-8 flex items-center gap-4">
                  <span class="h-12 w-12 rounded-xl bg-cream/10 backdrop-blur-sm flex items-center justify-center text-cream/80" v-html="program.icon" aria-hidden="true"></span>
                  <div>
                    <h2 class="text-xl font-display font-semibold text-cream">{{ $t(program.titleKey) }}</h2>
                    <p class="text-[10px] text-cream/50 font-semibold uppercase tracking-[0.2em] mt-0.5">{{ $t(program.tagKey) }}</p>
                  </div>
                </div>
              </div>

              <div class="p-8 text-sm text-slate-600 leading-relaxed">
                <ul class="space-y-3 mb-5">
                  <li v-for="bk in program.bulletKeys" :key="bk" class="flex gap-3 items-start">
                    <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                    <span>{{ $t(bk) }}</span>
                  </li>
                </ul>
                <p class="text-xs text-slate-400 pt-5 border-t border-slate-200/40 leading-relaxed">
                  {{ $t(program.noteKey) }}
                </p>
              </div>
            </article>
          </div>

          <!-- Sidebar -->
          <aside class="space-y-8 lg:sticky lg:top-28">
            <!-- Pricing CTA — deeper, more cinematic -->
            <div
              class="relative overflow-hidden rounded-2xl bg-primary-950 text-cream p-8"
              data-reveal
              data-reveal-delay="200"
            >
              <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
              <div class="absolute top-0 ltr:right-0 rtl:left-0 w-2/3 h-full bg-gradient-to-l from-gold/[0.03] to-transparent ltr:block rtl:hidden" aria-hidden="true"></div>
              <div class="absolute top-0 ltr:left-0 rtl:right-0 w-2/3 h-full bg-gradient-to-r from-gold/[0.03] to-transparent rtl:block ltr:hidden" aria-hidden="true"></div>

              <div class="relative">
                <div class="w-8 h-px bg-gold/40 mb-6" aria-hidden="true"></div>
                <h3 class="font-display text-xl font-semibold mb-3">{{ $t('programs.pricingTitle') }}</h3>
                <p class="text-sm text-cream/40 mb-8 leading-relaxed">
                  {{ $t('programs.pricingText') }}
                </p>
                <div class="flex flex-col gap-3">
                  <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="gold">
                    {{ $t('programs.ctaWhatsApp') }}
                  </CTAButton>
                  <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
                    <span class="text-cream">{{ $t('programs.ctaEmail') }}</span>
                  </CTAButton>
                </div>
              </div>
            </div>

            <!-- Logistics -->
            <div
              class="rounded-2xl bg-cream-50 border border-cream-200/60 p-7 text-sm text-slate-600"
              data-reveal
              data-reveal-delay="300"
            >
              <h3 class="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold mb-5">
                {{ $t('programs.logisticsTitle') }}
              </h3>
              <ul class="space-y-3.5">
                <li v-for="lk in logisticKeys" :key="lk" class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t(lk) }}</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/useScrollReveal';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const programs = [
  {
    titleKey: 'programs.quranTitle',
    tagKey: 'programs.quranTag',
    bulletKeys: ['programs.quranBullet1', 'programs.quranBullet2', 'programs.quranBullet3'],
    noteKey: 'programs.quranNote',
    icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>'
  },
  {
    titleKey: 'programs.arabicTitle',
    tagKey: 'programs.arabicTag',
    bulletKeys: ['programs.arabicBullet1', 'programs.arabicBullet2', 'programs.arabicBullet3'],
    noteKey: 'programs.arabicNote',
    icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>'
  },
  {
    titleKey: 'programs.fiqhTitle',
    tagKey: 'programs.fiqhTag',
    bulletKeys: ['programs.fiqhBullet1', 'programs.fiqhBullet2', 'programs.fiqhBullet3'],
    noteKey: 'programs.fiqhNote',
    icon: '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>'
  }
];

const logisticKeys = [
  'programs.logistic1',
  'programs.logistic2',
  'programs.logistic3',
  'programs.logistic4'
];

useScrollReveal();
</script>
