<template>
  <section class="relative overflow-hidden bg-cream">
    <!-- Background decorations -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        class="absolute inset-y-0 right-0 w-1/2 bg-subtle-pattern opacity-60 hidden lg:block"
        style="background-size: 18px 18px"
      ></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gold/[0.04] blur-3xl"></div>
    </div>

    <div class="section-container py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center relative">
      <!-- Text column -->
      <div class="space-y-8">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-gold animate-on-load animate-fade-in-up">
          DARIS <span class="text-gold">&bull;</span> <span dir="rtl" class="text-primary">العِلْمُ مَنْهَجًا وَتَدَرُّجًا</span>
        </p>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] text-balance animate-on-load animate-fade-in-up-delay">
          <span class="text-primary">Quran, Arabic &amp; Fiqh</span>
          guidance for serious learners.
        </h1>

        <p class="text-base sm:text-lg text-slate-600 max-w-md leading-relaxed animate-on-load animate-fade-in-up-delay-2">
          One-to-one online lessons with a qualified Sheikh. Personalised, patient, and available worldwide.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true">
            Contact on WhatsApp
          </CTAButton>
          <CTAButton :to="'/programs'" variant="outline">
            View programs
          </CTAButton>
        </div>
      </div>

      <!-- Card column -->
      <div class="relative md:pl-6">
        <div class="absolute -inset-4 rounded-3xl bg-primary/[0.03] blur-2xl" aria-hidden="true"></div>
        <div class="relative rounded-2xl bg-white shadow-card border border-primary/5 p-6 space-y-5">
          <div class="flex items-center gap-3">
            <div class="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <img
                src="/images/daris-logo.png"
                alt=""
                class="h-8 w-8 object-contain"
                width="32"
                height="32"
              />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">How to begin</p>
              <p class="text-xs text-slate-500">Three simple steps.</p>
            </div>
          </div>

          <ol class="space-y-4 text-sm text-slate-600">
            <li v-for="(step, i) in steps" :key="i" class="flex gap-3 items-start">
              <span class="h-7 w-7 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ i + 1 }}
              </span>
              <div>
                <p class="font-semibold text-slate-900">{{ step.title }}</p>
                <p class="text-slate-500 text-xs">{{ step.sub }}</p>
              </div>
            </li>
          </ol>

          <div class="pt-4 border-t border-primary/5">
            <p class="text-xs text-slate-500">
              Pricing depends on your goals and schedule.
              <span class="font-semibold text-primary">Contact for pricing.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const steps = [
  { title: 'Contact us', sub: 'Share your goals and availability.' },
  { title: 'Brief assessment', sub: 'A short recitation or language check.' },
  { title: 'Start lessons', sub: 'Agree a plan that fits your week.' }
];
</script>
