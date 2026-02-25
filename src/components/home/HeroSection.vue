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

    <div class="section-container py-16 md:py-24 grid gap-12 md:grid-cols-2 items-center relative">
      <!-- Text column -->
      <div class="space-y-6">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-gold animate-on-load animate-fade-in-up">
          Daris &bull; دارس
        </p>

        <h1 class="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-slate-900 leading-[1.15] text-balance animate-on-load animate-fade-in-up-delay">
          Calm, structured guidance in
          <span class="text-primary">Quran, Arabic &amp; Fiqh</span>
          for serious learners.
        </h1>

        <p class="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed animate-on-load animate-fade-in-up-delay-2">
          Daris is a focused, one-to-one and small-group teaching service led by
          a qualified Sheikh, helping students build sound recitation, clear
          Arabic foundations, and practical understanding of worship and daily
          practice.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true">
            Contact on WhatsApp
          </CTAButton>
          <CTAButton :to="'/programs'" variant="outline">
            View programs
          </CTAButton>
        </div>

        <!-- Inline trust items -->
        <dl class="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-xs sm:text-sm text-slate-600">
          <div class="flex gap-2.5">
            <span class="mt-0.5 text-primary flex-shrink-0" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </span>
            <div>
              <dt class="font-semibold text-slate-900">Online worldwide</dt>
              <dd>Scheduled around your timezone.</dd>
            </div>
          </div>
          <div class="flex gap-2.5">
            <span class="mt-0.5 text-primary flex-shrink-0" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
            </span>
            <div>
              <dt class="font-semibold text-slate-900">English support</dt>
              <dd>Available through our team.</dd>
            </div>
          </div>
        </dl>
      </div>

      <!-- Card column -->
      <div class="relative md:pl-6">
        <div class="absolute -inset-4 rounded-3xl bg-primary/[0.03] blur-2xl" aria-hidden="true"></div>
        <div class="relative rounded-2xl bg-white shadow-card border border-primary/5 p-6 space-y-6">
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
              <p class="text-sm font-semibold text-slate-900">Start with a brief assessment</p>
              <p class="text-xs text-slate-500">Share your goals, level, and schedule.</p>
            </div>
          </div>

          <ol class="space-y-4 text-sm text-slate-600">
            <li v-for="(step, i) in steps" :key="i" class="flex gap-3 items-start">
              <span class="h-7 w-7 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ i + 1 }}
              </span>
              <span class="leading-relaxed pt-0.5">{{ step }}</span>
            </li>
          </ol>

          <div class="pt-4 border-t border-primary/5">
            <p class="text-xs text-slate-500 leading-relaxed">
              Pricing depends on your goals, lesson length, and frequency.
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
  'Contact via WhatsApp or email with your goals and availability.',
  'Complete a short recitation or language assessment where relevant.',
  'Agree a lesson plan and schedule that fits your week.'
];
</script>
