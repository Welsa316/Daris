<template>
  <!-- ARABIC — Ornate title + paper pane + translucent verse card.
       The editorial, light-on-cream counterpart to the photo-immersive Quran & Fiqh sections.
       Luxury Islamic aesthetic: layered gold details, sacred geometry, reverent depth. -->
  <section class="relative flex flex-col justify-center py-24 px-6 md:px-24 overflow-visible">

    <!-- Content grid -->
    <div class="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">

      <!-- ─── Left column: paper pane ─── -->
      <div class="lg:col-span-7 lg:pe-10">
        <div
          class="paper-pane relative bg-cream-50 p-10 md:p-16 rounded-sm overflow-visible"
          data-reveal
        >
          <!-- Aged paper warmth overlay -->
          <div class="absolute inset-0 rounded-sm" style="background: linear-gradient(145deg, rgba(245, 241, 232, 0.3) 0%, rgba(237, 230, 213, 0.15) 100%);" aria-hidden="true"></div>

          <!-- Subtle Islamic geometric grid pattern -->
          <div class="absolute inset-0 pointer-events-none rounded-sm" aria-hidden="true">
            <svg class="w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="paperGeometric" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="none" stroke="#C8A951" stroke-width="0.5" />
                  <circle cx="24" cy="24" r="3" fill="none" stroke="#C8A951" stroke-width="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#paperGeometric)" />
            </svg>
          </div>

          <!-- Decorative gold corner flourishes -->
          <div class="absolute top-3 ltr:left-3 rtl:right-3 w-8 h-8 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" class="w-full h-full text-gold/25">
              <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
              <path d="M6 0 L6 6 L0 6" fill="none" stroke="currentColor" stroke-width="0.5" />
            </svg>
          </div>
          <div class="absolute top-3 ltr:right-3 rtl:left-3 w-8 h-8 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" class="w-full h-full text-gold/25 ltr:scale-x-[-1] rtl:scale-x-100">
              <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
              <path d="M6 0 L6 6 L0 6" fill="none" stroke="currentColor" stroke-width="0.5" />
            </svg>
          </div>
          <div class="absolute bottom-3 ltr:left-3 rtl:right-3 w-8 h-8 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" class="w-full h-full text-gold/25 scale-y-[-1]">
              <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
              <path d="M6 0 L6 6 L0 6" fill="none" stroke="currentColor" stroke-width="0.5" />
            </svg>
          </div>
          <div class="absolute bottom-3 ltr:right-3 rtl:left-3 w-8 h-8 pointer-events-none" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" class="w-full h-full text-gold/25 ltr:scale-[-1] rtl:scale-y-[-1]">
              <path d="M0 0 L12 0 L12 2 L2 2 L2 12 L0 12 Z" fill="currentColor" />
              <path d="M6 0 L6 6 L0 6" fill="none" stroke="currentColor" stroke-width="0.5" />
            </svg>
          </div>

          <div class="relative z-10">
            <!-- Eyebrow -->
            <p class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/60 mb-10">
              {{ $t('home.splitArabicEyebrow') }}
            </p>

            <!-- Ornate title — Cinzel Decorative (English) / Noto Sans Arabic fallback -->
            <h2 class="font-ornate text-5xl md:text-7xl lg:text-8xl !leading-[1.15] tracking-tighter mb-14 pt-2 overflow-visible uppercase">
              <span class="text-primary-950 block pb-1">{{ $t('home.splitArabicHeadline1') }}</span>
              <span class="text-reveal block font-black pb-8">{{ $t('home.splitArabicHeadline2') }}</span>
            </h2>

            <!-- Tha'alibi quote — ornate border with diamond flourish -->
            <div class="relative ltr:pl-8 rtl:pr-8 mb-12">
              <!-- Ornate quote border: gold line with diamond midpoint -->
              <div class="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-px" aria-hidden="true">
                <div class="h-full w-full bg-gradient-to-b from-gold/10 via-gold/35 to-gold/10"></div>
                <div class="absolute top-1/2 ltr:left-1/2 rtl:right-1/2 -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 w-2 h-2 bg-gold/30 rotate-45"></div>
              </div>
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

            <!-- CTA — rounded pill to match Quran/Fiqh sections -->
            <a
              :href="whatsAppHref"
              target="_blank"
              rel="noopener noreferrer"
              class="cta-btn inline-flex items-center gap-4 py-3.5 px-9 rounded-full bg-primary-950 text-gold border border-gold/20 font-semibold tracking-wider uppercase text-sm hover:border-gold/40 transition-all duration-300 group"
              data-reveal
              data-reveal-delay="200"
            >
              {{ $t('home.splitArabicCta') }}
              <svg class="h-3.5 w-3.5 rtl:rotate-180 group-hover:ltr:translate-x-1.5 group-hover:rtl:-translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- ─── Right column: translucent glass card with Quran verse ─── -->
      <div class="lg:col-span-5 flex flex-col justify-center items-center">
        <div
          class="verse-card relative w-full max-w-md p-10 md:p-12 rounded-sm overflow-hidden"
          data-reveal
          data-reveal-delay="200"
        >
          <!-- Translucent dot pattern overlay -->
          <div class="verse-dots absolute inset-0 pointer-events-none" aria-hidden="true"></div>

          <!-- Subtle Islamic geometric pattern inside -->
          <div class="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true">
            <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="versePattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 0 L37.5 22.5 L60 30 L37.5 37.5 L30 60 L22.5 37.5 L0 30 L22.5 22.5 Z" fill="none" stroke="#C8A951" stroke-width="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#versePattern)" />
            </svg>
          </div>

          <div class="relative z-10">
            <!-- Quran verse in gold -->
            <p
              class="font-display text-3xl md:text-4xl text-gold !leading-[1.6] mb-8"
              dir="rtl"
              lang="ar"
            >
              بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
            </p>

            <!-- Gold divider with line and diamond -->
            <div class="flex items-center gap-4 mb-8">
              <div class="w-16 h-px bg-gold/40"></div>
              <div class="w-1.5 h-1.5 rotate-45 bg-gold/30"></div>
            </div>

            <!-- Translation -->
            <p class="text-cream italic font-display text-lg leading-relaxed mb-2">
              {{ $t('home.quranVerseTranslation') }}
            </p>

            <!-- Surah reference -->
            <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/70 mt-4">
              {{ $t('home.quranVerseRef') }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useWhatsApp } from '@/composables/useWhatsApp';

const { whatsAppHref } = useWhatsApp();
</script>

<style scoped>
/* Title gradient: forest green → gold.
   Ends at 80% so the gold fully covers Arabic descenders & dots (ya, etc.) */
.text-reveal {
  background: linear-gradient(to bottom, #0c2019 0%, #C8A951 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Paper pane — warm editorial feel with gold accents */
.paper-pane {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 4px 16px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(212, 175, 55, 0.15),
    inset 0 0 40px rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Translucent glass card — from stitch design */
.verse-card {
  background: rgba(12, 32, 25, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(200, 169, 81, 0.35);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(200, 169, 81, 0.04);
}

.verse-dots {
  opacity: 0.12;
  background-image: radial-gradient(circle at 2px 2px, rgba(200, 169, 81, 0.15) 1px, transparent 0);
  background-size: 24px 24px;
}

/* CTA — gold glow on hover */
.cta-btn {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.cta-btn:hover {
  box-shadow: 0 4px 20px rgba(200, 169, 81, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
