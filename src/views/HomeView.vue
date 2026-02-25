<template>
  <div>
    <!-- Hero -->
    <HeroSection />

    <!-- Trust strip -->
    <TrustStrip />

    <!-- Programs preview -->
    <section class="section-container py-16 md:py-20">
      <SectionHeader
        eyebrow="Programs"
        title="Three focused paths of study"
      />
      <div class="grid gap-6 md:grid-cols-3">
        <ProgramCard
          title="Quran"
          tag="Tajwid · Memorisation · Recitation"
          description="Correct recitation, tajwid, and structured memorisation with consistent revision."
          :bullets="[
            'Tajwid and letter clarity',
            'Fluent, paced recitation',
            'Memorisation with review'
          ]"
        >
          <template #icon>
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </template>
        </ProgramCard>
        <ProgramCard
          title="Arabic"
          tag="Reading · Grammar · Support"
          description="Reading fluency, grammar foundations, and guided practice with classical texts."
          :bullets="[
            'Reading fluency and pronunciation',
            'Core grammar and structure',
            'Guided reading practice'
          ]"
        >
          <template #icon>
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
            </svg>
          </template>
        </ProgramCard>
        <ProgramCard
          title="Fiqh"
          tag="Practical worship · Daily life"
          description="Practical understanding of worship and everyday rulings, with space for real questions."
          :bullets="[
            'Prayer, fasting, zakat basics',
            'Applied daily-life scenarios',
            'Considered, practical Q&amp;A'
          ]"
        >
          <template #icon>
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </template>
        </ProgramCard>
      </div>
    </section>

    <!-- Geometric divider -->
    <GeometricDivider />

    <!-- About preview -->
    <section class="section-container pb-16 md:pb-20 grid gap-10 md:grid-cols-2 items-center">
      <div>
        <SectionHeader
          eyebrow="About"
          title="Studying with Daris"
          :centered="false"
        />
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
          Patient, one-to-one teaching with emphasis on careful recitation,
          gradual understanding, and consistent revision. English support
          available through our team.
        </p>
        <CTAButton :to="'/about'" variant="outline">
          Learn more
        </CTAButton>
      </div>
      <div class="flex justify-center">
        <figure class="relative w-64 h-72 rounded-2xl overflow-hidden border border-primary/10 shadow-card bg-white group">
          <img
            src="/images/sheikh-placeholder.svg"
            alt="Placeholder for Sheikh's photograph"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-xs text-cream px-4 py-4">
            Replace with the Sheikh's photo.
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Geometric divider -->
    <GeometricDivider />

    <!-- How it works -->
    <section class="section-container py-16 md:py-20">
      <SectionHeader
        eyebrow="How it works"
        title="Three simple steps"
      />
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="(step, i) in howItWorks"
          :key="i"
          class="rounded-2xl bg-white border border-primary/5 shadow-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
        >
          <div class="flex items-center gap-3 mb-4">
            <span class="h-10 w-10 rounded-full bg-primary text-cream flex items-center justify-center text-sm font-bold">
              {{ i + 1 }}
            </span>
            <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold">
              Step {{ i + 1 }}
            </p>
          </div>
          <h3 class="text-base font-semibold text-slate-900 mb-1">
            {{ step.title }}
          </h3>
          <p class="text-sm text-slate-600">
            {{ step.body }}
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="bg-white/50 border-y border-primary/5">
      <div class="section-container py-16 md:py-20">
        <SectionHeader
          eyebrow="Questions"
          title="Frequently asked questions"
        />
        <div class="max-w-3xl mx-auto">
          <FAQAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- Final CTA banner -->
    <section class="section-container py-16 md:py-20">
      <div class="relative overflow-hidden rounded-2xl bg-primary text-cream px-8 py-10 sm:px-10 sm:py-12">
        <div class="absolute top-0 right-0 w-64 h-64 bg-gold/[0.06] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-cream/[0.04] rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" aria-hidden="true"></div>

        <div class="relative flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold mb-2 text-balance">
              Ready to begin?
            </h2>
            <p class="text-sm sm:text-base text-cream/85 max-w-md">
              Share your background and availability. We'll reply with next steps.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <CTAButton
              :asLink="true"
              :href="whatsAppHref"
              :external="true"
              variant="cream"
            >
              Contact on WhatsApp
            </CTAButton>
            <CTAButton
              :asLink="true"
              :href="`mailto:${contactEmail}`"
              variant="outline"
            >
              <span class="text-cream border-cream">Email Daris</span>
            </CTAButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSection from '@/components/home/HeroSection.vue';
import TrustStrip from '@/components/home/TrustStrip.vue';
import SectionHeader from '@/components/common/SectionHeader.vue';
import ProgramCard from '@/components/programs/ProgramCard.vue';
import FAQAccordion from '@/components/common/FAQAccordion.vue';
import CTAButton from '@/components/common/CTAButton.vue';
import GeometricDivider from '@/components/common/GeometricDivider.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const howItWorks = [
  {
    title: 'Contact',
    body: 'Reach out with your goals, timezone, and preferred times.'
  },
  {
    title: 'Assessment',
    body: 'A short recitation or language check to gauge your level.'
  },
  {
    title: 'Schedule',
    body: 'Agree on a plan and frequency. Contact for pricing.'
  }
];

const faqItems = [
  {
    question: 'Are lessons fully online?',
    answer: 'Yes. All lessons use stable video tools — join from anywhere with a reliable connection.'
  },
  {
    question: 'What ages do you teach?',
    answer: 'Mature children, teenagers, and adults. Younger children welcome with parental agreement.'
  },
  {
    question: 'How does pricing work?',
    answer: 'Pricing depends on lesson length, frequency, and format. Contact for details.'
  },
  {
    question: 'Which timezones do you support?',
    answer: 'Students attend from multiple regions. We find times that work for both sides.'
  },
  {
    question: 'Is there a trial lesson?',
    answer: 'The first lesson typically serves as both an assessment and a chance to see if the style suits you.'
  },
  {
    question: 'Do you provide materials?',
    answer: 'Yes. Recommended texts and resources are shared, with guidance on what to prepare.'
  },
  {
    question: 'What language is used?',
    answer: 'Arabic is primary for texts and recitation. English support available through our team.'
  }
];
</script>
