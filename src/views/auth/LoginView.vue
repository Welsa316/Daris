<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img src="/images/daris-icon.png" alt="Daris" class="h-14 mx-auto mb-4" />
        </RouterLink>
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.loginTitle') }}</h1>
        <p class="text-slate-500 mt-1">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <form @submit.prevent="handleLogin" class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.email') }}</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            :placeholder="$t('auth.emailPlaceholder')"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.password') }}</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
            :placeholder="$t('auth.passwordPlaceholder')"
          />
        </div>

        <div class="flex items-center justify-end">
          <RouterLink to="/forgot-password" class="text-sm text-primary hover:text-primary-800 transition">
            {{ $t('auth.forgotPassword') }}
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? $t('auth.loggingIn') : $t('auth.loginBtn') }}
        </button>

        <p class="text-center text-sm text-slate-500">
          {{ $t('auth.noAccount') }}
          <RouterLink to="/register" class="text-primary font-medium hover:text-primary-800 transition">
            {{ $t('auth.registerLink') }}
          </RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const router = useRouter();
const { login, isAdmin } = useAuth();

const form = reactive({ email: '', password: '' });
const error = ref('');
const submitting = ref(false);

async function handleLogin() {
  error.value = '';
  submitting.value = true;

  try {
    const data = await login(form.email, form.password);
    if (data.user.role === 'admin') {
      router.push('/admin');
    } else if (data.user.role === 'enrolled_student') {
      router.push('/dashboard');
    } else {
      router.push('/enrollment-status');
    }
  } catch (err) {
    error.value = err.data?.error || err.message;
  } finally {
    submitting.value = false;
  }
}
</script>
