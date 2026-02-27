<template>
  <!-- Credibility — white background contrasts with dark Fiqh section above.
       Asymmetric editorial layout with depth and character. -->
  <section class="relative bg-white overflow-hidden">
    <!-- Subtle diagonal decorative element for depth -->
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-cream-50/80 to-transparent" aria-hidden="true"></div>
    <!-- Fine top border accent -->
    <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>

    <div class="section-wide relative py-20 md:py-28">
      <!-- Asymmetric grid: wide left column + narrow right column -->
      <div class="grid md:grid-cols-[1.4fr_1fr] gap-16 md:gap-20 items-start">

        <!-- Left column — headline credential + Al-Azhar callout -->
        <div>
          <p
            class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold mb-5"
            data-reveal
          >
            {{ $t('home.credibilityEyebrow') }}
          </p>

          <h2
            class="font-display text-3xl sm:text-4xl md:text-[2.75rem] text-slate-900 leading-[1.15] mb-6"
            data-reveal="cinematic"
          >
            {{ $t('home.credibilityTitle') }}
          </h2>

          <p
            class="text-base text-slate-500 leading-relaxed max-w-lg mb-10"
            data-reveal
            data-reveal-delay="100"
          >
            {{ $t('home.credibilityBody') }}
          </p>

          <!-- Al-Azhar callout — distinct, offset card with subtle depth -->
          <div
            class="relative ml-0 md:ml-6 p-6 md:p-8 rounded-2xl bg-cream-50 border border-cream-200/60 shadow-soft"
            data-reveal
            data-reveal-delay="200"
          >
            <!-- Decorative gold corner accent -->
            <div class="absolute top-0 left-6 w-10 h-[3px] bg-gold/40 rounded-full" aria-hidden="true"></div>
            <p class="text-sm font-semibold text-primary-700 mt-2 mb-1.5">
              {{ $t('home.azharTitle') }}
            </p>
            <p class="text-sm text-slate-500 leading-relaxed">
              {{ $t('home.azharBody') }}
            </p>
          </div>
        </div>

        <!-- Right column — staggered stat cards with varied sizing -->
        <div class="space-y-5 md:pt-14" data-reveal data-reveal-delay="150">
          <!-- Top stat — large, hero number -->
          <div class="p-6 rounded-xl bg-primary-950 text-white">
            <p class="heading-display text-4xl md:text-5xl text-gold font-bold leading-none mb-2">
              {{ $t('home.stat1Value') }}
            </p>
            <p class="text-xs text-cream/50 tracking-wide uppercase">
              {{ $t('home.stat1Label') }}
            </p>
          </div>

          <!-- Two-up row — smaller paired stats -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-5 rounded-xl bg-cream-50 border border-cream-200/40">
              <p class="heading-display text-2xl md:text-3xl text-primary font-bold leading-none mb-1.5">
                {{ $t('home.stat2Value') }}
              </p>
              <p class="text-[11px] text-slate-400 tracking-wide uppercase">
                {{ $t('home.stat2Label') }}
              </p>
            </div>
            <div class="p-5 rounded-xl bg-cream-50 border border-cream-200/40">
              <p class="heading-display text-2xl md:text-3xl text-primary font-bold leading-none mb-1.5">
                {{ $t('home.stat3Value') }}
              </p>
              <p class="text-[11px] text-slate-400 tracking-wide uppercase">
                {{ $t('home.stat3Label') }}
              </p>
            </div>
          </div>

          <!-- Bottom stat — full-width, lighter tone -->
          <div class="p-5 rounded-xl bg-white border border-slate-100 shadow-card">
            <div class="flex items-center gap-4">
              <p class="heading-display text-2xl md:text-3xl text-gold font-bold leading-none">
                {{ $t('home.stat4Value') }}
              </p>
              <p class="text-xs text-slate-400 tracking-wide uppercase">
                {{ $t('home.stat4Label') }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
</script>
