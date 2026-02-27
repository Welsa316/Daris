<template>
  <div>
    <!-- 1. Immersive Hero — cinematic, left-aligned, dramatic (pattern lives here only) -->
    <ImmersiveHero />

    <!-- 2. Icon Grid — minimal, hairline-divided columns -->
    <IconGrid />

    <!-- 3. Immersive Quran — full-width photography, cinematic break -->
    <ImmersiveQuran />

    <!-- 4. Split: Arabic — reversed, solid beige left, text right -->
    <SplitSection
      eyebrowKey="home.splitArabicEyebrow"
      titleKey="home.splitArabicTitle"
      bodyKey="home.splitArabicBody"
      :reversed="true"
      surface="light"
    />

    <!-- 5. Split: Fiqh — solid deep green left, text right -->
    <SplitSection
      eyebrowKey="home.splitFiqhEyebrow"
      titleKey="home.splitFiqhTitle"
      bodyKey="home.splitFiqhBody"
      surface="deep"
    />

    <!-- 6. Authority Stats — horizontal gradient, grain, gold numbers -->
    <AuthorityStats />

    <!-- 7. Testimonials — editorial, hairlines, no cards -->
    <TestimonialSection />

    <!-- 8. Dramatic Final CTA — cinematic closing statement -->
    <BoldCTA />
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/useScrollReveal';
import ImmersiveHero from '@/components/home/ImmersiveHero.vue';
import IconGrid from '@/components/home/IconGrid.vue';
import ImmersiveQuran from '@/components/home/ImmersiveQuran.vue';
import SplitSection from '@/components/home/SplitSection.vue';
import AuthorityStats from '@/components/home/AuthorityStats.vue';
import TestimonialSection from '@/components/home/TestimonialSection.vue';
import BoldCTA from '@/components/home/BoldCTA.vue';

useScrollReveal();
</script>
