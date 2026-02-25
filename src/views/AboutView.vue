<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        eyebrow="About"
        title="About Daris"
        description="Calm, structured teaching for students worldwide."
      />
    </section>

    <!-- Main content -->
    <section class="section-container pb-16">
      <div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
        <div class="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
          <p>
            The Sheikh behind Daris has taught Quran and Islamic studies across
            different regions, with a focus on patience, clarity, and gradual
            progress. Lessons build a reliable foundation students carry into
            worship and study.
          </p>
          <p>
            Teaching is one-to-one or small-group, allowing time to listen
            carefully and adapt pace and material. English support is available
            through the team for communication and logistics.
          </p>
          <p>
            No exaggerated claims — just steady companionship in learning:
            reciting with care, revising consistently, and applying knowledge
            to daily life.
          </p>
        </div>

        <aside class="space-y-5">
          <figure class="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-primary/10 shadow-card bg-white group">
            <img
              src="/images/sheikh-placeholder.svg"
              alt="Placeholder for Sheikh's photograph"
              class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent text-xs text-cream px-4 py-4">
              Replace with an appropriate photo.
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
                <span>Quranic studies: <em class="text-slate-400">[Institution]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Fiqh studies: <em class="text-slate-400">[Madhhab / details]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Arabic studies: <em class="text-slate-400">[Programmes]</em></span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Certifications: <em class="text-slate-400">[List]</em></span>
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
            Teaching philosophy
          </h3>
          <p class="mb-3">
            Sound knowledge connected with practice. Careful tajwid and
            repetition for Quran, gradual grammar for Arabic, grounded rulings
            for Fiqh.
          </p>
          <p>
            A realistic pace that fits your week. Regular, modest effort over
            short bursts.
          </p>
        </div>

        <div class="rounded-2xl bg-primary/[0.03] border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
          <h3 class="text-base font-semibold text-slate-900 mb-3">
            Languages and support
          </h3>
          <p class="mb-3">
            Arabic is used where beneficial, especially for texts and recitation.
            English support is available through our team for scheduling,
            questions, and clarification.
          </p>
          <p>
            Students welcome from any country. Timezones discussed carefully
            during initial enquiry.
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
            <p class="text-sm sm:text-base text-cream/85 max-w-md">
              Send your background, goals, and timezone. We'll reply with next steps.
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
