<template>
  <section class="relative overflow-hidden bg-primary py-24 md:py-32">
    <div class="absolute inset-0 bg-gradient-to-b from-primary-950/20 to-primary-900/30" aria-hidden="true"></div>
    <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>

    <div class="section-container relative text-center">
      <h2 class="heading-display text-3xl sm:text-4xl md:text-5xl text-cream mb-6 text-balance">
        {{ $t('home.ctaTitle') }}
      </h2>
      <p class="text-base text-cream/50 max-w-md mx-auto mb-10">
        {{ $t('home.ctaText') }}
      </p>
      <a
        :href="whatsAppHref"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2.5 rounded-full bg-gold px-10 py-4 text-base font-semibold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        {{ $t('home.ctaWhatsApp') }}
      </a>
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
