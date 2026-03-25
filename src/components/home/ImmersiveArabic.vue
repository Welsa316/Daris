<template>
  <!-- ARABIC — Scholarly & Refined
       Warm parchment gradient background with decorative Quran verse.
       Tha'alibi quote as the main focal text. -->
  <section class="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
    <!-- Warm parchment gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-950 via-primary-950 to-[#1a2e24]" aria-hidden="true"></div>

    <!-- Decorative Quran verse — بِلِسَانٍ عَرَبِيٍّ مُبِينٍ -->
    <div class="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none" aria-hidden="true">
      <p
        class="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-display text-gold/[0.06] leading-none whitespace-nowrap select-none"
        dir="rtl"
        lang="ar"
      >بِلِسَانٍ عَرَبِيٍّ مُبِينٍ</p>
    </div>

    <!-- Soft warm glow — shifted to the right for depth -->
    <div class="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-gold/[0.04] blur-[120px]" aria-hidden="true"></div>

    <!-- Grain — lighter for tonal variety -->
    <div class="absolute inset-0 grain-texture opacity-30" aria-hidden="true"></div>

    <!-- Left-aligned text with strong breathing space on right -->
    <div class="section-wide relative py-24 md:py-36">
      <div class="max-w-lg ltr:mr-auto rtl:ml-auto">
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/60 mb-5"
          data-reveal
        >
          {{ $t('home.splitArabicEyebrow') }}
        </p>

        <!-- Tha'alibi quote — the main focal element -->
        <blockquote
          class="font-display text-2xl sm:text-3xl md:text-4xl text-cream/70 leading-[1.3] mb-8"
          dir="rtl"
          lang="ar"
          data-reveal="cinematic"
        >
          {{ $t('home.splitArabicQuote') }}
        </blockquote>

        <!-- Thin rule -->
        <div class="w-8 h-px bg-gold/30 mb-6" data-reveal aria-hidden="true"></div>

        <!-- Title -->
        <h2
          class="font-display text-xl sm:text-2xl md:text-3xl text-cream leading-[1.12] mb-5"
          data-reveal
          data-reveal-delay="100"
        >
          {{ $t('home.splitArabicTitle') }}
        </h2>

        <!-- Body description — below the quote, smaller -->
        <p
          class="text-base text-cream/35 leading-relaxed max-w-sm mb-10"
          data-reveal
          data-reveal-delay="200"
        >
          {{ $t('home.splitArabicBody') }}
        </p>

        <div data-reveal data-reveal-delay="350">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2.5 text-sm font-medium text-gold hover:text-gold-300 transition-colors duration-200"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
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
