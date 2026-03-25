<template>
  <!-- ARABIC — Open, white, quote-focused. No background image, no box. -->
  <section class="relative overflow-hidden bg-cream py-32 md:py-44 lg:py-52">

    <!-- ─── Content — asymmetric, left-heavy ─── -->
    <div class="relative z-10 section-wide">
      <div class="max-w-3xl ltr:mr-auto rtl:ml-auto">

        <!-- Eyebrow -->
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary-700/40 mb-10"
          data-reveal
        >
          {{ $t('home.splitArabicEyebrow') }}
        </p>

        <!-- Tha'alibi quote — dominant text, in quotes -->
        <blockquote
          class="relative mb-12"
          data-reveal="cinematic"
        >
          <p class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-primary-950 leading-[1.3]">
            &ldquo;{{ $t('home.splitArabicQuote') }}&rdquo;
          </p>
        </blockquote>

        <!-- Quran verse — normal text, styled as an accent -->
        <p
          class="font-display text-xl sm:text-2xl md:text-3xl text-gold leading-relaxed mb-12"
          dir="rtl"
          lang="ar"
          data-reveal
          data-reveal-delay="100"
        >
          بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
        </p>

        <!-- Gold rule -->
        <div class="w-16 h-px bg-gold/40 mb-10" data-reveal aria-hidden="true"></div>

        <!-- Title -->
        <h2
          class="font-display text-xl sm:text-2xl md:text-3xl text-primary-950/80 leading-[1.15] mb-5 max-w-lg"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('home.splitArabicTitle') }}
        </h2>

        <!-- Body -->
        <p
          class="text-base text-primary-950/40 leading-relaxed max-w-md mb-12"
          data-reveal
          data-reveal-delay="200"
        >
          {{ $t('home.splitArabicBody') }}
        </p>

        <!-- CTA -->
        <div data-reveal data-reveal-delay="300">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2.5 text-sm font-medium text-primary-950 hover:text-primary-700 transition-colors duration-200"
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
