<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.changePassword') }}</h1>
      </div>

      <form @submit.prevent="handleChange" class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ error }}</div>
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{{ success }}</div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.currentPassword') }}</label>
          <input v-model="form.currentPassword" type="password" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.newPassword') }}</label>
          <input v-model="form.newPassword" type="password" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          <PasswordStrength :password="form.newPassword" />
        </div>

        <button type="submit" :disabled="submitting" class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50">
          {{ submitting ? '...' : $t('auth.changePasswordBtn') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';

const { changePassword } = useAuth();
const form = reactive({ currentPassword: '', newPassword: '' });
const error = ref('');
const success = ref('');
const submitting = ref(false);

async function handleChange() {
  error.value = '';
  success.value = '';
  submitting.value = true;
  try {
    const data = await changePassword(form.currentPassword, form.newPassword);
    success.value = data.message;
  } catch (err) {
    error.value = err.data?.error || err.message;
  } finally {
    submitting.value = false;
  }
}
</script>
