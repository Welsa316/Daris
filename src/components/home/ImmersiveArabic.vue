<template>
  <!-- ARABIC — Scholarly & Refined
       Asymmetric left-aligned text. Cooler neutral tones. Image focal
       point offset to the right. Smaller headline than Quran section.
       Intellectual restraint. -->
  <section class="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
    <!-- Photograph — classical Arabic calligraphy or manuscript, neutral warm tones -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1579187707643-35646d22b596?auto=format&fit=crop&w=1920&q=80"
        alt="Classical Arabic calligraphy manuscript with elegant script in warm neutral tones"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <!-- Lateral gradient — heavier on the left to cradle text, lighter on right to show image -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/15 ltr:block rtl:hidden" aria-hidden="true"></div>
    <div class="absolute inset-0 bg-gradient-to-l from-black/75 via-black/40 to-black/15 rtl:block ltr:hidden" aria-hidden="true"></div>
    <!-- Soft bottom gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" aria-hidden="true"></div>
    <!-- Grain — lighter than Quran for tonal variety -->
    <div class="absolute inset-0 grain-texture opacity-30" aria-hidden="true"></div>

    <!-- Left-aligned text with strong breathing space on right -->
    <div class="section-wide relative py-24 md:py-36">
      <div class="max-w-lg ltr:mr-auto rtl:ml-auto">
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-cream/50 mb-5"
          data-reveal
        >
          {{ $t('home.splitArabicEyebrow') }}
        </p>

        <!-- Smaller headline than Quran — scholarly restraint -->
        <h2
          class="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.12] mb-6"
          data-reveal="cinematic"
        >
          {{ $t('home.splitArabicTitle') }}
        </h2>

        <!-- Thin rule — asymmetric, aligned left, not centered -->
        <div class="w-8 h-px bg-cream/20 mb-6" data-reveal aria-hidden="true"></div>

        <p
          class="text-base text-cream/40 leading-relaxed max-w-sm mb-10"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('home.splitArabicBody') }}
        </p>

        <div data-reveal data-reveal-delay="300">
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
