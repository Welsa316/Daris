<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        :eyebrow="$t('programs.eyebrow')"
        :title="$t('programs.title')"
        :description="$t('programs.description')"
      />
    </section>

    <!-- Main layout -->
    <section class="section-container pb-16 md:pb-20">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] items-start">
        <!-- Program sections -->
        <div class="space-y-8">
          <!-- Quran -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">{{ $t('programs.quranTitle') }}</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                {{ $t('programs.quranTag') }}
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>{{ $t('programs.quranBullet1') }}</li>
                <li>{{ $t('programs.quranBullet2') }}</li>
                <li>{{ $t('programs.quranBullet3') }}</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                {{ $t('programs.quranNote') }}
              </p>
            </div>
          </article>

          <!-- Arabic -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">{{ $t('programs.arabicTitle') }}</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                {{ $t('programs.arabicTag') }}
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>{{ $t('programs.arabicBullet1') }}</li>
                <li>{{ $t('programs.arabicBullet2') }}</li>
                <li>{{ $t('programs.arabicBullet3') }}</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                {{ $t('programs.arabicNote') }}
              </p>
            </div>
          </article>

          <!-- Fiqh -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">{{ $t('programs.fiqhTitle') }}</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                {{ $t('programs.fiqhTag') }}
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>{{ $t('programs.fiqhBullet1') }}</li>
                <li>{{ $t('programs.fiqhBullet2') }}</li>
                <li>{{ $t('programs.fiqhBullet3') }}</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                {{ $t('programs.fiqhNote') }}
              </p>
            </div>
          </article>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6 lg:sticky lg:top-24">
          <div class="relative overflow-hidden rounded-2xl bg-primary text-cream p-6 sm:p-7">
            <div class="absolute top-0 right-0 w-40 h-40 bg-gold/[0.08] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>
            <div class="relative">
              <h3 class="text-lg font-semibold mb-2">{{ $t('programs.pricingTitle') }}</h3>
              <p class="text-sm text-cream/85 mb-6 leading-relaxed">
                {{ $t('programs.pricingText') }}
              </p>
              <div class="flex flex-col gap-3">
                <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="cream">
                  {{ $t('programs.ctaWhatsApp') }}
                </CTAButton>
                <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
                  <span class="text-cream">{{ $t('programs.ctaEmail') }}</span>
                </CTAButton>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-6 text-sm text-slate-600">
            <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-3">
              {{ $t('programs.logisticsTitle') }}
            </h3>
            <ul class="space-y-2">
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('programs.logistic1') }}</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('programs.logistic2') }}</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('programs.logistic3') }}</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>{{ $t('programs.logistic4') }}</span>
              </li>
            </ul>
          </div>

          <TestimonialCard
            :visible="false"
            :text="$t('programs.testimonialText')"
            :name="$t('programs.testimonialName')"
            :detail="$t('programs.testimonialDetail')"
          />
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import SectionHeader from '@/components/common/SectionHeader.vue';
import CTAButton from '@/components/common/CTAButton.vue';
import TestimonialCard from '@/components/common/TestimonialCard.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
