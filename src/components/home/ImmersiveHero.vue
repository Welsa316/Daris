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
      <div class="relative px-12 md:px-20 lg:px-28 py-20 max-w-xl">

        <!-- Brand name — dramatically large -->
        <h1 class="hero-entrance hero-entrance-1 font-display text-gold text-7xl sm:text-8xl md:text-9xl tracking-[0.1em] leading-none mb-0">
          {{ $t('hero.eyebrow') }}
        </h1>

        <!-- Book divider — gold line / open book icon / gold line -->
        <div class="hero-entrance hero-entrance-2 flex items-center mt-2 mb-6 max-w-[200px]" aria-hidden="true">
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
        <p class="hero-entrance hero-entrance-3 text-base sm:text-lg text-cream/80 leading-relaxed max-w-md mb-12">
          {{ $t('hero.description') }}
        </p>

        <!-- CTA buttons — pill shape, side by side -->
        <div class="hero-entrance hero-entrance-3 flex flex-col sm:flex-row items-stretch gap-4">
          <!-- WhatsApp — gold pill with glow -->
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-between gap-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-950 shadow-[0_0_15px_rgba(200,169,81,0.3)] hover:opacity-90 transition-all duration-200"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
          <!-- View programs — green-tinted liquid glass pill -->
          <RouterLink
            to="/programs"
            class="inline-flex items-center justify-between gap-6 rounded-full border border-primary/40 bg-primary-950/20 backdrop-blur-[4px] px-6 py-3 text-sm font-semibold text-cream/90 hover:bg-primary-950/30 transition-all duration-200"
          >
            {{ $t('hero.ctaPrograms') }}
            <svg class="h-4 w-4 text-gold rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </RouterLink>
        </div>

      </div>
    </div>
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

<style scoped>
.hero-image {
  filter: sepia(0.3) contrast(1.1) brightness(0.9);
}
</style>
