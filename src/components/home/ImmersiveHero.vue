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

        <!-- Ornamental flourish divider -->
        <div class="hero-entrance hero-entrance-2 mt-2 mb-6" aria-hidden="true">
          <svg class="w-[280px] h-[20px]" viewBox="0 0 280 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Left arrow -->
            <path d="M0 10 L12 5 L12 15 Z" fill="#C8A951" />
            <!-- Left line -->
            <line x1="14" y1="10" x2="105" y2="10" stroke="#C8A951" stroke-width="1" />
            <!-- Left scroll curl -->
            <path d="M105 10 Q115 2, 125 10 Q115 18, 105 10" stroke="#C8A951" stroke-width="1" fill="none" />
            <!-- Central diamond -->
            <path d="M130 10 L140 3 L150 10 L140 17 Z" fill="#C8A951" />
            <!-- Inner diamond -->
            <path d="M135 10 L140 5.5 L145 10 L140 14.5 Z" fill="none" stroke="#C8A951" stroke-width="0.5" />
            <!-- Right scroll curl -->
            <path d="M155 10 Q165 2, 175 10 Q165 18, 155 10" stroke="#C8A951" stroke-width="1" fill="none" />
            <!-- Right line -->
            <line x1="175" y1="10" x2="266" y2="10" stroke="#C8A951" stroke-width="1" />
            <!-- Right arrow -->
            <path d="M280 10 L268 5 L268 15 Z" fill="#C8A951" />
          </svg>
        </div>

        <!-- Motto -->
        <p class="hero-entrance hero-entrance-2 font-display italic text-cream/70 text-xl sm:text-2xl md:text-3xl leading-relaxed mb-8">
          {{ $t('hero.motto') }}
        </p>

        <!-- Platform description -->
        <p class="hero-entrance hero-entrance-3 text-base sm:text-lg text-cream/80 leading-relaxed max-w-md mb-12">
          {{ $t('hero.description') }}
        </p>

        <!-- CTA buttons — two rectangular side by side -->
        <div class="hero-entrance hero-entrance-3 flex flex-col sm:flex-row items-stretch gap-4">
          <!-- WhatsApp — gold filled -->
          <a
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-between gap-6 bg-gold px-8 py-4 text-sm font-semibold text-primary-950 hover:bg-gold-300 transition-all duration-200"
          >
            {{ $t('hero.ctaWhatsApp') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </a>
          <!-- View programs — dark green -->
          <RouterLink
            to="/programs"
            class="inline-flex items-center justify-between gap-6 bg-primary-950 px-8 py-4 text-sm font-semibold text-cream border border-cream/20 hover:bg-primary-900 transition-all duration-200"
          >
            {{ $t('hero.ctaPrograms') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
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
