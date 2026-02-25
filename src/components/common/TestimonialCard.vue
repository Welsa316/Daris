<template>
  <article
    v-if="visible"
    class="rounded-2xl bg-white border border-primary/5 shadow-card p-5 text-sm text-slate-700 transition-shadow duration-300 hover:shadow-card-hover"
  >
    <div class="flex gap-1 text-gold mb-3" aria-hidden="true">
      <svg
        v-for="n in 5"
        :key="n"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
    <p class="mb-4 leading-relaxed italic text-slate-600">
      &ldquo;{{ text }}&rdquo;
    </p>
    <div>
      <p class="font-semibold text-slate-900">{{ name }}</p>
      <p v-if="detail" class="text-xs text-slate-500 mt-0.5">{{ detail }}</p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Testimonial goes here.'
  },
  name: {
    type: String,
    default: 'Student name'
  },
  detail: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  }
});
</script>
