<template>
  <div>
    <!-- 1. Hero -->
    <ImmersiveHero />

    <!-- Sliver between hero and content -->
    <div class="h-1 bg-cream" aria-hidden="true"></div>

    <!-- 2. Quran -->
    <ImmersiveQuran />

    <!-- Sliver between Quran and Fiqh -->
    <div class="h-1 bg-cream" aria-hidden="true"></div>

    <!-- 3. Fiqh -->
    <ImmersiveFiqh />

    <!-- 4. Arabic + Authority — unified cream bg with shared gold Islamic pattern -->
    <div class="relative bg-cream overflow-hidden">
      <!-- Shared gold Islamic geometric pattern covering both sections -->
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg class="w-full h-full opacity-[0.12]" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="sharedIslamicPattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26" fill="none" stroke="#C8A951" stroke-width="0.5" />
              <polygon points="40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5" fill="none" stroke="#C8A951" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sharedIslamicPattern)" />
        </svg>
      </div>

      <!-- Decorative mosque arch outline — centered behind content -->
      <div class="absolute inset-0 flex items-start justify-center pointer-events-none" aria-hidden="true">
        <svg class="w-full max-w-5xl h-[900px] opacity-[0.08] mt-12" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <path d="M350 900 L350 380 Q350 120 600 20 Q850 120 850 380 L850 900" stroke="#C8A951" stroke-width="2.5" fill="none" />
          <path d="M380 900 L380 390 Q380 145 600 50 Q820 145 820 390 L820 900" stroke="#C8A951" stroke-width="1.5" fill="none" />
        </svg>
      </div>

      <ImmersiveArabic />
      <AuthorityStats />
    </div>

    <!-- 6b. Countries Reach -->
    <CountriesReach />

    <!-- 7. Testimonials — editorial, hairlines (commented out for future use)
    <TestimonialSection />
    -->

    <!-- 8. Final CTA — cinematic close -->
    <BoldCTA />
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/useScrollReveal';
import ImmersiveHero from '@/components/home/ImmersiveHero.vue';
import ImmersiveQuran from '@/components/home/ImmersiveQuran.vue';
import ImmersiveArabic from '@/components/home/ImmersiveArabic.vue';
import ImmersiveFiqh from '@/components/home/ImmersiveFiqh.vue';
import AuthorityStats from '@/components/home/AuthorityStats.vue';
import CountriesReach from '@/components/home/CountriesReach.vue';
// import TestimonialSection from '@/components/home/TestimonialSection.vue';
import BoldCTA from '@/components/home/BoldCTA.vue';

useScrollReveal();
</script>
