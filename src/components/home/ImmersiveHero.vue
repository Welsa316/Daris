<template>
  <section class="relative min-h-screen bg-primary-950 overflow-hidden">
    <!-- Full-width background photograph -->
    <div class="absolute inset-0">
      <img
        src="/images/HeroBanner.jpeg"
        alt="Children studying in a mosque with light rays streaming through an archway"
        class="w-full h-full object-cover object-bottom"
      />
    </div>
    <!-- Gradient overlay — heavier on the left for text readability -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary-950/85 via-primary-950/50 to-primary-950/20 ltr:block rtl:hidden" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-l from-primary-950/85 via-primary-950/50 to-primary-950/20 rtl:block ltr:hidden" aria-hidden="true"></div>
    <!-- Cinematic framing — top/bottom -->
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/60 via-transparent to-primary-950/40" aria-hidden="true"></div>
    <!-- Grain -->
    <div class="absolute inset-0 grain-texture opacity-40" aria-hidden="true"></div>

    <!-- Ornamental lanterns — decorative, behind content -->
    <LanternsOverlay />

    <!-- Gold spine -->
    <div
      class="absolute top-0 bottom-0 ltr:left-8 ltr:md:left-14 rtl:right-8 rtl:md:right-14 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent z-10"
      aria-hidden="true"
    ></div>

    <!-- ─── Content overlaid on photograph ─── -->
    <div class="relative z-10 flex items-center min-h-screen">
      <div class="relative px-12 md:px-20 lg:px-28 py-20 max-w-xl ltr:ml-16 rtl:mr-16">
        <!-- Brand name -->
        <h1 class="hero-entrance hero-entrance-1 font-display text-gold text-5xl sm:text-6xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-4">
          {{ $t('hero.eyebrow') }}
        </h1>

        <!-- Arabic motto -->
        <p class="hero-entrance hero-entrance-1 font-display text-cream/30 text-lg sm:text-xl md:text-2xl leading-relaxed mb-6" dir="rtl" lang="ar">
          {{ $t('hero.motto') }}
        </p>

        <!-- Thin gold rule -->
        <div class="hero-entrance hero-entrance-2 w-10 h-px bg-gold/40 mb-8" aria-hidden="true"></div>

        <!-- Platform description -->
        <p class="hero-entrance hero-entrance-2 text-base sm:text-lg text-cream/55 leading-relaxed max-w-md mb-12">
          {{ $t('hero.description') }}
        </p>

        <!-- CTA cluster -->
        <div class="hero-entrance hero-entrance-3 flex flex-col sm:flex-row items-center gap-4 mb-10">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-primary-950 hover:bg-gold-300 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
          <RouterLink
            to="/programs"
            class="inline-flex items-center gap-2 text-sm font-medium text-cream/40 hover:text-cream/70 transition-colors duration-200"
          >
            {{ $t('hero.ctaPrograms') }}
            <svg class="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </RouterLink>
        </div>

        <!-- Caption -->
        <p class="hero-entrance hero-entrance-4 text-[10px] tracking-[0.3em] uppercase text-cream/15 max-w-xs">
          {{ $t('hero.pricingNote') }}
        </p>
      </div>
    </div>

    <!-- Ground line -->
    <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent z-10" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import LanternsOverlay from '@/components/hero/LanternsOverlay.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
