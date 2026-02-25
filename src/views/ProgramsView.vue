<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        eyebrow="Programs"
        title="Quran, Arabic, and Fiqh programs"
        description="Each program can be taken on its own or combined, depending on your goals and capacity."
      />
    </section>

    <!-- Main layout -->
    <section class="section-container pb-16 md:pb-20">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] items-start">
        <!-- Program sections -->
        <div class="space-y-10">
          <!-- Quran -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm sm:text-base text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                Quran program
              </h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Tajwid · Memorisation · Recitation improvement
              </p>
              <p class="mb-4">
                For students who wish to read the Book of Allah with steadiness,
                correctness, and increasing presence. Suitable for beginners
                learning the letters, as well as those refining tajwid and
                improving fluency.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Who it is for
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Beginners learning to read the Quran correctly from the script.</li>
                <li>Students who already read but need structured tajwid correction.</li>
                <li>Those starting or continuing a memorisation journey with revision.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                What you will cover
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Letter articulation and common mistakes in pronunciation.</li>
                <li>Rules of tajwid applied directly in recitation.</li>
                <li>Gradual memorisation with regular review (if desired).</li>
                <li>Etiquettes of recitation and connection to daily worship.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Lesson format
              </h3>
              <p class="mb-4">
                Lessons are primarily one-to-one, allowing for detailed listening
                and correction. Small groups may be arranged where suitable. Each
                lesson includes live recitation, feedback, and a clear plan for
                practice between sessions.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Outcomes
              </h3>
              <p>
                Students should expect careful improvement over time, greater
                confidence in recitation, and a manageable revision routine that
                fits around their responsibilities.
              </p>
            </div>
          </article>

          <!-- Arabic -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm sm:text-base text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                Arabic program
              </h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Reading · Grammar foundations · Support
              </p>
              <p class="mb-4">
                For students who wish to understand texts and lessons more
                directly, beginning with reading and moving towards structured
                grammar and applied examples.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Who it is for
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Students who can read the script but need fluency and confidence.</li>
                <li>Those beginning formal Arabic grammar for Islamic studies.</li>
                <li>Learners seeking support alongside other Arabic programmes.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                What you will cover
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Reading practice with graded passages and vocabulary.</li>
                <li>Core grammar topics, introduced gradually with examples.</li>
                <li>Application through short texts, exercises, and explanation.</li>
                <li>Optional conversational support where it serves the material.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Lesson format
              </h3>
              <p class="mb-4">
                Lessons combine reading aloud, explanation, and written or verbal
                exercises. Homework is agreed realistically, taking into account
                your other commitments.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Outcomes
              </h3>
              <p>
                Over time, students should gain the ability to follow basic
                texts, recognise patterns in sentences, and feel less dependent
                on translations.
              </p>
            </div>
          </article>

          <!-- Fiqh -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm sm:text-base text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                Fiqh program
              </h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Everyday worship · Applied understanding
              </p>
              <p class="mb-4">
                For those who want clear, practical understanding of worship and
                daily matters, with space for their real questions and
                circumstances.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Who it is for
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Students beginning structured study of Fiqh.</li>
                <li>Individuals and families wanting clarity in their worship.</li>
                <li>Those seeking consistent guidance rather than scattered answers.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                What you will cover
              </h3>
              <ul class="list-disc pl-5 mb-4 space-y-1">
                <li>Purification, prayer, fasting, and zakat foundations.</li>
                <li>Selected chapters relevant to family and daily life.</li>
                <li>Application to real scenarios, with attention to balance and ease.</li>
              </ul>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Lesson format
              </h3>
              <p class="mb-4">
                Lessons may follow a recognised text or structured notes,
                depending on your background. Questions are welcomed, and there
                is time to work through practical cases.
              </p>

              <h3 class="text-sm font-semibold text-slate-900 mb-1.5">
                Outcomes
              </h3>
              <p>
                Students should leave with increased clarity in worship and daily
                practice, and a realistic sense of where to continue building
                their understanding.
              </p>
            </div>
          </article>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6 lg:sticky lg:top-24">
          <!-- Contact for pricing card -->
          <div class="relative overflow-hidden rounded-2xl bg-primary text-cream p-6 sm:p-7">
            <div class="absolute top-0 right-0 w-40 h-40 bg-gold/[0.08] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>

            <div class="relative">
              <h3 class="text-lg font-semibold mb-2">Contact for pricing</h3>
              <p class="text-sm text-cream/85 mb-5 leading-relaxed">
                There are no public price tables. Pricing depends on lesson
                length, frequency, whether you study alone or in a small group,
                and your specific goals.
              </p>
              <ul class="text-sm text-cream/85 mb-6 space-y-2 list-disc pl-5">
                <li>Share your timezone and preferred days.</li>
                <li>Indicate which program(s) interest you.</li>
                <li>Mention whether you prefer one-to-one or small group.</li>
              </ul>
              <div class="flex flex-col gap-3">
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

          <!-- Lesson logistics -->
          <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-6 text-sm text-slate-600 leading-relaxed">
            <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Lesson logistics
            </h3>
            <ul class="space-y-2.5">
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Lessons are conducted online using widely available tools.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Timezones are discussed carefully to find sustainable slots.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>English support is available through our team when needed.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Students from any country are welcome.</span>
              </li>
            </ul>
          </div>

          <!-- Testimonial placeholder (hidden) -->
          <TestimonialCard
            :visible="false"
            text="Daris helped me build a consistent relationship with the Quran, with a pace that made sense for my work schedule."
            name="[Student name]"
            detail="[Location]"
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
