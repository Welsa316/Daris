<template>
  <!-- FIQH — Grounded & Practical
       Lower-third dark panel overlay. Image breathes at the top.
       Directional top-down light. Documentary frame feel.
       Strongest contrast of the three immersive sections. -->
  <section class="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-end">
    <!-- Photograph — mosque interior with natural light streaming in -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=80"
        alt="Mosque interior bathed in natural light, arched windows casting warm shadows"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <!-- Top-down directional gradient — image is bright at top, fades into panel at bottom -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" aria-hidden="true"></div>
    <!-- Grain — heavier, grittier feel -->
    <div class="absolute inset-0 grain-texture opacity-60" aria-hidden="true"></div>

    <!-- Lower-third panel — text anchored to the bottom, image breathes above -->
    <div class="relative w-full">
      <!-- Soft frosted panel with hard top edge for documentary feel -->
      <div class="bg-gradient-to-b from-primary-950/80 via-primary-950/90 to-primary-950 backdrop-blur-sm border-t border-white/[0.05]">
        <div class="section-wide py-14 md:py-20">
          <div class="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 md:gap-16 items-end">
            <!-- Text — left column of the panel -->
            <div>
              <p
                class="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold/60 mb-4"
                data-reveal
              >
                {{ $t('home.splitFiqhEyebrow') }}
              </p>

              <h2
                class="font-display text-3xl sm:text-4xl md:text-5xl text-cream leading-[1.12] mb-5"
                data-reveal="cinematic"
              >
                {{ $t('home.splitFiqhTitle') }}
              </h2>

              <p
                class="text-base text-cream/35 leading-relaxed max-w-md"
                data-reveal
                data-reveal-delay="150"
              >
                {{ $t('home.splitFiqhBody') }}
              </p>
            </div>

            <!-- CTA — right column, vertically aligned to bottom -->
            <div class="md:text-right" data-reveal data-reveal-delay="300">
              <a
                :href="whatsAppHref"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-3 rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-primary-950 hover:bg-gold-300 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary-950"
              >
                {{ $t('hero.ctaWhatsApp') }}
                <svg class="h-3.5 w-3.5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
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
