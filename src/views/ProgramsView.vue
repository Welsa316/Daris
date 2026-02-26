<template>
  <div>
    <!-- Header -->
    <section class="section-container pt-16 md:pt-20 pb-12">
      <SectionHeader
        eyebrow="Programs"
        title="Quran, Arabic & Fiqh"
        description="Take one program or combine them based on your goals."
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
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">Quran</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Tajwid · Memorisation · Recitation
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>Letter articulation and tajwid rules</li>
                <li>Fluent, paced recitation</li>
                <li>Memorisation with structured revision</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                Beginners through to advanced. One-to-one with live feedback.
              </p>
            </div>
          </article>

          <!-- Arabic -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">Arabic</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Reading · Grammar · Support
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>Reading fluency and vocabulary</li>
                <li>Core grammar with examples</li>
                <li>Guided reading practice</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                Build confidence with classical texts at your pace.
              </p>
            </div>
          </article>

          <!-- Fiqh -->
          <article class="rounded-2xl bg-white border border-primary/5 shadow-card overflow-hidden">
            <div class="h-1 bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>
            <div class="p-6 sm:p-7 text-sm text-slate-600 leading-relaxed">
              <h2 class="text-lg sm:text-xl font-semibold text-slate-900 mb-1">Fiqh</h2>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-gold mb-4">
                Everyday worship · Applied understanding
              </p>
              <ul class="list-disc pl-5 space-y-1 text-sm mb-3">
                <li>Prayer, fasting, zakat foundations</li>
                <li>Real-life application</li>
                <li>Practical Q&amp;A</li>
              </ul>
              <p class="text-xs text-slate-500 pt-3 border-t border-primary/5">
                Structured lessons with recognised texts. Questions welcomed.
              </p>
            </div>
          </article>
        </div>

        <!-- Sidebar -->
        <aside class="space-y-6 lg:sticky lg:top-24">
          <div class="relative overflow-hidden rounded-2xl bg-primary text-cream p-6 sm:p-7">
            <div class="absolute top-0 right-0 w-40 h-40 bg-gold/[0.08] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" aria-hidden="true"></div>
            <div class="relative">
              <h3 class="text-lg font-semibold mb-2">Contact for pricing</h3>
              <p class="text-sm text-cream/85 mb-6 leading-relaxed">
                Share your timezone, preferred program, and format.
              </p>
              <div class="flex flex-col gap-3">
                <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="cream">
                  Contact on WhatsApp
                </CTAButton>
                <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
                  <span class="text-cream">Email Daris</span>
                </CTAButton>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white border border-primary/10 shadow-card p-6 text-sm text-slate-600">
            <h3 class="text-xs font-semibold tracking-[0.16em] uppercase text-gold mb-3">
              Logistics
            </h3>
            <ul class="space-y-2">
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Online via widely available tools</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>Flexible timezone scheduling</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>English support through our team</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0" aria-hidden="true"></span>
                <span>All countries welcome</span>
              </li>
            </ul>
          </div>

          <TestimonialCard
            :visible="false"
            text="Daris helped me build a consistent relationship with the Quran."
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
