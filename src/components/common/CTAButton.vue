<template>
  <a
    v-if="asLink"
    :href="href"
    :target="external ? '_blank' : undefined"
    rel="noopener noreferrer"
    class="inline-flex items-center justify-center rounded-full border border-transparent bg-primary px-5 py-2 text-sm font-semibold tracking-wide text-cream shadow-soft-lg hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    :to="to"
    class="inline-flex items-center justify-center rounded-full border border-transparent bg-primary px-5 py-2 text-sm font-semibold tracking-wide text-cream shadow-soft-lg hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
  >
    <slot />
  </RouterLink>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  asLink: {
    type: Boolean,
    default: false
  },
  href: {
    type: String,
    default: undefined
  },
  to: {
    type: [String, Object],
    default: '/'
  },
  external: {
    type: Boolean,
    default: false
  }
});
</script>

