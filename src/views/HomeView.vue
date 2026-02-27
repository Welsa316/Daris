<template>
  <div>
    <!-- 1. Immersive Hero — cinematic, left-aligned, dramatic -->
    <ImmersiveHero />

    <!-- 2. Icon Grid — minimal, hairline-divided columns -->
    <IconGrid />

    <!-- 3. Split: Quran — warm gradient left, text right -->
    <SplitSection
      eyebrowKey="home.splitQuranEyebrow"
      titleKey="home.splitQuranTitle"
      bodyKey="home.splitQuranBody"
      surface="warm"
    />

    <!-- 4. Split: Arabic — reversed, light gradient right, text left -->
    <SplitSection
      eyebrowKey="home.splitArabicEyebrow"
      titleKey="home.splitArabicTitle"
      bodyKey="home.splitArabicBody"
      :reversed="true"
      surface="light"
    />

    <!-- 5. Split: Fiqh — deep gradient left, tinted text right -->
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

    <!-- 8. Bold CTA — near-black, oversized type, dramatic whitespace -->
    <BoldCTA />
  </div>
</template>

<script setup>
import ImmersiveHero from '@/components/home/ImmersiveHero.vue';
import IconGrid from '@/components/home/IconGrid.vue';
import SplitSection from '@/components/home/SplitSection.vue';
import AuthorityStats from '@/components/home/AuthorityStats.vue';
import TestimonialSection from '@/components/home/TestimonialSection.vue';
import BoldCTA from '@/components/home/BoldCTA.vue';
</script>
