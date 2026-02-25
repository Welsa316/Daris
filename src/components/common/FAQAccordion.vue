<template>
  <section class="space-y-3">
    <div
      v-for="(item, index) in items"
      :key="item.question"
      class="rounded-xl border border-primary/5 bg-white overflow-hidden transition-shadow duration-200"
      :class="openIndex === index ? 'shadow-soft' : ''"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left group"
        :aria-expanded="openIndex === index ? 'true' : 'false'"
        @click="toggle(index)"
      >
        <span class="text-sm sm:text-base font-medium text-slate-900 leading-snug">
          {{ item.question }}
        </span>
        <span
          class="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200"
          :class="openIndex === index ? 'bg-primary text-cream rotate-180' : 'bg-primary/5 text-primary'"
          aria-hidden="true"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      <transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="openIndex === index" class="overflow-hidden">
          <p class="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
            {{ item.answer }}
          </p>
        </div>
      </transition>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

const openIndex = ref(0);

const toggle = (index) => {
  openIndex.value = openIndex.value === index ? -1 : index;
};
</script>
