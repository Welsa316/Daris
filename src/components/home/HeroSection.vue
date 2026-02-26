<template>
  <section class="relative overflow-hidden bg-primary min-h-[85vh] flex items-center">
    <!-- Pattern overlay -->
    <div class="absolute inset-0 hero-pattern opacity-80" aria-hidden="true"></div>
    <!-- Gradient overlay for depth -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-primary-950/60" aria-hidden="true"></div>
    <!-- Decorative glow -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.05] blur-[100px]" aria-hidden="true"></div>

    <div class="section-container relative py-24 md:py-32 text-center">
      <!-- Eyebrow -->
      <p class="text-gold/90 text-xs font-semibold tracking-[0.3em] uppercase mb-6 animate-on-load animate-fade-in-up">
        {{ $t('hero.eyebrow') }} <span class="mx-2 text-gold/40">&bull;</span>
        <span dir="rtl" class="font-display text-sm text-cream/60">العِلْمُ مَنْهَجًا وَتَدَرُّجًا</span>
      </p>

      <!-- Main heading -->
      <h1 class="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.1] mb-6 max-w-4xl mx-auto text-balance animate-on-load animate-fade-in-up-delay">
        {{ $t('hero.titleHighlight') }}
      </h1>

      <!-- Subtitle -->
      <p class="text-base sm:text-lg text-cream/70 max-w-xl mx-auto leading-relaxed mb-10 animate-on-load animate-fade-in-up-delay-2">
        {{ $t('hero.subtitle') }}
      </p>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-on-load animate-fade-in-up-delay-3">
        <a
          :href="whatsAppHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {{ $t('hero.ctaWhatsApp') }}
        </a>
        <RouterLink
          to="/programs"
          class="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-3 text-sm font-medium text-cream/90 hover:bg-cream/10 hover:border-cream/30 transition-all duration-200"
        >
          {{ $t('hero.ctaPrograms') }}
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </RouterLink>
      </div>

      <!-- Scroll indicator -->
      <div class="mt-16 md:mt-24 flex flex-col items-center gap-2 text-cream/30" aria-hidden="true">
        <span class="text-[10px] tracking-[0.2em] uppercase">{{ $t('hero.scroll') }}</span>
        <svg class="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
