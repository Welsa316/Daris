<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        :eyebrow="$t('about.eyebrow')"
        :title="$t('about.title')"
        :description="$t('about.description')"
      />
    </section>

    <!-- Main content -->
    <section class="section-container pb-16">
      <div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
        <div class="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          <p>
            {{ $t('about.text1') }}
          </p>
          <p>
            {{ $t('about.text2') }}
          </p>
        </div>

        <aside class="space-y-5">
          <figure class="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-primary/10 shadow-card bg-white group">
            <img
              src="/images/sheikh-placeholder.svg"
              :alt="$t('about.photoAlt')"
              class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-xs text-cream px-4 py-4">
              {{ $t('about.photoCaption') }}
            </figcaption>
          </figure>

          <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-5 text-sm text-slate-600">
            <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              {{ $t('about.credentialsTitle') }}
            </h3>
            <ul class="space-y-2.5">
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('about.credTeaching') }} <em class="text-slate-400">{{ $t('about.credTeachingVal') }}</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('about.credQuran') }} <em class="text-slate-400">{{ $t('about.credQuranVal') }}</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('about.credFiqh') }} <em class="text-slate-400">{{ $t('about.credFiqhVal') }}</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('about.credArabic') }} <em class="text-slate-400">{{ $t('about.credArabicVal') }}</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('about.credCerts') }} <em class="text-slate-400">{{ $t('about.credCertsVal') }}</em></span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <GeometricDivider spacing="py-2" />

    <!-- Philosophy + Languages -->
    <section class="section-container py-16 md:py-20">
      <div class="grid gap-8 md:grid-cols-2">
        <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
          <h3 class="text-base font-semibold text-slate-900 mb-3">
            {{ $t('about.philosophyTitle') }}
          </h3>
          <p>
            {{ $t('about.philosophyText') }}
          </p>
        </div>

        <div class="rounded-2xl bg-primary/[0.03] border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
          <h3 class="text-base font-semibold text-slate-900 mb-3">
            {{ $t('about.langTitle') }}
          </h3>
          <p>
            {{ $t('about.langText') }}
          </p>
        </div>
      </div>
    </section>

    <!-- CTA banner -->
    <section class="section-container pb-16 md:pb-20">
      <div class="relative overflow-hidden rounded-2xl bg-primary text-cream px-8 py-10 sm:px-10 sm:py-12">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gold/[0.06] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>

        <div class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold mb-2">
              {{ $t('about.ctaTitle') }}
            </h2>
            <p class="text-sm sm:text-base text-cream/85 max-w-md">
              {{ $t('about.ctaText') }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <CTAButton
              :asLink="true"
              :href="whatsAppHref"
              :external="true"
              variant="cream"
            >
              {{ $t('about.ctaWhatsApp') }}
            </CTAButton>
            <CTAButton
              :asLink="true"
              :href="`mailto:${contactEmail}`"
              variant="outline"
            >
              <span class="text-cream">{{ $t('about.ctaEmail') }}</span>
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import SectionHeader from '@/components/common/SectionHeader.vue';
import CTAButton from '@/components/common/CTAButton.vue';
import GeometricDivider from '@/components/common/GeometricDivider.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
