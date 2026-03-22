<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-display font-bold text-primary">
            {{ $t('dashboard.welcome', { name: dashboard?.student?.firstName }) }}
          </h1>
          <p class="text-slate-500 text-sm mt-1">
            <span class="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {{ $t('dashboard.active') }}
            </span>
          </p>
        </div>
        <button @click="handleLogout" class="text-sm text-slate-400 hover:text-primary transition">{{ $t('auth.logout') }}</button>
      </div>

      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl shadow-card p-6 animate-pulse">
          <div class="h-4 bg-slate-100 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-slate-100 rounded w-2/3"></div>
        </div>
      </div>

      <template v-else>
        <!-- Announcements -->
        <div v-if="dashboard?.announcements?.length" class="mb-6">
          <div v-for="a in dashboard.announcements" :key="a.id" class="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-3">
            <h3 class="font-semibold text-amber-800">{{ isAr ? (a.titleAr || a.title) : a.title }}</h3>
            <p class="text-amber-700 text-sm mt-1">{{ isAr ? (a.contentAr || a.content) : a.content }}</p>
          </div>
        </div>

        <!-- Upcoming Classes -->
        <div class="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('dashboard.upcomingClasses') }}</h2>
          <div v-if="!dashboard?.upcomingClasses?.length" class="text-slate-400 text-sm py-4 text-center">
            {{ $t('dashboard.noUpcoming') }}
          </div>
          <div v-else class="space-y-3">
            <div v-for="cls in dashboard.upcomingClasses" :key="cls.id" class="border border-slate-100 rounded-xl p-4 hover:border-primary/20 transition">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-primary">{{ isAr ? (cls.titleAr || cls.title) : cls.title }}
                    <span v-if="cls.rescheduled" class="text-amber-600 text-xs">({{ $t('admin.rescheduled') }})</span>
                  </h3>
                  <p class="text-sm text-slate-500 mt-1">{{ formatDate(cls.startTime) }} - {{ formatTime(cls.endTime) }}</p>
                  <p v-if="cls.rescheduled && cls.originalStartTime" class="text-xs text-slate-400 mt-0.5 line-through">{{ $t('admin.originalTime') }}: {{ formatDate(cls.originalStartTime) }}</p>
                  <p v-if="cls.description" class="text-sm text-slate-400 mt-1">{{ isAr ? (cls.descriptionAr || cls.description) : cls.description }}</p>
                </div>
                <a v-if="cls.meetingLink" :href="cls.meetingLink" target="_blank" rel="noopener" class="shrink-0 bg-primary text-cream text-sm font-medium px-4 py-2 rounded-full hover:bg-primary-800 transition">
                  {{ $t('dashboard.joinClass') }}
                </a>
                <span v-else-if="cls.meetingLinkAvailableIn" class="shrink-0 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                  {{ $t('dashboard.linkAvailableIn', { minutes: cls.meetingLinkAvailableIn }) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Classes -->
        <div class="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('dashboard.classHistory') }}</h2>
          <div v-if="!dashboard?.pastClasses?.length" class="text-slate-400 text-sm py-4 text-center">
            {{ $t('dashboard.noPast') }}
          </div>
          <div v-else class="space-y-2">
            <div v-for="cls in dashboard.pastClasses" :key="cls.id" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span class="text-sm text-slate-600">{{ isAr ? (cls.titleAr || cls.title) : cls.title }}</span>
              <span class="text-xs text-slate-400">{{ formatDate(cls.startTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Profile -->
        <div class="bg-white rounded-2xl shadow-card p-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('dashboard.profile') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span class="text-slate-400">{{ $t('auth.email') }}:</span> <span class="text-slate-700 ltr:ml-2 rtl:mr-2">{{ user?.email }}</span></div>
            <div><span class="text-slate-400">{{ $t('auth.country') }}:</span> <span class="text-slate-700 ltr:ml-2 rtl:mr-2">{{ user?.country }}</span></div>
          </div>
          <div class="mt-4 flex gap-3">
            <RouterLink to="/change-password" class="text-sm text-primary hover:text-primary-800 transition font-medium">
              {{ $t('auth.changePassword') }}
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';

const { locale } = useI18n();
const { user, logout } = useAuth();
const isAr = computed(() => locale.value === 'ar');

const dashboard = ref(null);
const loading = ref(true);

async function handleLogout() { await logout(); }

function formatDate(date) {
  return new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

onMounted(async () => {
  try {
    dashboard.value = await api.get('/api/student/dashboard');
  } catch (err) {
    console.error('Failed to load dashboard:', err.message);
  } finally {
    loading.value = false;
  }
});
</script>
