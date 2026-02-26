<template>
  <a
    v-if="asLink"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="[baseClasses, variantClasses]"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    :to="to"
    :class="[baseClasses, variantClasses]"
  >
    <slot />
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  asLink: { type: Boolean, default: false },
  href: { type: String, default: undefined },
  to: { type: [String, Object], default: '/' },
  external: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'outline', 'cream', 'gold'].includes(v)
  }
});

const baseClasses =
  'inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return 'border border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 focus-visible:ring-primary';
    case 'cream':
      return 'bg-cream text-primary shadow-soft hover:bg-cream-50 hover:shadow-soft-md focus-visible:ring-cream';
    case 'gold':
      return 'bg-gold text-primary-950 shadow-soft hover:bg-gold-300 hover:shadow-soft-md focus-visible:ring-gold';
    default:
      return 'bg-primary text-cream shadow-soft hover:bg-primary-800 hover:shadow-soft-md focus-visible:ring-primary';
  }
});
</script>
