<template>
  <section class="relative overflow-hidden min-h-screen flex items-center bg-primary-950">
    <!-- Layered gradients for depth -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-900 to-primary" aria-hidden="true"></div>
    <!-- Radial gold glow — off-center for asymmetry -->
    <div class="absolute top-1/4 ltr:right-1/4 rtl:left-1/4 w-[900px] h-[900px] rounded-full bg-gold/[0.03] blur-[150px]" aria-hidden="true"></div>
    <!-- Secondary glow — bottom left -->
    <div class="absolute bottom-0 ltr:left-0 rtl:right-0 w-[600px] h-[600px] rounded-full bg-primary-300/[0.04] blur-[120px]" aria-hidden="true"></div>
    <!-- Subtle pattern at low opacity -->
    <div class="absolute inset-0 hero-pattern opacity-30" aria-hidden="true"></div>
    <!-- Bottom gradient fade -->
    <div class="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-primary-950/80 to-transparent" aria-hidden="true"></div>

    <div class="section-wide relative py-36 md:py-48">
      <!-- Text — left-aligned for compositional tension -->
      <div class="max-w-3xl">
        <p class="text-gold/70 text-[11px] font-semibold tracking-[0.35em] uppercase mb-6 animate-on-load animate-fade-in-up">
          {{ $t('hero.eyebrow') }}
        </p>

        <h1 class="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] text-cream leading-[1.0] mb-8 animate-on-load animate-fade-in-up-delay">
          {{ $t('hero.titleHighlight') }}
        </h1>

        <p class="text-lg md:text-xl text-cream/50 max-w-lg leading-relaxed mb-14 animate-on-load animate-fade-in-up-delay-2">
          {{ $t('hero.subtitle') }}
        </p>

        <div class="animate-on-load animate-fade-in-up-delay-3">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 rounded-full bg-gold px-10 py-4 text-base font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
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
