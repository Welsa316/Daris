<template>
  <!-- ARABIC — Ornate title + paper pane + transparent verse card. -->
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
    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0">

      <!-- ─── Left column: paper pane ─── -->
      <div class="lg:col-span-8 lg:pe-8">
        <div
          class="relative bg-white p-10 md:p-16 rounded-sm overflow-hidden"
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
            <h2 class="font-ornate text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-12">
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

      <!-- ─── Right column: transparent glass card ─── -->
      <div class="lg:col-span-4 flex flex-col justify-center">
        <div
          class="relative w-full p-10 bg-primary-950/[0.04] backdrop-blur-md border border-gold/30 rounded-sm overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.06)]"
          data-reveal
          data-reveal-delay="200"
        >
          <!-- Subtle dot pattern -->
          <div
            class="absolute inset-0 opacity-[0.08] pointer-events-none"
            style="background-image: radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.2) 1px, transparent 0); background-size: 24px 24px;"
            aria-hidden="true"
          ></div>

          <div class="relative z-10">
            <!-- Quran verse -->
            <p
              class="font-display italic text-2xl md:text-3xl text-primary-950/70 leading-relaxed mb-4"
              dir="rtl"
              lang="ar"
            >
              بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
            </p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-gold">{{ $t('home.quranVerseRef') }}</p>
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
  background: linear-gradient(to bottom, var(--color-primary-950) 0%, var(--color-gold) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
