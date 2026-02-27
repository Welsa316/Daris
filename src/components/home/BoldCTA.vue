<template>
  <section class="relative overflow-hidden bg-primary-950 z-10">
    <!-- Subtle radial glow — faint gold, off-center -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gold/[0.03] blur-[160px]" aria-hidden="true"></div>

    <div class="section-wide relative pt-52 md:pt-64 pb-40 md:pb-52 text-center">
      <!-- Thin gold rule — compositional anchor -->
      <div class="w-12 h-px bg-gold/40 mx-auto mb-12" data-reveal aria-hidden="true"></div>

      <h2
        class="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.05] mb-8 max-w-4xl mx-auto text-balance"
        data-reveal="cinematic"
      >
        {{ $t('home.ctaTitle') }}
      </h2>

      <p
        class="text-base text-cream/35 max-w-sm mx-auto mb-16"
        data-reveal
        data-reveal-delay="150"
      >
        {{ $t('home.ctaText') }}
      </p>

      <div data-reveal data-reveal-delay="300">
        <a
          :href="whatsAppHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 rounded-full bg-gold px-12 py-4.5 text-lg font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
        >
          {{ $t('home.ctaWhatsApp') }}
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </a>
      </div>
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
