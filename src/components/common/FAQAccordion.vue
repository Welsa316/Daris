<template>
  <section>
    <div
      v-for="(item, index) in items"
      :key="item.question"
      class="border border-emerald-900/5 bg-white rounded-xl mb-3 overflow-hidden"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 text-left"
        :aria-expanded="openIndex === index ? 'true' : 'false'"
        @click="toggle(index)"
      >
        <span class="text-sm sm:text-base font-medium text-slate-900">
          {{ item.question }}
        </span>
        <span class="ml-3 text-primary" aria-hidden="true">
          <svg v-if="openIndex === index" class="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M6 15L12 9L18 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
      <div v-if="openIndex === index" class="px-4 sm:px-5 pb-4 text-sm text-slate-700">
        <p>{{ item.answer }}</p>
      </div>
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

