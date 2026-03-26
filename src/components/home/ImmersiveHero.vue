<template>
  <section class="relative min-h-screen bg-black overflow-hidden">
    <!-- Full-width background photograph with warm gold tint -->
    <div class="absolute inset-0">
      <img
        src="/images/HeroBanner.jpeg"
        alt="Children studying in a mosque with light rays streaming through an archway"
        class="hero-image w-full h-full object-cover object-[center_80%]"
      />
    </div>

    <!-- Warm gold tint overlay -->
    <div class="absolute inset-0 bg-gold/10" aria-hidden="true"></div>

    <!-- Warm vignette overlay — LTR: dark left fading right -->
    <div
      class="absolute inset-0 ltr:block rtl:hidden"
      style="background: linear-gradient(to right, rgba(20, 15, 10, 0.8) 0%, rgba(20, 15, 10, 0.2) 50%, transparent 100%);"
      aria-hidden="true"
    ></div>
    <!-- Warm vignette overlay — RTL: dark right fading left -->
    <div
      class="absolute inset-0 rtl:block ltr:hidden"
      style="background: linear-gradient(to left, rgba(20, 15, 10, 0.8) 0%, rgba(20, 15, 10, 0.2) 50%, transparent 100%);"
      aria-hidden="true"
    ></div>

    <!-- ─── Content overlaid on photograph ─── -->
    <div class="relative z-10 flex items-center min-h-screen">
      <div class="relative px-8 md:px-16 lg:px-24 py-20">

        <!-- Liquid glass box — dark tinted, gold outline, rounded -->
        <div class="hero-entrance hero-entrance-1 bg-black/50 backdrop-blur-md border border-gold/30 rounded-2xl p-8 md:p-12 lg:p-14 max-w-2xl">

          <!-- Brand name -->
          <h1 class="font-display text-gold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.1em] leading-none mb-0">
            {{ $t('hero.eyebrow') }}
          </h1>

          <!-- Book divider — gold line / open book icon / gold line -->
          <div class="flex items-center mt-3 mb-6 max-w-[200px]" aria-hidden="true">
            <div class="h-px bg-gold flex-grow"></div>
            <div class="mx-2 text-gold">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="h-px bg-gold flex-grow"></div>
          </div>

          <!-- Motto -->
          <p class="hero-entrance hero-entrance-2 font-display italic text-cream/70 text-xl sm:text-2xl md:text-3xl leading-relaxed mb-8">
            {{ $t('hero.motto') }}
          </p>

          <!-- Platform description -->
          <p class="hero-entrance hero-entrance-3 text-base sm:text-lg text-cream/80 leading-relaxed max-w-lg mb-10">
            {{ $t('hero.description') }}
          </p>

          <!-- CTA buttons — pill shape, side by side -->
          <div class="hero-entrance hero-entrance-3 flex flex-col sm:flex-row items-stretch gap-4">
            <!-- WhatsApp — shiny metallic gold pill -->
            <a
              :href="whatsAppHref"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-gold-shiny inline-flex items-center justify-between gap-6 rounded-full px-6 py-3 text-sm font-semibold text-primary-950 hover:brightness-110 transition-all duration-200"
            >
              {{ $t('hero.ctaWhatsApp') }}
              <svg class="h-4 w-4 text-primary-700 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
            <!-- View programs — solid dark green pill -->
            <RouterLink
              to="/programs"
              class="inline-flex items-center justify-between gap-6 rounded-full bg-primary-950 px-6 py-3 text-sm font-semibold text-cream hover:bg-primary-900 transition-all duration-200"
            >
              {{ $t('hero.ctaPrograms') }}
              <svg class="h-4 w-4 text-gold rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </RouterLink>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useWhatsApp } from '@/composables/useWhatsApp';

const { whatsAppHref } = useWhatsApp();
</script>

<style scoped>
.hero-image {
  filter: sepia(0.45) contrast(1.1) brightness(0.9);
}
.btn-gold-shiny {
  background: linear-gradient(to bottom, #e8cc7a 0%, #d5b96a 40%, #c8a951 60%, #b89840 100%);
  box-shadow: 0 0 15px rgba(200, 169, 81, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
</style>
