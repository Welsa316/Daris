<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        eyebrow="About"
        title="About Daris and the Sheikh"
        description="Daris exists to provide calm, structured teaching in Quran, Arabic, and Fiqh for students outside Egypt and around the world."
      />
    </section>

    <!-- Main content -->
    <section class="section-container pb-16">
      <div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
        <!-- Text -->
        <div class="space-y-5 text-sm sm:text-base text-slate-600 leading-relaxed">
          <p>
            The Sheikh behind Daris has taught Quran and Islamic studies to
            students across different regions, with a focus on patience, clarity,
            and gradual progress. Lessons avoid rushed coverage and instead build
            a reliable foundation that students can carry into their own worship
            and study.
          </p>
          <p>
            Teaching is offered in a one-to-one or small-group format. This
            allows time to listen carefully to each student's recitation,
            questions, and circumstances, and to adapt the pace and material
            accordingly. English-speaking support is available through the team
            to assist with communication and logistics where helpful.
          </p>
          <p>
            The aim is not to present large promises or exaggerated claims.
            Instead, Daris offers steady companionship in learning: reciting with
            care, revising consistently, and understanding how knowledge applies
            to daily life.
          </p>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-5">
          <figure class="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-primary/10 shadow-card bg-white group">
            <img
              src="/images/sheikh-placeholder.svg"
              alt="Placeholder for Sheikh's photograph"
              class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-xs text-cream px-4 py-4">
              Replace this placeholder with an appropriate photo.
            </figcaption>
          </figure>

          <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-5 text-sm text-slate-600">
            <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Credentials
            </h3>
            <ul class="space-y-2.5">
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Years of teaching: <em class="text-slate-400">[X years]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Quranic studies: <em class="text-slate-400">[Institution / teacher name]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Fiqh studies: <em class="text-slate-400">[Madhhab / program details]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Arabic studies: <em class="text-slate-400">[Relevant programmes or institutes]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Ijazah or certifications: <em class="text-slate-400">[List where appropriate]</em></span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <!-- Geometric divider -->
    <GeometricDivider spacing="py-2" />

    <!-- Philosophy + Languages -->
    <section class="section-container py-16 md:py-20">
      <div class="grid gap-8 md:grid-cols-2">
        <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
          <h3 class="text-base font-semibold text-slate-900 mb-4">
            Teaching philosophy
          </h3>
          <p class="mb-3">
            Lessons aim to connect sound knowledge with practice. For Quran,
            this means careful tajwid and repetition with meaningful reflection.
            For Arabic, it means building up reading and grammar slowly until
            students can approach texts with more independence. For Fiqh, it
            means grounding rulings in worship and real scenarios, not only in
            terminology.
          </p>
          <p>
            Students are encouraged to keep a realistic pace that fits their
            week, rather than attempting unsustainable schedules. Regular, modest
            effort is treated as more valuable than short bursts.
          </p>
        </div>

        <div class="rounded-2xl bg-primary/[0.03] border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
          <h3 class="text-base font-semibold text-slate-900 mb-4">
            Languages and support
          </h3>
          <p class="mb-3">
            Arabic is used as appropriate in lessons, especially for Quran and
            texts. Explanations and Fiqh discussions can include Arabic terms
            alongside clear explanation.
          </p>
          <p class="mb-3">
            English support is available through our team. This allows students
            who are more comfortable in English to receive help with scheduling,
            questions about expectations, and clarification when needed — without
            placing names or profiles of team members at the centre.
          </p>
          <p>
            Students are welcome from any country, with particular experience
            supporting learners outside Egypt. Timezones are discussed carefully
            during the initial enquiry.
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
              Interested in studying with Daris?
            </h2>
            <p class="text-sm sm:text-base text-cream/85 max-w-xl leading-relaxed">
              Send a brief message with your background, what you hope to study,
              and your timezone. You will receive a clear reply outlining
              possible timings and next steps.
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
              <span class="text-cream">Email Daris</span>
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
