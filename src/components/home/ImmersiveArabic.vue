<template>
  <!-- ARABIC — Ornate title + paper pane + mihrab arch with Quran verse. -->
  <section class="relative flex flex-col justify-center py-24 px-6 md:px-24 overflow-visible">

    <!-- Content grid -->
    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">

      <!-- ─── Left column: paper pane ─── -->
      <div class="lg:col-span-7 lg:pe-8">
        <div
          class="relative bg-white p-10 md:p-16 rounded-sm"
          style="box-shadow: 0 0 40px rgba(212, 175, 55, 0.08), inset 0 0 20px rgba(255, 255, 255, 0.3); border: 1px solid rgba(212, 175, 55, 0.25);"
          data-reveal
        >
          <!-- Subtle dot pattern on paper -->
          <div
            class="absolute inset-0 opacity-[0.06] pointer-events-none"
            style="background-image: radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.3) 1px, transparent 0); background-size: 24px 24px;"
            aria-hidden="true"
          ></div>

          <div class="relative z-10">
            <!-- Eyebrow -->
            <p class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/60 mb-10">
              {{ $t('home.splitArabicEyebrow') }}
            </p>

            <!-- Ornate title — gradient forest green → gold -->
            <h2 class="font-ornate text-4xl md:text-6xl lg:text-7xl leading-[1.15] tracking-tighter mb-12 overflow-visible">
              <span class="text-primary-950">{{ $t('home.splitArabicHeadline1') }}</span>
              <br />
              <span class="text-reveal block mt-2 font-black italic">{{ $t('home.splitArabicHeadline2') }}</span>
            </h2>

            <!-- Tha'alibi quote — smaller, under the title -->
            <div class="relative ltr:pl-8 rtl:pr-8 ltr:border-l rtl:border-r border-gold/30 mb-12">
              <p class="font-display italic text-2xl md:text-3xl text-primary-950/80 leading-snug max-w-2xl">
                &ldquo;{{ $t('home.splitArabicQuote') }}&rdquo;
              </p>
              <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-gold mt-6">
                {{ $t('home.splitArabicAttribution') }}
              </p>
            </div>

            <!-- Body description -->
            <div class="max-w-xl mb-12">
              <p class="text-primary-950/70 text-lg leading-relaxed font-light">
                {{ $t('home.splitArabicBody') }}
              </p>
            </div>

            <!-- CTA -->
            <a
              :href="whatsAppHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-6 py-4 px-10 bg-primary-950 text-gold border border-gold/30 font-bold tracking-widest uppercase text-sm hover:bg-primary-950/90 transition-all duration-200 group"
              data-reveal
              data-reveal-delay="200"
            >
              {{ $t('home.splitArabicCta') }}
              <svg class="h-4 w-4 rtl:rotate-180 group-hover:ltr:translate-x-2 group-hover:rtl:-translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- ─── Right column: mihrab arch with Quran verse ─── -->
      <div class="lg:col-span-5 flex flex-col justify-center items-center">
        <div
          class="mihrab-arch relative w-full max-w-[320px] h-[480px] rounded-t-full border-2 border-gold/40 overflow-hidden flex flex-col items-center justify-center"
          data-reveal
          data-reveal-delay="200"
        >
          <!-- Green gradient depth -->
          <div class="absolute inset-0 bg-gradient-to-t from-primary-950/60 via-primary-950/30 to-primary-950/10" aria-hidden="true"></div>

          <!-- Side panels with gold gradient -->
          <div class="absolute left-0 top-0 w-10 h-full bg-gradient-to-b from-gold/15 to-transparent border-r border-gold/10" aria-hidden="true"></div>
          <div class="absolute right-0 top-0 w-10 h-full bg-gradient-to-b from-gold/15 to-transparent border-l border-gold/10" aria-hidden="true"></div>

          <!-- Inner content -->
          <div class="relative z-10 text-center px-8">
            <!-- Quran verse in gold -->
            <p
              class="font-display text-3xl md:text-4xl text-gold leading-relaxed mb-4"
              dir="rtl"
              lang="ar"
            >
              بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
            </p>
            <!-- English translation -->
            <p class="text-cream/60 text-sm italic mb-4">
              {{ $t('home.quranVerseTranslation') }}
            </p>
            <!-- Surah reference in white -->
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-white/80">{{ $t('home.quranVerseRef') }}</p>
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

<style scoped>
.text-reveal {
  background: linear-gradient(to bottom, #0c2019 0%, #C8A951 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.mihrab-arch {
  background: rgba(12, 32, 25, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 0 40px rgba(200, 169, 81, 0.08), inset 0 0 60px rgba(12, 32, 25, 0.3);
}
</style>
