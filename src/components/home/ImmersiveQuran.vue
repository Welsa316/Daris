<template>
  <!-- QURAN — Reverent & Warm
       Centered composition. Golden vignette. Frosted text backdrop.
       This is the emotional anchor of the page. -->
  <section class="relative overflow-hidden min-h-[75vh] md:min-h-[85vh] flex items-center">
    <!-- Photograph — close-up illuminated Quran pages, warm golden light -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=1920&q=80"
        alt="Close-up of illuminated Quran pages in warm golden light"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <!-- Warm golden vignette — radiates from center, darkens at edges -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(12,32,25,0.7)_100%)]" aria-hidden="true"></div>
    <!-- Vertical cinematic bars -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/55" aria-hidden="true"></div>
    <!-- Grain -->
    <div class="absolute inset-0 grain-texture opacity-40" aria-hidden="true"></div>

    <div class="section-wide relative py-28 md:py-40 text-center">
      <!-- Frosted backdrop panel for text legibility + depth layering -->
      <div class="max-w-2xl mx-auto rounded-2xl bg-black/20 backdrop-blur-sm border border-white/[0.04] px-8 md:px-14 py-14 md:py-20">
        <!-- Thin gold rule -->
        <div class="w-10 h-px bg-gold/50 mx-auto mb-8" data-reveal aria-hidden="true"></div>

        <p class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/70 mb-6" data-reveal>
          {{ $t('home.splitQuranEyebrow') }}
        </p>

        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-6 text-balance"
          data-reveal="cinematic"
        >
          {{ $t('home.splitQuranTitle') }}
        </h2>

        <p
          class="text-base text-cream/45 max-w-md mx-auto leading-relaxed mb-10"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('home.splitQuranBody') }}
        </p>

        <div data-reveal data-reveal-delay="300">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 rounded-full bg-gold px-9 py-3.5 text-sm font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
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
