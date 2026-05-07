<template>
  <form
    class="space-y-5"
    novalidate
    @submit.prevent="handleSubmit"
  >
    <div>
      <label for="contact-name" class="block text-sm font-medium text-slate-900 mb-1.5">
        {{ $t('form.name') }}
      </label>
      <input
        id="contact-name"
        v-model="form.name"
        name="name"
        type="text"
        required
        autocomplete="name"
        :disabled="state === 'submitting'"
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
        :placeholder="$t('form.namePlaceholder')"
      />
    </div>

    <div>
      <label for="contact-email" class="block text-sm font-medium text-slate-900 mb-1.5">
        {{ $t('form.email') }}
      </label>
      <input
        id="contact-email"
        v-model="form.email"
        name="email"
        type="email"
        required
        autocomplete="email"
        :disabled="state === 'submitting'"
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
        :placeholder="$t('form.emailPlaceholder')"
      />
    </div>

    <div>
      <label for="contact-message" class="block text-sm font-medium text-slate-900 mb-1.5">
        {{ $t('form.message') }}
      </label>
      <textarea
        id="contact-message"
        v-model="form.message"
        name="message"
        rows="5"
        required
        :disabled="state === 'submitting'"
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 resize-y disabled:bg-slate-50 disabled:cursor-not-allowed"
        :placeholder="$t('form.messagePlaceholder')"
      ></textarea>
    </div>

    <!--
      Honeypot field. Hidden from sighted users + screen readers via
      aria-hidden + tabindex=-1 + a CSS class that takes it out of layout.
      Bots that auto-fill every input will populate it; the server then
      silently drops the submission.
    -->
    <div class="absolute -left-[9999px] top-auto w-px h-px overflow-hidden" aria-hidden="true">
      <label for="contact-company">Company (leave empty)</label>
      <input
        id="contact-company"
        v-model="form.company"
        name="company"
        type="text"
        tabindex="-1"
        autocomplete="off"
      />
    </div>

    <p class="text-xs text-slate-500 leading-relaxed text-pretty">
      {{ $t('form.disclaimer') }}
    </p>

    <button
      type="submit"
      :disabled="state === 'submitting'"
      class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold tracking-wide text-cream shadow-soft transition-all duration-200 hover:bg-primary-800 hover:shadow-soft-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      <svg
        v-if="state === 'submitting'"
        class="animate-spin size-4 -ms-1"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="60" stroke-dashoffset="20" opacity="0.5" />
      </svg>
      {{ state === 'submitting' ? $t('form.sending') : $t('form.submit') }}
    </button>

    <!--
      Inline status banners. ARIA-live so screen readers announce the
      outcome without the user having to navigate back to the button.
    -->
    <div
      v-if="state === 'success'"
      role="status"
      aria-live="polite"
      class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 text-pretty"
    >
      {{ $t('form.successMessage') }}
    </div>
    <div
      v-if="state === 'error'"
      role="alert"
      aria-live="assertive"
      class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 text-pretty"
    >
      {{ errorMessage || $t('form.errorMessage') }}
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api, ApiError } from '@/config/api';

const { locale, t } = useI18n();

const form = reactive({
  name: '',
  email: '',
  message: '',
  // Honeypot — must stay empty for real submissions.
  company: '',
});

// 'idle' | 'submitting' | 'success' | 'error'
const state = ref('idle');
const errorMessage = ref('');

async function handleSubmit() {
  if (state.value === 'submitting') return;

  state.value = 'submitting';
  errorMessage.value = '';

  try {
    await api.post('/api/contact', {
      name: form.name,
      email: form.email,
      message: form.message,
      company: form.company,
      lang: locale.value === 'ar' ? 'ar' : 'en',
    });

    state.value = 'success';
    form.name = '';
    form.email = '';
    form.message = '';
    form.company = '';
  } catch (err) {
    state.value = 'error';
    if (err instanceof ApiError && err.status === 429) {
      errorMessage.value = t('form.rateLimitMessage');
    } else if (err instanceof ApiError && err.data?.error) {
      errorMessage.value = err.data.error;
    } else {
      errorMessage.value = '';
    }
  }
}
</script>
