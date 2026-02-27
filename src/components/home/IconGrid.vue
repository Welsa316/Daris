<template>
  <section class="bg-white py-24 md:py-36">
    <div class="section-wide">
      <div class="grid md:grid-cols-3 gap-0">
        <div
          v-for="(item, i) in items"
          :key="item.titleKey"
          class="group relative px-8 md:px-12 py-10 md:py-0 transition-transform duration-300 hover:-translate-y-1"
          :class="i < items.length - 1 ? 'md:border-r md:rtl:border-r-0 md:rtl:border-l border-slate-200/60' : ''"
          data-reveal
          :data-reveal-delay="i * 100"
        >
          <!-- Gold accent line -->
          <div class="w-8 h-[2px] bg-gold/50 mb-8" aria-hidden="true"></div>
          <div
            class="mb-5 text-primary transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
            v-html="item.icon"
          ></div>
          <h3 class="heading-display text-xl text-slate-900 mb-3">
            {{ $t(item.titleKey) }}
          </h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            {{ $t(item.bodyKey) }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    titleKey: 'home.quranTitle',
    bodyKey: 'home.quranDesc',
    icon: '<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>'
  },
  {
    titleKey: 'home.arabicTitle',
    bodyKey: 'home.arabicDesc',
    icon: '<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>'
  },
  {
    titleKey: 'home.fiqhTitle',
    bodyKey: 'home.fiqhDesc',
    icon: '<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>'
  }
];
</script>
