<template>
  <section class="relative overflow-hidden bg-cream">
    <!-- Background decorations -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div
        class="absolute inset-y-0 right-0 w-1/2 bg-subtle-pattern opacity-60 hidden lg:block"
        style="background-size: 18px 18px"
      ></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-gold/[0.04] blur-3xl"></div>
    </div>

    <div class="section-container relative py-16 md:py-24 flex flex-col items-center text-center">
      <!-- Giant logo -->
      <div class="mb-8 md:mb-10 animate-on-load animate-fade-in">
        <img
          src="/images/daris-logo.png"
          alt="Daris – دارس"
          class="h-48 sm:h-56 md:h-72 lg:h-80 w-auto mx-auto drop-shadow-lg"
          width="320"
          height="320"
        />
      </div>

      <!-- Minimal text -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] text-balance max-w-3xl animate-on-load animate-fade-in-up-delay">
        <span class="text-primary">Quran, Arabic &amp; Fiqh</span><br class="hidden sm:block" />
        for serious learners.
      </h1>

      <p class="mt-5 text-base sm:text-lg text-slate-500 max-w-lg animate-on-load animate-fade-in-up-delay-2">
        One-to-one online lessons. Personalised, patient, worldwide.
      </p>

      <!-- CTAs -->
      <div class="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
        <CTAButton :asLink="true" :href="whatsAppHref" :external="true">
          Contact on WhatsApp
        </CTAButton>
        <CTAButton :to="'/programs'" variant="outline">
          View programs
        </CTAButton>
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
</script>
