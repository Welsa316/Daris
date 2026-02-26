<template>
  <div>
    <!-- Hero -->
    <HeroSection />

    <!-- Trust strip -->
    <TrustStrip />

    <!-- Programs preview -->
    <section class="bg-cream py-20 md:py-28">
      <div class="section-container">
        <SectionHeader
          :eyebrow="$t('home.programsEyebrow')"
          :title="$t('home.programsTitle')"
        />
        <div class="grid gap-8 md:grid-cols-3">
          <ProgramCard
            :title="$t('home.quranTitle')"
            :tag="$t('home.quranTag')"
            :bullets="[
              $t('home.quranBullet1'),
              $t('home.quranBullet2'),
              $t('home.quranBullet3')
            ]"
          >
            <template #icon>
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </template>
          </ProgramCard>
          <ProgramCard
            :title="$t('home.arabicTitle')"
            :tag="$t('home.arabicTag')"
            :bullets="[
              $t('home.arabicBullet1'),
              $t('home.arabicBullet2'),
              $t('home.arabicBullet3')
            ]"
          >
            <template #icon>
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
            </template>
          </ProgramCard>
          <ProgramCard
            :title="$t('home.fiqhTitle')"
            :tag="$t('home.fiqhTag')"
            :bullets="[
              $t('home.fiqhBullet1'),
              $t('home.fiqhBullet2'),
              $t('home.fiqhBullet3')
            ]"
          >
            <template #icon>
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </template>
          </ProgramCard>
        </div>
      </div>
    </section>

    <!-- About preview -->
    <section class="bg-white py-20 md:py-28">
      <div class="section-container">
        <div class="grid gap-12 md:grid-cols-2 items-center">
          <!-- Image side -->
          <div class="flex justify-center order-2 md:order-1">
            <div class="relative">
              <div class="absolute -inset-4 rounded-3xl bg-primary/[0.04] blur-xl" aria-hidden="true"></div>
              <figure class="relative w-72 h-80 rounded-2xl overflow-hidden shadow-card bg-white">
                <img
                  src="/images/sheikh-placeholder.svg"
                  alt="Placeholder for Sheikh's photograph"
                  class="h-full w-full object-cover"
                />
                <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent text-xs text-cream px-5 py-5">
                  {{ $t('home.photoCaption') }}
                </figcaption>
              </figure>
            </div>
          </div>

          <!-- Text side -->
          <div class="order-1 md:order-2">
            <SectionHeader
              :eyebrow="$t('home.aboutEyebrow')"
              :title="$t('home.aboutTitle')"
              :centered="false"
            />
            <p class="text-base text-slate-500 leading-relaxed mb-8">
              {{ $t('home.aboutText') }}
            </p>
            <CTAButton :to="'/about'" variant="outline">
              {{ $t('home.learnMore') }}
              <svg class="h-4 w-4 ltr:ml-2 rtl:mr-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </CTAButton>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="bg-cream py-20 md:py-28">
      <div class="section-container">
        <SectionHeader
          :eyebrow="$t('home.howEyebrow')"
          :title="$t('home.howTitle')"
        />
        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="(step, i) in howItWorks"
            :key="i"
            class="relative bg-white rounded-2xl shadow-card p-8 text-center group transition-all duration-300 hover:shadow-card-hover"
          >
            <div class="mx-auto mb-5 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-cream text-lg font-bold shadow-soft group-hover:scale-110 transition-transform duration-300">
              {{ i + 1 }}
            </div>
            <h3 class="text-base font-semibold text-slate-900 mb-2">
              {{ step.title }}
            </h3>
            <p class="text-sm text-slate-500 leading-relaxed">
              {{ step.body }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-white py-20 md:py-28">
      <div class="section-container">
        <SectionHeader
          :eyebrow="$t('home.faqEyebrow')"
          :title="$t('home.faqTitle')"
        />
        <div class="max-w-3xl mx-auto">
          <FAQAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- Final CTA banner -->
    <section class="relative overflow-hidden bg-primary py-20 md:py-28">
      <div class="absolute inset-0 hero-pattern opacity-50" aria-hidden="true"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950/20 to-primary-900/30" aria-hidden="true"></div>

      <div class="section-container relative text-center">
        <h2 class="heading-display text-3xl sm:text-4xl text-cream mb-4 text-balance">
          {{ $t('home.ctaTitle') }}
        </h2>
        <p class="text-base text-cream/65 max-w-md mx-auto mb-10">
          {{ $t('home.ctaText') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton
            :asLink="true"
            :href="whatsAppHref"
            :external="true"
            variant="gold"
          >
            {{ $t('home.ctaWhatsApp') }}
          </CTAButton>
          <CTAButton
            :asLink="true"
            :href="`mailto:${contactEmail}`"
            variant="outline"
          >
            <span class="text-cream border-cream/20">{{ $t('home.ctaEmail') }}</span>
          </CTAButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import HeroSection from '@/components/home/HeroSection.vue';
import TrustStrip from '@/components/home/TrustStrip.vue';
import SectionHeader from '@/components/common/SectionHeader.vue';
import ProgramCard from '@/components/programs/ProgramCard.vue';
import FAQAccordion from '@/components/common/FAQAccordion.vue';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';

const { t } = useI18n();
const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const howItWorks = computed(() => [
  { title: t('home.howStep1Title'), body: t('home.howStep1Body') },
  { title: t('home.howStep2Title'), body: t('home.howStep2Body') },
  { title: t('home.howStep3Title'), body: t('home.howStep3Body') }
]);

const faqItems = computed(() => [
  { question: t('home.faq1Q'), answer: t('home.faq1A') },
  { question: t('home.faq2Q'), answer: t('home.faq2A') },
  { question: t('home.faq3Q'), answer: t('home.faq3A') },
  { question: t('home.faq4Q'), answer: t('home.faq4A') },
  { question: t('home.faq5Q'), answer: t('home.faq5A') }
]);
</script>
