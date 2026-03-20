<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-card p-8 text-center">
        <div v-if="loading" class="animate-pulse">
          <div class="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4"></div>
          <p class="text-slate-500">{{ $t('auth.verifyingEmail') }}</p>
        </div>

        <div v-else-if="success">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.emailVerifiedTitle') }}</h2>
          <p class="text-slate-500 mb-6">{{ $t('auth.emailVerifiedText') }}</p>
          <RouterLink to="/login" class="inline-block bg-primary text-cream font-semibold px-8 py-2.5 rounded-full hover:bg-primary-800 transition">
            {{ $t('auth.goToLogin') }}
          </RouterLink>
        </div>

        <div v-else>
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.verificationFailedTitle') }}</h2>
          <p class="text-slate-500">{{ error }}</p>
          <RouterLink to="/login" class="inline-block mt-6 text-primary font-medium hover:text-primary-800 transition">
            {{ $t('auth.backToLogin') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';

const route = useRoute();
const { verifyEmail } = useAuth();

const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  const token = route.query.token;
  if (!token) {
    error.value = 'No verification token provided.';
    loading.value = false;
    return;
  }

  try {
    await verifyEmail(token);
    success.value = true;
  } catch (err) {
    error.value = err.data?.error || err.message;
  } finally {
    loading.value = false;
  }
});
</script>
