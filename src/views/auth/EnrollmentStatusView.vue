<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-card p-8 text-center">
        <div v-if="loading" class="animate-pulse">
          <div class="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4"></div>
          <div class="h-4 bg-slate-100 rounded mx-auto w-48 mb-2"></div>
        </div>

        <template v-else>
          <!-- Pending Review -->
          <div v-if="status === 'pending_review'">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.pendingReviewTitle') }}</h2>
            <p class="text-slate-500">{{ $t('auth.pendingReviewText') }}</p>
          </div>

          <!-- Pending Email Verification -->
          <div v-else-if="status === 'pending_verification'">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.verifyEmailTitle') }}</h2>
            <p class="text-slate-500">{{ $t('auth.verifyEmailText') }}</p>
          </div>

          <!-- Rejected -->
          <div v-else-if="status === 'rejected'">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.rejectedTitle') }}</h2>
            <p class="text-slate-500">{{ $t('auth.rejectedText') }}</p>
          </div>

          <!-- Enrolled (redirect to dashboard) -->
          <div v-else-if="status === 'enrolled'">
            <p class="text-slate-500">{{ $t('auth.redirectingDashboard') }}</p>
          </div>

          <button @click="handleLogout" class="mt-6 text-sm text-slate-400 hover:text-primary transition">
            {{ $t('auth.logout') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';

const router = useRouter();
const { logout } = useAuth();

const loading = ref(true);
const status = ref('');

async function handleLogout() {
  await logout();
}

onMounted(async () => {
  try {
    const data = await api.get('/api/student/enrollment-status');
    status.value = data.status;

    if (data.status === 'enrolled') {
      router.push('/dashboard');
    }
  } catch {
    router.push('/login');
  } finally {
    loading.value = false;
  }
});
</script>
