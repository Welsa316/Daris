<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img src="/images/daris-icon.png" alt="Daris" class="h-14 mx-auto mb-4" />
        </RouterLink>
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.forgotPasswordTitle') }}</h1>
        <p class="text-slate-500 mt-1">{{ $t('auth.forgotPasswordSubtitle') }}</p>
      </div>

      <form v-if="!sent" @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.email') }}</label>
          <input id="email" v-model="email" type="email" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>

        <button type="submit" :disabled="submitting" class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50">
          {{ submitting ? '...' : $t('auth.sendResetLink') }}
        </button>

        <p class="text-center text-sm text-slate-500">
          <RouterLink to="/login" class="text-primary font-medium hover:text-primary-800 transition">
            {{ $t('auth.backToLogin') }}
          </RouterLink>
        </p>
      </form>

      <div v-else class="bg-white rounded-2xl shadow-card p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.resetEmailSentTitle') }}</h2>
        <p class="text-slate-500">{{ $t('auth.resetEmailSentText') }}</p>
        <RouterLink to="/login" class="inline-block mt-6 text-primary font-medium hover:text-primary-800 transition">
          {{ $t('auth.backToLogin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth.js';

const { forgotPassword } = useAuth();
const email = ref('');
const sent = ref(false);
const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;
  try {
    await forgotPassword(email.value);
  } catch {
    // Always show success to not reveal email existence
  }
  sent.value = true;
  submitting.value = false;
}
</script>
