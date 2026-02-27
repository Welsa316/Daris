<template>
  <section class="relative overflow-hidden bg-primary-950">
    <!-- Subtle texture — no hero-pattern, distinct identity -->
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
    <!-- Very faint radial glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary-800/30 blur-[120px]" aria-hidden="true"></div>

    <div class="section-wide relative py-32 md:py-44 text-center">
      <h2 class="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.05] mb-8 max-w-3xl mx-auto text-balance">
        {{ $t('home.ctaTitle') }}
      </h2>
      <p class="text-base md:text-lg text-cream/40 max-w-md mx-auto mb-14">
        {{ $t('home.ctaText') }}
      </p>
      <a
        :href="whatsAppHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-3 rounded-full bg-gold px-10 py-4 text-base font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
      >
        {{ $t('home.ctaWhatsApp') }}
        <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      </a>
    </div>
  </section>
</template>

<script setup>
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
