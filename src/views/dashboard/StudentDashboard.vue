<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-3xl mx-auto">
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
          <!-- Teacher line. Renders explicit TeacherStudent assignments
               or falls back to the sheikh (admin) when no one is
               explicitly assigned. Always shows for active students so
               the relationship is visible. -->
          <p
            v-if="dashboard?.teachers?.length"
            class="text-xs text-slate-500 mt-2 tabular-nums"
          >
            {{ $t('dashboard.yourTeacher', { count: dashboard.teachers.length }) }}
            <span class="font-medium text-primary">{{ teacherNames }}</span>
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

        <!-- Hero card: the very next class. Big, prominent, no clutter. -->
        <div v-if="nextClass" class="bg-white rounded-2xl shadow-card p-6 mb-6 border-l-4 border-gold">
          <p class="text-xs font-semibold tracking-[0.15em] uppercase text-gold/80 mb-3">
            {{ $t('dashboard.nextClass') }}
          </p>
          <h2 class="text-xl font-display font-bold text-primary">
            {{ isAr ? (nextClass.titleAr || nextClass.title) : nextClass.title }}
            <span v-if="nextClass.rescheduled" class="text-amber-600 text-xs font-medium">({{ $t('admin.rescheduled') }})</span>
          </h2>
          <p class="text-slate-600 mt-1">
            {{ relativeWhen(nextClass) }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ formatClassTime(nextClass) }}
            <span v-if="viewerTimezoneDiffers(nextClass)">
              · {{ $t('dashboard.yourTime') }}: {{ formatInViewerTz(nextClass) }}
            </span>
          </p>

          <div class="mt-5">
            <button
              v-if="nextClass.canJoin"
              @click="joinClass(nextClass.id)"
              class="bg-primary text-cream text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-800 transition"
            >
              {{ $t('dashboard.joinClass') }}
            </button>
            <p v-else class="text-xs text-slate-400">
              {{ $t('dashboard.linkOpensBefore') }}
            </p>
          </div>
        </div>

        <!-- Rest of the upcoming schedule: compact rows, collapsed by default -->
        <div v-if="laterClasses.length" class="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {{ $t('dashboard.comingUp') }}
            </h2>
            <button
              v-if="dashboard.upcomingClasses.length > 4"
              @click="showAllUpcoming = !showAllUpcoming"
              class="text-xs text-primary hover:text-primary-800 underline"
            >
              {{ showAllUpcoming ? $t('dashboard.showLess') : $t('dashboard.showAll') }}
            </button>
          </div>
          <ul class="divide-y divide-slate-100">
            <li
              v-for="cls in (showAllUpcoming ? laterClasses : laterClasses.slice(0, 3))"
              :key="cls.id"
              class="py-3 flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <p class="text-sm font-medium text-primary truncate">
                  {{ isAr ? (cls.titleAr || cls.title) : cls.title }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">{{ formatClassTime(cls) }}</p>
              </div>
              <button
                v-if="cls.canJoin"
                @click="joinClass(cls.id)"
                class="shrink-0 bg-primary text-cream text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary-800 transition"
              >
                {{ $t('dashboard.joinClass') }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Nothing on the schedule at all -->
        <div v-if="!nextClass && !laterClasses.length" class="bg-white rounded-2xl shadow-card p-10 text-center mb-6">
          <p class="text-slate-400 text-sm">{{ $t('dashboard.noUpcoming') }}</p>
        </div>

        <!-- Past classes. collapsed, opt-in -->
        <details v-if="dashboard?.pastClasses?.length" class="bg-white rounded-2xl shadow-card p-6 mb-6">
          <summary class="cursor-pointer list-none flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {{ $t('dashboard.classHistory') }}
            </h2>
            <span class="text-xs text-slate-400">{{ dashboard.pastClasses.length }}</span>
          </summary>
          <ul class="mt-4 divide-y divide-slate-100">
            <li v-for="cls in dashboard.pastClasses" :key="cls.id" class="py-2 flex items-center justify-between text-sm">
              <span class="text-slate-600">{{ isAr ? (cls.titleAr || cls.title) : cls.title }}</span>
              <span class="text-xs text-slate-400">{{ formatClassTime(cls) }}</span>
            </li>
          </ul>
        </details>

        <!-- Profile. minimal -->
        <details class="bg-white rounded-2xl shadow-card p-6">
          <summary class="cursor-pointer list-none flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {{ $t('dashboard.profile') }}
            </h2>
            <span class="text-slate-300">›</span>
          </summary>
          <div class="mt-4 space-y-2 text-sm">
            <div><span class="text-slate-400">{{ $t('auth.email') }}:</span> <span class="text-slate-700 ms-2">{{ user?.email }}</span></div>
            <div><span class="text-slate-400">{{ $t('auth.country') }}:</span> <span class="text-slate-700 ms-2">{{ user?.country }}</span></div>
            <RouterLink to="/change-password" class="inline-block mt-2 text-sm text-primary hover:text-primary-800 transition font-medium">
              {{ $t('auth.changePassword') }}
            </RouterLink>
          </div>
        </details>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';

const { locale, t } = useI18n();
const { user, logout } = useAuth();
const isAr = computed(() => locale.value === 'ar');

const dashboard = ref(null);
const loading = ref(true);
const showAllUpcoming = ref(false);

// The first non-cancelled upcoming class gets the hero slot. Everything
// after it gets collapsed into the compact list below.
const nextClass = computed(() => {
  const list = dashboard.value?.upcomingClasses || [];
  return list.find((c) => !c.cancelled) || null;
});
const laterClasses = computed(() => {
  const list = dashboard.value?.upcomingClasses || [];
  return list.filter((c) => c.id !== nextClass.value?.id && !c.cancelled);
});

// Full names of the student's teachers, joined for the header line.
// One teacher: "Sheikh Islam". Two: "Sheikh Islam + Bob Smith".
// Three+: "Sheikh Islam, Bob Smith + 1 more" to keep the header from
// wrapping. lastName is included so the sheikh shows up as the actual
// honorific-first-name pairing he's known by, not a bare "Sheikh".
const teacherNames = computed(() => {
  const list = dashboard.value?.teachers || [];
  if (list.length === 0) return '';
  const names = list
    .map((t) => `${t.firstName || ''} ${t.lastName || ''}`.trim())
    .filter(Boolean);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} + ${names[1]}`;
  return `${names.slice(0, 2).join(', ')} + ${names.length - 2}`;
});

async function handleLogout() { await logout(); }

// Viewer's resolved browser timezone, used only to decide whether we should
// ALSO show the time in the viewer's local zone (for students scheduled in
// a TZ different from where they're currently viewing).
const viewerTz = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return 'UTC'; }
})();

function viewerTimezoneDiffers(cls) {
  return cls.timezone && cls.timezone !== viewerTz;
}

// Primary time display: in the class's own timezone (that's the time the
// sheikh teaches in, so it's the shared source of truth).
function formatClassTime(cls) {
  const tz = cls.timezone || 'Africa/Cairo';
  const localeTag = isAr.value ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(cls.startTime)) + ` (${tz.split('/').pop().replace('_', ' ')})`;
}

function formatInViewerTz(cls) {
  const localeTag = isAr.value ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    timeZone: viewerTz,
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(cls.startTime));
}

// Human-friendly "when" for the hero card: "Live now", "Starts in 12 min",
// "Today at 1:00 PM", "Tomorrow at 1:00 PM", or "Mon Apr 21 at 1:00 PM".
function relativeWhen(cls) {
  const now = Date.now();
  const start = new Date(cls.startTime).getTime();
  const end = new Date(cls.endTime).getTime();
  if (now >= start && now <= end) return t('dashboard.liveNow');
  if (now > end) return t('dashboard.ended');

  const diffMin = Math.round((start - now) / 60_000);
  if (diffMin <= 60) {
    return t('dashboard.startsInMin').replace('{n}', diffMin);
  }

  const tz = cls.timezone || 'Africa/Cairo';
  const localeTag = isAr.value ? 'ar-EG' : 'en-US';
  const zonedDate = (ms) => new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(ms));
  const timeStr = new Intl.DateTimeFormat(localeTag, {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(start));

  if (zonedDate(start) === zonedDate(now)) {
    return t('dashboard.todayAt').replace('{time}', timeStr);
  }
  if (zonedDate(start) === zonedDate(now + 86400000)) {
    return t('dashboard.tomorrowAt').replace('{time}', timeStr);
  }

  const dateStr = new Intl.DateTimeFormat(localeTag, {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric',
  }).format(new Date(start));
  return t('dashboard.onDateAt').replace('{date}', dateStr).replace('{time}', timeStr);
}

// Hits the gated endpoint; the server verifies the student is assigned AND
// the 15-min-before-to-end window is open before revealing the URL.
async function joinClass(classId) {
  try {
    const { meetingLink } = await api.get(`/api/meeting/${classId}/link`);
    if (meetingLink) window.open(meetingLink, '_blank', 'noopener');
  } catch (err) {
    console.error('Failed to get meeting link:', err?.data?.error || err.message);
  }
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
