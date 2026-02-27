<template>
  <section class="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-center">
    <!-- Background photograph -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1920&q=80"
        alt=""
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <!-- Dark gradient overlay — cinematic depth -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/60" aria-hidden="true"></div>
    <!-- Secondary lateral gradient for dimension -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" aria-hidden="true"></div>

    <div class="section-wide relative py-28 md:py-40 text-center">
      <!-- Thin gold rule — compositional anchor -->
      <div class="w-12 h-px bg-gold/50 mx-auto mb-10" data-reveal aria-hidden="true"></div>

      <h2
        class="heading-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.08] mb-6 max-w-3xl mx-auto text-balance"
        data-reveal="cinematic"
      >
        {{ $t('home.splitQuranTitle') }}
      </h2>

      <p
        class="text-base md:text-lg text-cream/55 max-w-lg mx-auto leading-relaxed mb-12"
        data-reveal
        data-reveal-delay="150"
      >
        {{ $t('home.splitQuranBody') }}
      </p>

      <div data-reveal data-reveal-delay="300">
        <a
          :href="whatsAppHref"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-3 rounded-full bg-gold px-9 py-3.5 text-base font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
        >
          {{ $t('hero.ctaWhatsApp') }}
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </a>
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
