<template>
  <section class="relative overflow-hidden bg-cream">
    <div class="absolute inset-y-0 right-0 w-1/2 pointer-events-none hidden lg:block">
      <div
        class="h-full w-full bg-subtle-pattern opacity-70"
        style="background-size: 18px 18px"
        aria-hidden="true"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid gap-10 md:grid-cols-2 items-center">
      <div class="space-y-6">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase text-gold">
          Daris • دارس
        </p>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
          Calm, structured guidance in
          <span class="text-primary">Quran, Arabic, and Fiqh</span>
          for serious learners.
        </h1>
        <p class="text-sm sm:text-base text-slate-700 max-w-xl">
          Daris is a focused, one-to-one and small-group teaching service led by a qualified Sheikh,
          helping students outside Egypt build sound recitation, clear Arabic foundations, and
          practical understanding of worship and daily practice.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true">
            Contact on WhatsApp
          </CTAButton>
          <RouterLink
            to="/programs"
            class="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
          >
            View programs
          </RouterLink>
        </div>

        <dl class="mt-6 grid grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
          <div>
            <dt class="font-semibold text-slate-900">Online lessons worldwide</dt>
            <dd>One-to-one or small groups, scheduled around your timezone.</dd>
          </div>
          <div>
            <dt class="font-semibold text-slate-900">English support</dt>
            <dd>English-speaking assistance is available through our team.</dd>
          </div>
        </dl>
      </div>

      <div class="relative md:pl-8">
        <div class="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" aria-hidden="true"></div>
        <div class="relative rounded-3xl bg-white shadow-soft-lg border border-emerald-900/5 p-6 space-y-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <img
                src="/src/assets/daris-logo.png"
                alt="Daris logo"
                class="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">Start with a brief assessment</p>
              <p class="text-xs text-slate-600">
                Share your goals, level, and schedule. We’ll recommend a suitable path.
              </p>
            </div>
          </div>

          <ol class="space-y-4 text-xs text-slate-700">
            <li class="flex gap-3">
              <span class="h-6 w-6 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
              <span>Contact via WhatsApp or email with your goals and availability.</span>
            </li>
            <li class="flex gap-3">
              <span class="h-6 w-6 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
              <span>Complete a short recitation or language assessment where relevant.</span>
            </li>
            <li class="flex gap-3">
              <span class="h-6 w-6 rounded-full bg-primary text-cream flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
              <span>Agree a lesson plan and schedule that fits your week.</span>
            </li>
          </ol>

          <p class="text-[11px] text-slate-500">
            Pricing depends on your goals, lesson length, and frequency.
            <span class="font-medium text-slate-700">Contact for pricing.</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import CTAButton from '../common/CTAButton.vue';
import { contactConfig } from '../../config/contactConfig';

const { whatsappNumber, whatsappMessage } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>

