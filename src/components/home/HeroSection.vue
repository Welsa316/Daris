<template>
  <section class="relative overflow-hidden bg-primary min-h-[90vh] flex items-center">
    <!-- Pattern overlay -->
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
    <!-- Gradient depth -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-transparent to-primary-950/70" aria-hidden="true"></div>
    <!-- Decorative glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/[0.04] blur-[120px]" aria-hidden="true"></div>

    <div class="section-container relative py-28 md:py-40 text-center">
      <!-- Eyebrow -->
      <p class="text-gold/80 text-xs font-semibold tracking-[0.35em] uppercase mb-8 animate-on-load animate-fade-in-up">
        {{ $t('hero.eyebrow') }}
      </p>

      <!-- Main heading — massive type -->
      <h1 class="heading-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-cream leading-[1.05] mb-8 max-w-5xl mx-auto text-balance animate-on-load animate-fade-in-up-delay">
        {{ $t('hero.titleHighlight') }}
      </h1>

      <!-- Subtitle — single line -->
      <p class="text-lg md:text-xl text-cream/60 max-w-lg mx-auto leading-relaxed mb-12 animate-on-load animate-fade-in-up-delay-2">
        {{ $t('hero.subtitle') }}
      </p>

      <!-- Single CTA -->
      <div class="animate-on-load animate-fade-in-up-delay-3">
        <a
          :href="whatsAppHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2.5 rounded-full bg-gold px-10 py-4 text-base font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {{ $t('hero.ctaWhatsApp') }}
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
