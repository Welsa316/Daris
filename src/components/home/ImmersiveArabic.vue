<template>
  <!-- ARABIC — Ornate title + paper pane + mihrab arch with Quran verse.
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
            <h2 class="font-ornate text-6xl md:text-8xl lg:text-9xl !leading-[1.3] tracking-tighter mb-14 pt-2 overflow-visible uppercase">
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

      <!-- ─── Right column: mihrab arch with Quran verse ─── -->
      <div class="lg:col-span-5 flex flex-col justify-center items-center">
        <div
          class="mihrab-wrapper relative w-full max-w-[340px]"
          data-reveal
          data-reveal-delay="200"
        >
          <!-- Mihrab arch via SVG clip path for a proper pointed arch shape -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 340 520" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath id="mihrabClip">
                <path d="M0 520 L0 220 Q0 40 170 0 Q340 40 340 220 L340 520 Z" />
              </clipPath>
              <!-- Radial gold glow for hover -->
              <radialGradient id="mihrabGlow" cx="50%" cy="20%" r="60%">
                <stop offset="0%" stop-color="rgba(200, 169, 81, 0.18)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>
          </svg>

          <div class="mihrab-outer" style="clip-path: url(#mihrabClip);">
            <!-- Deep green fill -->
            <div class="absolute inset-0 bg-primary-950"></div>

            <!-- Subtle radial glow from top center — intensifies on hover -->
            <div class="mihrab-glow absolute inset-0 transition-opacity duration-700" aria-hidden="true"></div>

            <!-- Interior geometric pattern — very subtle, adds sacred depth -->
            <div class="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true">
              <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mihrabPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#C8A951" stroke-width="0.5" />
                    <path d="M20 8 L32 20 L20 32 L8 20 Z" fill="none" stroke="#C8A951" stroke-width="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mihrabPattern)" />
              </svg>
            </div>

            <!-- Inner pointed arch border (decorative) -->
            <div class="absolute inset-0 flex items-start justify-center pt-6" aria-hidden="true">
              <svg class="w-[85%] h-[92%]" viewBox="0 0 290 470" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 470 L0 200 Q0 40 145 4 Q290 40 290 200 L290 470" stroke="rgba(200, 169, 81, 0.22)" stroke-width="1.5" fill="none" />
              </svg>
            </div>

            <!-- Second inner arch (thinner, more inset) -->
            <div class="absolute inset-0 flex items-start justify-center pt-10" aria-hidden="true">
              <svg class="w-[72%] h-[88%]" viewBox="0 0 245 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 420 L0 180 Q0 35 122.5 4 Q245 35 245 180 L245 420" stroke="rgba(200, 169, 81, 0.10)" stroke-width="1" fill="none" />
              </svg>
            </div>

            <!-- Vertical gold hairlines on sides -->
            <div class="absolute left-[10%] top-[15%] w-px h-[70%] bg-gradient-to-b from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>
            <div class="absolute right-[10%] top-[15%] w-px h-[70%] bg-gradient-to-b from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>

            <!-- Content centered in arch -->
            <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-10 pt-12">
              <!-- Rub el Hizb — Islamic 8-pointed star -->
              <svg class="w-7 h-7 text-gold/30 mb-8" viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                <polygon points="50,5 61,35 95,35 68,55 79,85 50,67 21,85 32,55 5,35 39,35" />
                <polygon points="50,15 58,37 80,37 63,52 70,75 50,61 30,75 37,52 20,37 42,37" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5" />
              </svg>

              <!-- Quran verse in gold — larger, more dramatic -->
              <p
                class="font-display text-[1.75rem] md:text-4xl text-gold !leading-[1.6] mb-5"
                dir="rtl"
                lang="ar"
              >
                بِلِسَانٍ عَرَبِيٍّ مُبِينٍ
              </p>

              <!-- Gold ornamental divider — triple line -->
              <div class="flex items-center gap-2 mb-5" aria-hidden="true">
                <div class="w-8 h-px bg-gradient-to-r from-transparent to-gold/30"></div>
                <div class="w-1.5 h-1.5 rotate-45 bg-gold/25"></div>
                <div class="w-8 h-px bg-gradient-to-l from-transparent to-gold/30"></div>
              </div>

              <!-- Translation -->
              <p class="text-cream/50 text-sm italic mb-3 font-light">
                {{ $t('home.quranVerseTranslation') }}
              </p>
              <!-- Surah reference -->
              <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-cream/35">{{ $t('home.quranVerseRef') }}</p>
            </div>
          </div>

          <!-- Outer gold border following the arch shape -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 520" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 519 L1 220 Q1 41 170 1 Q339 41 339 220 L339 519" stroke="rgba(200, 169, 81, 0.35)" stroke-width="2" fill="none" />
            <!-- Subtle outer shadow stroke -->
            <path d="M-2 519 L-2 221 Q-2 39 170 -2 Q342 39 342 221 L342 519" stroke="rgba(200, 169, 81, 0.06)" stroke-width="4" fill="none" />
          </svg>

          <!-- Subtle gold reflection at base of arch -->
          <div class="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>
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

/* Mihrab arch container */
.mihrab-outer {
  position: relative;
  width: 100%;
  aspect-ratio: 340 / 520;
}

/* Mihrab ambient glow — intensifies on hover */
.mihrab-glow {
  background: radial-gradient(ellipse at 50% 15%, rgba(200, 169, 81, 0.10) 0%, transparent 55%);
}

.mihrab-wrapper:hover .mihrab-glow {
  background: radial-gradient(ellipse at 50% 15%, rgba(200, 169, 81, 0.22) 0%, transparent 60%);
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
