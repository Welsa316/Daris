<template>
  <!-- ARABIC — Asymmetric, open, no image.
       Tha'alibi quote dominates. Quran verse as large decorative accent.
       Gold geometric ornaments break the grid. -->
  <section class="relative overflow-hidden bg-primary-950 py-28 md:py-40 lg:py-48">

    <!-- Subtle geometric pattern — very low opacity, full bleed -->
    <div
      class="absolute inset-0 opacity-[0.03]"
      :style="patternStyle"
      aria-hidden="true"
    ></div>

    <!-- Warm radial glow — asymmetric, shifted right and high -->
    <div
      class="absolute -top-20 ltr:right-[-10%] rtl:left-[-10%] w-[800px] h-[600px] rounded-full bg-gold/[0.04] blur-[160px]"
      aria-hidden="true"
    ></div>

    <!-- Secondary glow — lower left for depth -->
    <div
      class="absolute bottom-[-10%] ltr:left-[-5%] rtl:right-[-5%] w-[500px] h-[400px] rounded-full bg-primary-800/30 blur-[120px]"
      aria-hidden="true"
    ></div>

    <!-- Grain -->
    <div class="absolute inset-0 grain-texture opacity-25" aria-hidden="true"></div>

    <!-- Decorative gold hairlines — breaking the grid -->
    <div class="absolute top-16 ltr:left-[12%] rtl:right-[12%] w-px h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>
    <div class="absolute bottom-24 ltr:right-[8%] rtl:left-[8%] w-px h-48 bg-gradient-to-b from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>
    <div class="absolute top-1/3 ltr:right-[18%] rtl:left-[18%] w-24 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

    <!-- Quran verse — large decorative accent, positioned asymmetrically -->
    <div
      class="absolute ltr:right-[5%] rtl:left-[5%] top-1/2 -translate-y-1/2 pointer-events-none select-none hidden md:block"
      aria-hidden="true"
      data-reveal
      data-reveal-delay="400"
    >
      <p
        class="font-display text-[7rem] lg:text-[9rem] xl:text-[11rem] text-gold/[0.07] leading-none whitespace-nowrap"
        dir="rtl"
        lang="ar"
        style="writing-mode: vertical-rl;"
      >بِلِسَانٍ عَرَبِيٍّ مُبِينٍ</p>
    </div>

    <!-- Small decorative diamond -->
    <div class="absolute top-20 ltr:right-[30%] rtl:left-[30%] w-2 h-2 rotate-45 bg-gold/15 hidden md:block" aria-hidden="true"></div>
    <div class="absolute bottom-32 ltr:left-[25%] rtl:right-[25%] w-1.5 h-1.5 rotate-45 bg-gold/10 hidden md:block" aria-hidden="true"></div>

    <!-- ─── Content — intentionally left-heavy, right side breathes ─── -->
    <div class="relative z-10 section-wide">
      <div class="max-w-2xl ltr:mr-auto rtl:ml-auto">

        <!-- Eyebrow -->
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/50 mb-8"
          data-reveal
        >
          {{ $t('home.splitArabicEyebrow') }}
        </p>

        <!-- Tha'alibi quote — dominant text -->
        <blockquote
          class="relative mb-10"
          data-reveal="cinematic"
        >
          <!-- Decorative oversized opening quote mark -->
          <span
            class="absolute -top-8 ltr:-left-4 rtl:-right-4 text-7xl md:text-8xl text-gold/15 font-serif leading-none select-none pointer-events-none"
            aria-hidden="true"
          >&ldquo;</span>
          <p class="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-cream/80 leading-[1.35] ps-2">
            {{ $t('home.splitArabicQuote') }}
          </p>
        </blockquote>

        <!-- Asymmetric gold rule — offset from left edge -->
        <div class="ltr:ml-2 rtl:mr-2 w-16 h-px bg-gradient-to-r from-gold/40 to-transparent mb-10" data-reveal aria-hidden="true"></div>

        <!-- Quran verse — visible on mobile (hidden on desktop where it's decorative) -->
        <p
          class="md:hidden font-display text-xl text-gold/30 mb-8"
          dir="rtl"
          lang="ar"
          data-reveal
          data-reveal-delay="150"
        >بِلِسَانٍ عَرَبِيٍّ مُبِينٍ</p>

        <!-- Title -->
        <h2
          class="font-display text-xl sm:text-2xl md:text-3xl text-cream leading-[1.15] mb-5 max-w-md"
          data-reveal
          data-reveal-delay="100"
        >
          {{ $t('home.splitArabicTitle') }}
        </h2>

        <!-- Body -->
        <p
          class="text-base text-cream/30 leading-relaxed max-w-sm mb-12 ltr:ml-2 rtl:mr-2"
          data-reveal
          data-reveal-delay="200"
        >
          {{ $t('home.splitArabicBody') }}
        </p>

        <!-- CTA -->
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

// Islamic geometric star pattern — very subtle background texture
const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23C8A951' stroke-width='0.5'><polygon points='40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26'/><polygon points='40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5'/></g></svg>`;

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat'
};
</script>
