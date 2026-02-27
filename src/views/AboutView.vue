<template>
  <div>
    <!-- Page banner -->
    <SectionBanner
      :eyebrow="$t('about.eyebrow')"
      :title="$t('about.title')"
      :description="$t('about.description')"
    />

    <!-- Main content -->
    <section class="bg-white py-20 md:py-28">
      <div class="section-container">
        <div class="grid gap-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-start">
          <div class="space-y-5 text-base text-slate-600 leading-relaxed">
            <p>{{ $t('about.text1') }}</p>
            <p>{{ $t('about.text2') }}</p>
          </div>

          <aside class="space-y-6">
            <figure class="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden shadow-card bg-white">
              <img
                src="/images/sheikh-placeholder.svg"
                :alt="$t('about.photoAlt')"
                class="h-64 w-full object-cover"
              />
              <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent text-xs text-cream px-5 py-5">
                {{ $t('about.photoCaption') }}
              </figcaption>
            </figure>

            <div class="rounded-2xl bg-cream shadow-card p-6 text-sm text-slate-600">
              <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-4">
                {{ $t('about.credentialsTitle') }}
              </h3>
              <ul class="space-y-3">
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credTeaching') }} <em class="text-slate-400">{{ $t('about.credTeachingVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credQuran') }} <em class="text-slate-400">{{ $t('about.credQuranVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credFiqh') }} <em class="text-slate-400">{{ $t('about.credFiqhVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credArabic') }} <em class="text-slate-400">{{ $t('about.credArabicVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credCerts') }} <em class="text-slate-400">{{ $t('about.credCertsVal') }}</em></span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Philosophy + Languages -->
    <section class="bg-cream py-20 md:py-28">
      <div class="section-container">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="rounded-2xl bg-white shadow-card p-8 text-sm text-slate-600 leading-relaxed">
            <div class="mb-4 h-11 w-11 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            </div>
            <h3 class="text-base font-semibold text-slate-900 mb-3">
              {{ $t('about.philosophyTitle') }}
            </h3>
            <p>{{ $t('about.philosophyText') }}</p>
          </div>

          <div class="rounded-2xl bg-white shadow-card p-8 text-sm text-slate-600 leading-relaxed">
            <div class="mb-4 h-11 w-11 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>
            </div>
            <h3 class="text-base font-semibold text-slate-900 mb-3">
              {{ $t('about.langTitle') }}
            </h3>
            <p>{{ $t('about.langText') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA banner -->
    <section class="relative overflow-hidden bg-primary py-20 md:py-24">
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950/20 to-primary-900/30" aria-hidden="true"></div>
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>

      <div class="section-container relative text-center">
        <h2 class="heading-display text-2xl sm:text-3xl text-cream mb-4 text-balance">
          {{ $t('about.ctaTitle') }}
        </h2>
        <p class="text-base text-cream/65 max-w-md mx-auto mb-10">
          {{ $t('about.ctaText') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="gold">
            {{ $t('about.ctaWhatsApp') }}
          </CTAButton>
          <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
            <span class="text-cream">{{ $t('about.ctaEmail') }}</span>
          </CTAButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import SectionBanner from '@/components/common/SectionBanner.vue';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
