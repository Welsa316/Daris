<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state.open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="cancel"
        @keydown.esc.stop="cancel"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          @click.stop
        >
          <h2 :id="titleId" class="text-lg font-bold text-primary mb-2">
            {{ state.title }}
          </h2>

          <p class="text-sm text-slate-600 whitespace-pre-wrap mb-4">
            {{ state.message }}
          </p>

          <!-- Optional freeform input ("prompt" mode) -->
          <textarea
            v-if="state.mode === 'prompt'"
            ref="inputEl"
            v-model="state.inputValue"
            :placeholder="state.placeholder"
            rows="3"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none mb-4"
          ></textarea>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="cancel"
              class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-full transition"
            >
              {{ state.cancelLabel }}
            </button>
            <button
              type="button"
              @click="confirm"
              class="px-5 py-2 text-sm font-semibold rounded-full transition"
              :class="state.danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-cream hover:bg-primary-800'"
            >
              {{ state.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, ref, nextTick, onBeforeUnmount } from 'vue';
import { confirmDialogBus } from '@/composables/useConfirmDialog.js';

const titleId = `cd-title-${Math.random().toString(36).slice(2, 9)}`;
const inputEl = ref(null);

const state = reactive({
  open: false,
  mode: 'confirm', // 'confirm' | 'prompt'
  title: '',
  message: '',
  placeholder: '',
  inputValue: '',
  confirmLabel: '',
  cancelLabel: '',
  danger: false,
  resolver: null,
});

function cancel() {
  if (!state.open) return;
  const resolver = state.resolver;
  state.open = false;
  if (resolver) resolver(state.mode === 'prompt' ? null : false);
}

function confirm() {
  if (!state.open) return;
  const resolver = state.resolver;
  state.open = false;
  if (resolver) {
    resolver(state.mode === 'prompt' ? state.inputValue : true);
  }
}

confirmDialogBus.open = (opts) =>
  new Promise((resolve) => {
    Object.assign(state, {
      open: true,
      mode: opts.mode || 'confirm',
      title: opts.title || '',
      message: opts.message || '',
      placeholder: opts.placeholder || '',
      inputValue: opts.defaultValue || '',
      confirmLabel: opts.confirmLabel || 'OK',
      cancelLabel: opts.cancelLabel || 'Cancel',
      danger: !!opts.danger,
      resolver: resolve,
    });
    if (state.mode === 'prompt') {
      nextTick(() => inputEl.value?.focus());
    }
  });

onBeforeUnmount(() => {
  // If component unmounts while a dialog is open, resolve the pending promise
  // so awaiters don't hang.
  if (state.open && state.resolver) {
    state.resolver(state.mode === 'prompt' ? null : false);
    state.open = false;
  }
  delete confirmDialogBus.open;
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
