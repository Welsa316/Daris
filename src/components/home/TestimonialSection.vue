<template>
  <section class="bg-cream-50 py-24 md:py-36">
    <div class="section-wide">
      <!-- Eyebrow + heading — left aligned -->
      <div class="mb-16 md:mb-20 max-w-lg">
        <p class="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold mb-3">
          {{ $t('home.testimonialsEyebrow') }}
        </p>
        <h2 class="heading-display text-3xl md:text-4xl text-slate-900">
          {{ $t('home.testimonialsTitle') }}
        </h2>
      </div>

      <!-- Editorial quotes — separated by vertical hairlines -->
      <div class="grid md:grid-cols-3 gap-0">
        <blockquote
          v-for="(item, i) in testimonials"
          :key="i"
          class="relative px-8 md:px-10 py-8 md:py-0"
          :class="i < testimonials.length - 1 ? 'md:border-r md:rtl:border-r-0 md:rtl:border-l border-slate-200/60' : ''"
        >
          <!-- Decorative quote mark -->
          <svg class="h-8 w-8 text-gold/25 mb-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.68 11 13.2 11 15c0 1.933-1.567 3.5-3.5 3.5-1.142 0-2.176-.476-2.917-1.179zM15.583 17.321C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.68 22 13.2 22 15c0 1.933-1.567 3.5-3.5 3.5-1.142 0-2.176-.476-2.917-1.179z" />
          </svg>

          <p class="font-display text-lg md:text-xl text-slate-800 leading-relaxed mb-8 italic">
            {{ $t(item.quoteKey) }}
          </p>

          <footer>
            <p class="text-sm font-semibold text-slate-900">{{ $t(item.nameKey) }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ $t(item.detailKey) }}</p>
          </footer>
        </blockquote>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = [
  {
    quoteKey: 'home.testimonial1Quote',
    nameKey: 'home.testimonial1Name',
    detailKey: 'home.testimonial1Detail'
  },
  {
    quoteKey: 'home.testimonial2Quote',
    nameKey: 'home.testimonial2Name',
    detailKey: 'home.testimonial2Detail'
  },
  {
    quoteKey: 'home.testimonial3Quote',
    nameKey: 'home.testimonial3Name',
    detailKey: 'home.testimonial3Detail'
  }
];
</script>
