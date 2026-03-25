<template>
  <section class="relative overflow-hidden bg-cream py-12 md:py-16">
    <!-- Islamic geometric pattern overlay -->
    <div
      class="absolute inset-0 opacity-[0.06]"
      :style="patternStyle"
      aria-hidden="true"
    ></div>

    <div class="relative z-10 section-wide">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Label -->
        <p
          class="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary-700/50 mb-4"
          data-reveal
        >
          {{ $t('home.countriesLabel') }}
        </p>

        <!-- Countries list -->
        <p
          class="font-display text-lg sm:text-xl md:text-2xl text-primary-950/70 leading-relaxed"
          dir="rtl"
          lang="ar"
          data-reveal
          data-reveal-delay="100"
        >
          {{ $t('home.countriesList') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const patternSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%231F4D3A' stroke-width='0.5'><polygon points='40,8 46.5,26 64,18 53.5,33.5 72,40 53.5,46.5 64,62 46.5,54 40,72 33.5,54 16,62 26.5,46.5 8,40 26.5,33.5 16,18 33.5,26'/><polygon points='40,20 50,26.5 56,40 50,53.5 40,60 30,53.5 24,40 30,26.5'/></g></svg>`;

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
  backgroundSize: '80px 80px',
  backgroundRepeat: 'repeat'
};
</script>
