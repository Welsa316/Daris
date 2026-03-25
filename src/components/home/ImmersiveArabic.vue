<template>
  <!-- ARABIC — Stitch-inspired asymmetric layout.
       Cream bg, large Tha'alibi quote as headline, Quran verse card on right. -->
  <section class="relative min-h-[900px] bg-cream flex flex-col justify-center py-24 px-6 md:px-24 overflow-hidden">

    <!-- Subtle star watermark (placeholder — to be replaced later) -->
    <div class="absolute top-20 ltr:right-10 rtl:left-10 opacity-10 pointer-events-none" aria-hidden="true">
      <svg class="text-gold fill-current" height="400" width="400" viewBox="0 0 100 100">
        <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
        <circle cx="50" cy="50" fill="none" r="15" stroke="currentColor" stroke-width="0.5" />
      </svg>
    </div>

    <!-- Organic background shapes -->
    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute -top-20 ltr:-left-40 rtl:-right-40 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-0 ltr:right-0 rtl:left-0 w-full h-[40%] bg-gold/5" style="clip-path: polygon(0 15%, 20% 0, 50% 10%, 80% 0, 100% 20%, 100% 100%, 0% 100%);"></div>
    </div>

    <!-- Content grid -->
    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-12">

      <!-- ─── Left column: quote + description ─── -->
      <div class="lg:col-span-6 flex flex-col items-start gap-12">

        <!-- Eyebrow -->
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/60"
          data-reveal
        >
          {{ $t('home.splitArabicEyebrow') }}
        </p>

        <!-- Tha'alibi quote — the dominant headline -->
        <div class="relative ltr:pl-12 rtl:pr-12" data-reveal="cinematic">
          <!-- Quote icon -->
          <span
            class="absolute ltr:left-0 rtl:right-0 top-0 font-serif text-gold/50 text-6xl leading-none select-none pointer-events-none"
            aria-hidden="true"
          >&ldquo;</span>
          <p class="font-display italic text-3xl md:text-4xl lg:text-5xl text-primary-950/80 leading-[1.2] max-w-2xl">
            {{ $t('home.splitArabicQuote') }}
          </p>
          <p class="text-[10px] uppercase tracking-[0.2em] text-gold mt-4">
            {{ $t('home.splitArabicAttribution') }}
          </p>
        </div>

        <!-- Indented body text with gold rule -->
        <div class="w-full max-w-md ltr:ml-12 ltr:lg:ml-24 rtl:mr-12 rtl:lg:mr-24 mt-4" data-reveal data-reveal-delay="150">
          <div class="h-px w-24 bg-gold/40 mb-8"></div>
          <p class="text-primary-950/60 text-lg leading-relaxed font-light">
            {{ $t('home.splitArabicBody') }}
          </p>
        </div>

        <!-- CTA -->
        <div data-reveal data-reveal-delay="300">
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-3 bg-gold text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] transition-all duration-200"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>
      </div>

      <!-- ─── Right column: Quran verse card ─── -->
      <div class="lg:col-span-4 flex flex-col justify-end lg:pb-20">
        <div
          class="relative p-10 bg-primary-950/[0.03] backdrop-blur-md rounded-xl ltr:border-l rtl:border-r border-gold/30 shadow-sm"
          data-reveal
          data-reveal-delay="200"
        >
          <div class="relative z-10">
            <!-- Quran verse -->
            <p
              class="font-display italic text-2xl md:text-3xl text-primary-950/70 leading-relaxed mb-6"
              dir="rtl"
              lang="ar"
            >
              بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
            </p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-gold mb-6">{{ $t('home.quranVerseRef') }}</p>
            <!-- Section title -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-px bg-gold"></div>
              <h2 class="text-sm text-primary-950/40 tracking-widest uppercase">
                {{ $t('home.splitArabicTitle') }}
              </h2>
            </div>
          </div>
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
