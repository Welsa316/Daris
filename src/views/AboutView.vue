<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
    <SectionHeader
      eyebrow="About"
      title="About Daris and the Sheikh"
      description="Daris exists to provide calm, structured teaching in Quran, Arabic, and Fiqh for students outside Egypt and around the world."
    />

    <div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start mb-12">
      <div class="space-y-4 text-sm sm:text-base text-slate-700">
        <p>
          The Sheikh behind Daris has taught Quran and Islamic studies to students across different regions,
          with a focus on patience, clarity, and gradual progress. Lessons avoid rushed coverage and instead
          build a reliable foundation that students can carry into their own worship and study.
        </p>
        <p>
          Teaching is offered in a one-to-one or small-group format. This allows time to listen carefully to
          each student’s recitation, questions, and circumstances, and to adapt the pace and material
          accordingly. English-speaking support is available through the team to assist with communication
          and logistics where helpful.
        </p>
        <p>
          The aim is not to present large promises or exaggerated claims. Instead, Daris offers steady
          companionship in learning: reciting with care, revising consistently, and understanding how
          knowledge applies to daily life.
        </p>
      </div>

      <aside class="space-y-4">
        <figure class="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden border border-emerald-900/10 shadow-soft-lg bg-white">
          <img
            src="/src/assets/sheikh-placeholder.svg"
            alt="Placeholder for Sheikh’s photograph"
            class="h-64 w-full object-cover"
          />
          <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 to-transparent text-xs text-cream px-4 py-3">
            Replace this placeholder with an appropriate photo of the Sheikh.
          </figcaption>
        </figure>

        <div class="rounded-2xl bg-white border border-emerald-900/10 p-5 text-sm text-slate-700">
          <h3 class="text-sm font-semibold text-slate-900 mb-3">Credentials (placeholders)</h3>
          <ul class="space-y-1.5">
            <li>Years of teaching: [X years]</li>
            <li>Quranic studies: [Institution / teacher name]</li>
            <li>Fiqh studies: [Madhhab / program details]</li>
            <li>Arabic studies: [Relevant programmes or institutes]</li>
            <li>Ijazah or certifications: [List where appropriate]</li>
          </ul>
        </div>
      </aside>
    </div>

    <section class="grid gap-8 md:grid-cols-2 mb-12">
      <div class="rounded-2xl bg-white border border-emerald-900/10 p-5 text-sm text-slate-700">
        <h3 class="text-base font-semibold text-slate-900 mb-3">Teaching philosophy</h3>
        <p class="mb-3">
          Lessons aim to connect sound knowledge with practice. For Quran, this means careful tajwid and
          repetition with meaningful reflection. For Arabic, it means building up reading and grammar slowly
          until students can approach texts with more independence. For Fiqh, it means grounding rulings in
          worship and real scenarios, not only in terminology.
        </p>
        <p>
          Students are encouraged to keep a realistic pace that fits their week, rather than attempting
          unsustainable schedules. Regular, modest effort is treated as more valuable than short bursts.
        </p>
      </div>

      <div class="rounded-2xl bg-primary/5 border border-emerald-900/10 p-5 text-sm text-slate-700">
        <h3 class="text-base font-semibold text-slate-900 mb-3">Languages and support</h3>
        <p class="mb-2">
          Arabic is used as appropriate in lessons, especially for Quran and texts. Explanations and Fiqh
          discussions can include Arabic terms alongside clear explanation.
        </p>
        <p class="mb-2">
          English support is available through our team. This allows students who are more comfortable in
          English to receive help with scheduling, questions about expectations, and clarification when
          needed—without placing names or profiles of team members at the centre.
        </p>
        <p>
          Students are welcome from any country, with particular experience supporting learners outside
          Egypt. Timezones are discussed carefully during the initial enquiry.
        </p>
      </div>
    </section>

    <section class="rounded-3xl bg-primary text-cream px-6 py-7 sm:px-8 sm:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold mb-1">Interested in studying with Daris?</h2>
        <p class="text-sm sm:text-base text-cream/90 max-w-xl">
          Send a brief message with your background, what you hope to study, and your timezone. You will
          receive a clear reply outlining possible timings and next steps.
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
    </section>
  </div>
</template>

<script setup>
import SectionHeader from '../components/common/SectionHeader.vue';
import CTAButton from '../components/common/CTAButton.vue';
import { contactConfig } from '../config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>

