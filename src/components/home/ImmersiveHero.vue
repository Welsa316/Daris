<template>
  <section class="relative min-h-screen bg-primary-950 overflow-hidden">
    <!-- ═══════════════════════════════════════════════
         SPLIT LAYOUT: text left · photograph right
         The grid is asymmetric — text gets less space,
         photo gets more. On mobile it stacks: photo on
         top (cropped tall), text below.
         ═══════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-h-screen">

      <!-- ─── LEFT: text column ─── -->
      <div class="relative z-10 flex items-center order-2 md:order-1">
        <!-- Gold spine — vertical rule running the full height, inset from left edge -->
        <div
          class="absolute top-0 bottom-0 ltr:left-8 ltr:md:left-14 rtl:right-8 rtl:md:right-14 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent"
          aria-hidden="true"
        ></div>

        <div class="relative px-12 md:px-20 lg:px-28 py-20 md:py-0 max-w-xl ltr:ml-auto rtl:mr-auto">
          <!-- Eyebrow — spaced like a magazine dateline -->
          <p class="hero-entrance hero-entrance-1 text-gold/60 text-[10px] font-semibold tracking-[0.45em] uppercase mb-10">
            {{ $t('hero.eyebrow') }}
          </p>

          <!-- Headline — mixed weight for typographic contrast -->
          <h1 class="hero-entrance hero-entrance-2 mb-8">
            <span class="block font-display font-light text-cream/90 text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
              {{ $t('hero.titleHighlight') }}
            </span>
            <span class="block font-display font-semibold text-cream text-4xl sm:text-5xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mt-1">
              {{ $t('hero.titleRest') }}
            </span>
          </h1>

          <!-- Body — constrained, understated -->
          <p class="hero-entrance hero-entrance-3 text-base text-cream/40 leading-relaxed max-w-sm mb-12">
            {{ $t('hero.subtitle') }}
          </p>

          <!-- CTA cluster -->
          <div class="hero-entrance hero-entrance-4 flex flex-col sm:flex-row items-start gap-4 mb-10">
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
              class="inline-flex items-center gap-2 text-sm font-medium text-cream/50 hover:text-cream/80 transition-colors duration-200"
            >
              {{ $t('hero.ctaPrograms') }}
              <svg class="h-3 w-3 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </RouterLink>
          </div>

          <!-- Caption metadata — small caps, editorial -->
          <p class="hero-entrance hero-entrance-5 text-[10px] tracking-[0.3em] uppercase text-cream/20 max-w-xs">
            {{ $t('hero.pricingNote') }}
          </p>
        </div>
      </div>

      <!-- ─── RIGHT: photograph ─── -->
      <div class="relative order-1 md:order-2 min-h-[50vh] md:min-h-0">
        <!-- The image — full bleed, no padding, no rounding -->
        <img
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1400&q=80"
          alt="An open Quran resting on a traditional wooden book stand, warmly lit"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <!-- Lateral gradient — dissolves the photo's left edge into the dark text surface -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-primary-950 via-primary-950/60 to-transparent ltr:block rtl:hidden"
          aria-hidden="true"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-l from-primary-950 via-primary-950/60 to-transparent rtl:block ltr:hidden"
          aria-hidden="true"
        ></div>

        <!-- Vertical gradient — darkens top and bottom for cinematic framing -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-primary-950/50"
          aria-hidden="true"
        ></div>

        <!-- Grain over photo for analog feel -->
        <div class="absolute inset-0 grain-texture opacity-50" aria-hidden="true"></div>
      </div>
    </div>

    <!-- ─── GROUND LINE: full-width gold hairline at bottom ─── -->
    <div
      class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent z-10"
      aria-hidden="true"
    ></div>
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
