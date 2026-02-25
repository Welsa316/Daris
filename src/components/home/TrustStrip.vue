<template>
  <section class="border-y border-emerald-900/5 bg-primary/5">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs sm:text-sm">
      <div v-for="item in items" :key="item.title" class="flex items-start gap-2">
        <div class="mt-0.5 text-primary" aria-hidden="true">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 7L10 17L4 11"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-slate-900">{{ item.title }}</p>
          <p class="text-slate-700">{{ item.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const items = [
  {
    title: 'Personalised study plan',
    body: 'Lessons shaped around your level, goals, and pace.'
  },
  {
    title: 'Qualified instruction',
    body: 'Grounded teaching with attention to tajwid and sound understanding.'
  },
  {
    title: 'Online, worldwide',
    body: 'Learn from wherever you are with stable, video-based lessons.'
  },
  {
    title: 'English support',
    body: 'English-speaking assistance is available through our team.'
  }
];
</script>

