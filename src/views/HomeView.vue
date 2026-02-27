<template>
  <div>
    <!-- 1. Hero — brand-first, split-screen editorial -->
    <ImmersiveHero />

    <!-- 3. Quran — reverent, warm, centered, frosted backdrop -->
    <ImmersiveQuran />

    <!-- Breathing space — clean gradient divider -->
    <div class="h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" aria-hidden="true"></div>

    <!-- 4. Arabic — scholarly, asymmetric left-aligned, calligraphy -->
    <ImmersiveArabic />

    <!-- Breathing space -->
    <div class="h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" aria-hidden="true"></div>

    <!-- 5. Fiqh — grounded, lower-third panel, mosque interior -->
    <ImmersiveFiqh />

    <!-- 6. Authority Stats -->
    <AuthorityStats />

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
// import TestimonialSection from '@/components/home/TestimonialSection.vue';
import BoldCTA from '@/components/home/BoldCTA.vue';

useScrollReveal();
</script>
