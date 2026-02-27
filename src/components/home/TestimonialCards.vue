<template>
  <section class="bg-cream py-24 md:py-32">
    <div class="section-container">
      <div class="text-center mb-16">
        <p class="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-3">
          {{ $t('home.testimonialsEyebrow') }}
        </p>
        <h2 class="heading-display text-3xl md:text-4xl text-slate-900">
          {{ $t('home.testimonialsTitle') }}
        </h2>
      </div>

      <div class="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
        <blockquote
          v-for="(item, i) in testimonials"
          :key="i"
          class="rounded-2xl bg-cream p-8 shadow-card"
        >
          <svg class="h-6 w-6 text-gold/40 mb-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.68 11 13.2 11 15c0 1.933-1.567 3.5-3.5 3.5-1.142 0-2.176-.476-2.917-1.179zM15.583 17.321C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.68 22 13.2 22 15c0 1.933-1.567 3.5-3.5 3.5-1.142 0-2.176-.476-2.917-1.179z" />
          </svg>
          <p class="text-base text-slate-700 leading-relaxed mb-6 italic">
            "{{ $t(item.quoteKey) }}"
          </p>
          <footer class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm" aria-hidden="true">
              {{ $t(item.nameKey).charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ $t(item.nameKey) }}</p>
              <p class="text-xs text-slate-400">{{ $t(item.detailKey) }}</p>
            </div>
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
