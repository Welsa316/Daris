<template>
  <section class="relative min-h-screen bg-primary-950 overflow-hidden">
    <!-- Ornamental lanterns — decorative, behind content -->
    <LanternsOverlay />

    <div class="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-h-screen">

      <!-- ─── LEFT: text column ─── -->
      <div class="relative z-10 flex items-center order-2 md:order-1">
        <!-- Islamic geometric pattern — left column background texture -->
        <div
          class="absolute inset-0 opacity-[0.04] hidden md:block"
          :style="patternStyle"
          aria-hidden="true"
        ></div>

        <!-- Gold spine -->
        <div
          class="absolute top-0 bottom-0 ltr:left-8 ltr:md:left-14 rtl:right-8 rtl:md:right-14 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent"
          aria-hidden="true"
        ></div>

        <div class="relative px-12 md:px-20 lg:px-28 py-20 md:py-0 max-w-xl ltr:ml-auto rtl:mr-auto">
          <!-- Brand name — the dominant element -->
          <h1 class="hero-entrance hero-entrance-1 font-display text-gold text-5xl sm:text-6xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-4">
            {{ $t('hero.eyebrow') }}
          </h1>

          <!-- Arabic motto — brand soul -->
          <p class="hero-entrance hero-entrance-1 font-display text-cream/25 text-lg sm:text-xl md:text-2xl leading-relaxed mb-6" dir="rtl" lang="ar">
            {{ $t('hero.motto') }}
          </p>

          <!-- Thin gold rule — separates brand from offering -->
          <div class="hero-entrance hero-entrance-2 w-10 h-px bg-gold/40 mb-8" aria-hidden="true"></div>

          <!-- Service headline — secondary, lighter weight -->
          <p class="hero-entrance hero-entrance-2 mb-6">
            <span class="block font-display font-light text-cream/80 text-2xl sm:text-3xl md:text-3xl lg:text-4xl leading-[1.15] tracking-tight">
              {{ $t('hero.titleHighlight') }}
            </span>
            <span class="block font-display font-light text-cream/50 text-2xl sm:text-3xl md:text-3xl lg:text-4xl leading-[1.15] tracking-tight mt-0.5">
              {{ $t('hero.titleRest') }}
            </span>
          </p>

          <!-- Body -->
          <p class="hero-entrance hero-entrance-3 text-sm text-cream/35 leading-relaxed max-w-sm mb-12">
            {{ $t('hero.subtitle') }}
          </p>

          <!-- CTA cluster -->
          <div class="hero-entrance hero-entrance-4 flex flex-col sm:flex-row items-center gap-4 mb-10">
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
          <p class="hero-entrance hero-entrance-5 text-[10px] tracking-[0.3em] uppercase text-cream/15 max-w-xs">
            {{ $t('hero.pricingNote') }}
          </p>
        </div>
      </div>

      <!-- ─── RIGHT: photograph ─── -->
      <div class="relative order-1 md:order-2 min-h-[50vh] md:min-h-0">
        <img
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1400&q=80"
          alt="An open Quran resting on a traditional wooden book stand, warmly lit"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Lateral gradient dissolving into text surface -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/60 to-transparent ltr:block rtl:hidden" aria-hidden="true"></div>
        <div class="absolute inset-0 bg-gradient-to-l from-primary-950 via-primary-950/60 to-transparent rtl:block ltr:hidden" aria-hidden="true"></div>
        <!-- Cinematic framing -->
        <div class="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-primary-950/50" aria-hidden="true"></div>
        <!-- Grain -->
        <div class="absolute inset-0 grain-texture opacity-50" aria-hidden="true"></div>
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

// Islamic geometric star pattern — same motif as credibility section.
// On dark bg at low opacity for subtle texture on the text column.
const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23C8A951' stroke-width='0.5'><polygon points='40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26'/><polygon points='40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5'/><polygon points='0,0 6.5,14 0,18 -6.5,14'/><polygon points='80,0 86.5,14 80,18 73.5,14'/><polygon points='0,80 6.5,66 0,62 -6.5,66'/><polygon points='80,80 86.5,66 80,62 73.5,66'/><line x1='0' y1='40' x2='8' y2='40'/><line x1='72' y1='40' x2='80' y2='40'/><line x1='40' y1='0' x2='40' y2='8'/><line x1='40' y1='72' x2='40' y2='80'/></g></svg>`;

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat'
};

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>
