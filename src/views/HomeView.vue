<template>
  <div>
    <HeroSection />
    <TrustStrip />

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SectionHeader
        eyebrow="Programs"
        title="Three focused paths of study"
        description="Choose where to begin, or combine programs with a schedule that reflects your current commitments."
      />
      <div class="grid gap-6 md:grid-cols-3">
        <ProgramCard
          title="Quran"
          tag="Tajwid • Memorisation • Recitation"
          description="Develop steady, correct recitation with attention to tajwid, fluency, and if desired, memorisation with revision."
          :bullets="[
            'Foundations of tajwid and clarity of letters',
            'Fluent recitation with consistent pacing',
            'Structured memorisation plans with review'
          ]"
          note="Suitable for beginners through to students refining khushuʿ and precision."
        />
        <ProgramCard
          title="Arabic"
          tag="Reading • Grammar • Support"
          description="Build the tools to approach classical texts with confidence: reading, grammar foundations, and guided practice."
          :bullets="[
            'Arabic reading fluency and pronunciation',
            'Core grammar and sentence structure',
            'Guided reading of selected texts'
          ]"
          note="Conversational support is available if it serves your study goals."
        />
        <ProgramCard
          title="Fiqh"
          tag="Practical worship • Daily life"
          description="Gain practical understanding of worship, purification, and everyday issues, with space for your real questions."
          :bullets="[
            'Purification, prayer, fasting, zakat basics',
            'Applied scenarios from daily life',
            'Space to ask considered, practical questions'
          ]"
          note="Focused on clarity and implementation rather than debate."
        />
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 grid gap-10 md:grid-cols-2 items-center">
      <div>
        <SectionHeader
          eyebrow="About"
          title="Studying with Daris"
          description="Lessons are calm, deliberate, and paced to build lasting benefit rather than quick impressions."
        />
        <p class="text-sm sm:text-base text-slate-700 mb-4">
          The Sheikh has taught students across different backgrounds and timezones, with an emphasis on
          careful recitation, gradual understanding, and consistent revision. English-speaking support is
          available through the team to help clarify scheduling, expectations, and any questions that arise.
        </p>
        <p class="text-sm sm:text-base text-slate-700">
          The focus is not on marketing language or large numbers, but on steady, attentive learning for each
          individual or small group.
        </p>
      </div>
      <div class="flex justify-center">
        <figure class="relative w-64 h-64 rounded-3xl overflow-hidden border border-emerald-900/10 shadow-soft-lg bg-white">
          <img
            src="/src/assets/sheikh-placeholder.svg"
            alt="Placeholder for Sheikh’s photograph"
            class="h-full w-full object-cover"
          />
          <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 to-transparent text-xs text-cream px-4 py-3">
            Sheikh’s photo – replace this placeholder with an appropriate image.
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
      <SectionHeader
        eyebrow="How it works"
        title="A simple, three-step process"
      />
      <div class="grid gap-6 md:grid-cols-3 text-sm text-slate-700">
        <div class="rounded-2xl bg-white border border-emerald-900/5 p-5">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
            Step 1
          </p>
          <h3 class="text-base font-semibold text-slate-900 mb-2">Contact</h3>
          <p>
            Reach out via WhatsApp or email with your goals, timezone, and preferred days and times.
          </p>
        </div>
        <div class="rounded-2xl bg-white border border-emerald-900/5 p-5">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
            Step 2
          </p>
          <h3 class="text-base font-semibold text-slate-900 mb-2">Assessment</h3>
          <p>
            Complete a short assessment where appropriate (for Quran or Arabic) so the Sheikh can see your current level.
          </p>
        </div>
        <div class="rounded-2xl bg-white border border-emerald-900/5 p-5">
          <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
            Step 3
          </p>
          <h3 class="text-base font-semibold text-slate-900 mb-2">Schedule</h3>
          <p>
            Agree on a plan, lesson length, and frequency. Pricing depends on this plan—contact for pricing.
          </p>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
      <SectionHeader
        eyebrow="Questions"
        title="Frequently asked questions"
      />
      <FAQAccordion :items="faqItems" />
    </section>

    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
      <div class="relative overflow-hidden rounded-3xl bg-primary text-cream px-6 py-8 sm:px-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-semibold mb-2">
            Ready to discuss a plan?
          </h2>
          <p class="text-sm sm:text-base text-primary-foreground/90 text-cream/90 max-w-xl">
            Share a brief note about your background and availability. We’ll reply with suggested timings and next steps.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true">
            Contact on WhatsApp
          </CTAButton>
          <CTAButton :asLink="true" :href="`mailto:${contactEmail}`">
            Email Daris
          </CTAButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroSection from '../components/home/HeroSection.vue';
import TrustStrip from '../components/home/TrustStrip.vue';
import SectionHeader from '../components/common/SectionHeader.vue';
import ProgramCard from '../components/programs/ProgramCard.vue';
import FAQAccordion from '../components/common/FAQAccordion.vue';
import CTAButton from '../components/common/CTAButton.vue';
import { contactConfig } from '../config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const faqItems = [
  {
    question: 'Are the lessons fully online?',
    answer:
      'Yes. All lessons are conducted online using stable voice and video tools, so you can join from anywhere with a reliable connection.'
  },
  {
    question: 'What ages do you teach?',
    answer:
      'Teaching is available for mature children, teenagers, and adults. For younger children, the focus is on gentle introduction and consistency, agreed with parents in advance.'
  },
  {
    question: 'How does pricing work?',
    answer:
      'Pricing depends on lesson length, frequency, and whether you are studying individually or in a small group. There are no public price tables—please contact for pricing.'
  },
  {
    question: 'Which timezones do you support?',
    answer:
      'Students currently attend from multiple regions. We aim to find times that are sustainable for both sides and will share realistic options when you enquire.'
  },
  {
    question: 'Is there a trial lesson?',
    answer:
      'In many cases, the first lesson functions as both an assessment and a chance to see if the schedule and teaching style suit you.'
  },
  {
    question: 'Do you provide materials?',
    answer:
      'Yes. Recommended mushaf formats, beginner texts, and selected resources are shared, and you will be guided on what to prepare for each lesson.'
  },
  {
    question: 'What language is used in lessons?',
    answer:
      'Arabic is primary where beneficial, especially for texts and recitation. English support is available through the team to help ensure understanding and clarity.'
  }
];
</script>

