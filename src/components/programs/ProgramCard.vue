<template>
  <article
    class="group flex flex-col rounded-2xl bg-white border border-primary/5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
  >
    <!-- Gold accent top bar -->
    <div class="h-1 w-full rounded-t-2xl bg-gradient-to-r from-gold/40 via-gold/60 to-gold/40"></div>

    <div class="p-6 flex-1 flex flex-col">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 class="text-lg font-semibold text-slate-900 mb-1">
            {{ title }}
          </h3>
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-gold">
            {{ tag }}
          </p>
        </div>
        <!-- Icon -->
        <span
          class="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-cream"
          aria-hidden="true"
        >
          <slot name="icon">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </slot>
        </span>
      </div>

      <p class="text-sm text-slate-600 mb-4 leading-relaxed">
        {{ description }}
      </p>

      <ul v-if="bullets && bullets.length" class="space-y-2 text-sm text-slate-700 mb-5">
        <li v-for="item in bullets" :key="item" class="flex gap-2.5">
          <span
            class="mt-2 h-1 w-4 rounded-full bg-gold/70 flex-shrink-0"
            aria-hidden="true"
          ></span>
          <span class="leading-relaxed">{{ item }}</span>
        </li>
      </ul>

      <p v-if="note" class="mt-auto text-xs text-slate-500 leading-relaxed pt-3 border-t border-primary/5">
        {{ note }}
      </p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  bullets: {
    type: Array,
    default: () => []
  },
  note: {
    type: String,
    default: ''
  }
});
</script>
