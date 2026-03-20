<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img src="/images/daris-icon.png" alt="Daris" class="h-14 mx-auto mb-4" />
        </RouterLink>
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.resetPasswordTitle') }}</h1>
      </div>

      <form v-if="!success" @submit.prevent="handleReset" class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ error }}</div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.newPassword') }}</label>
          <input id="password" v-model="password" type="password" required autocomplete="new-password" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          <PasswordStrength :password="password" />
        </div>

        <button type="submit" :disabled="submitting" class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50">
          {{ submitting ? '...' : $t('auth.resetPasswordBtn') }}
        </button>
      </form>

      <div v-else class="bg-white rounded-2xl shadow-card p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.passwordResetDone') }}</h2>
        <RouterLink to="/login" class="inline-block mt-4 bg-primary text-cream font-semibold px-8 py-2.5 rounded-full hover:bg-primary-800 transition">
          {{ $t('auth.goToLogin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';

const route = useRoute();
const { resetPassword } = useAuth();

const password = ref('');
const error = ref('');
const success = ref(false);
const submitting = ref(false);

async function handleReset() {
  error.value = '';
  submitting.value = true;
  try {
    await resetPassword(route.query.token, password.value);
    success.value = true;
  } catch (err) {
    error.value = err.data?.error || err.message;
  } finally {
    submitting.value = false;
  }
}
</script>
