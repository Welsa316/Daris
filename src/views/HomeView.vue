<template>
  <div>
    <!-- 1. Hero -->
    <ImmersiveHero />

    <!-- Sliver between hero and content -->
    <div class="h-1 bg-cream" aria-hidden="true"></div>

    <!-- 2. Quran -->
    <ImmersiveQuran />

    <!-- 3. Fiqh -->
    <ImmersiveFiqh />

    <!-- 4. Arabic — flows into AuthorityStats (both cream bg, no image) -->
    <ImmersiveArabic />

    <!-- 6. Authority Stats -->
    <AuthorityStats />

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
