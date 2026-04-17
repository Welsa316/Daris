<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="undoToastState.visible"
        class="fixed bottom-6 ltr:left-1/2 rtl:right-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2 z-[90] bg-slate-900 text-white text-sm shadow-xl rounded-full flex items-center gap-3 py-2 ps-5 pe-2"
        role="status"
      >
        <span>{{ undoToastState.label }}</span>
        <button
          v-if="undoToastState.undoLabel"
          @click="undoPending"
          class="px-3 py-1 rounded-full bg-amber-400 text-slate-900 font-semibold text-xs hover:bg-amber-300 transition"
        >
          {{ undoToastState.undoLabel }}
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount } from 'vue';
import { undoToastState, undoPending, flushPendingUndo } from '@/composables/useUndoToast.js';

// Make sure an undone action can't linger after the user navigates away.
onBeforeUnmount(() => {
  flushPendingUndo();
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(var(--tw-translate-x), 1rem);
}
</style>
