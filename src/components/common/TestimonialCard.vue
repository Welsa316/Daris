<template>
  <article
    v-if="visible"
    class="rounded-2xl bg-white border border-emerald-900/5 shadow-soft-lg p-5 text-sm text-slate-700"
  >
    <p class="mb-3">
      “{{ text }}”
    </p>
    <p class="font-semibold text-slate-900">
      {{ name }}
    </p>
    <p class="text-xs text-slate-500">
      {{ detail }}
    </p>
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

