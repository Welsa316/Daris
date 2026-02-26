<template>
  <article
    class="group relative flex flex-col rounded-2xl bg-white shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
  >
    <!-- Visual header band -->
    <div class="relative h-32 bg-gradient-to-br from-primary via-primary-800 to-primary-950 flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 hero-pattern opacity-40" aria-hidden="true"></div>
      <div class="relative flex flex-col items-center gap-2">
        <span
          class="h-12 w-12 rounded-xl bg-cream/15 backdrop-blur-sm flex items-center justify-center text-cream/90"
          aria-hidden="true"
        >
          <slot name="icon">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </slot>
        </span>
        <h3 class="text-lg font-semibold text-cream">{{ title }}</h3>
      </div>
    </div>

    <div class="p-6 flex-1 flex flex-col">
      <p class="text-xs font-medium uppercase tracking-[0.16em] text-gold mb-4">
        {{ tag }}
      </p>

      <ul v-if="bullets && bullets.length" class="space-y-2.5 text-sm text-slate-600 mb-5 flex-1">
        <li v-for="item in bullets" :key="item" class="flex gap-2.5 items-start">
          <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold/60 flex-shrink-0" aria-hidden="true"></span>
          <span class="leading-relaxed">{{ item }}</span>
        </li>
      </ul>

      <p v-if="note" class="text-xs text-slate-400 leading-relaxed pt-4 border-t border-slate-100">
        {{ note }}
      </p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  tag: { type: String, default: '' },
  description: { type: String, default: '' },
  bullets: { type: Array, default: () => [] },
  note: { type: String, default: '' }
});
</script>
