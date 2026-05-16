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

        <!-- Hero card: the very next class. Big, prominent, no clutter.
             The Join button activates live (no manual refresh needed)
             when the class enters its 15-min join window. The countdown
             below the title ticks every second so the student can see
             exactly how long until they can join. -->
        <div v-if="nextClass" class="bg-white rounded-2xl shadow-card p-6 mb-6 border-l-4 border-gold">
          <p class="text-xs font-semibold tracking-[0.15em] uppercase text-gold/80 mb-3">
            {{ $t('dashboard.nextClass') }}
          </p>
          <h2 class="text-xl font-display font-bold text-primary">
            {{ isAr ? (nextClass.titleAr || nextClass.title) : nextClass.title }}
            <span v-if="nextClass.rescheduled" class="text-amber-600 text-xs font-medium">({{ $t('admin.rescheduled') }})</span>
          </h2>
          <p class="text-slate-600 mt-1">
            {{ liveRelativeWhen(nextClass) }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ formatClassTime(nextClass) }}
            <span v-if="viewerTimezoneDiffers(nextClass)">
              · {{ $t('dashboard.yourTime') }}: {{ formatInViewerTz(nextClass) }}
            </span>
          </p>

          <div class="mt-5">
            <button
              v-if="isJoinableLive(nextClass)"
              @click="joinClass(nextClass.id)"
              class="bg-primary text-cream text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-800 transition inline-flex items-center gap-2"
            >
              <span class="w-2 h-2 rounded-full bg-cream/90 animate-pulse" aria-hidden="true"></span>
              {{ $t('dashboard.joinClass') }}
            </button>
            <div v-else class="space-y-1.5">
              <p class="text-xs text-slate-500 tabular-nums">
                {{ joinCountdownLabel(nextClass) }}
              </p>
              <p class="text-[11px] text-slate-400">
                {{ $t('dashboard.linkOpensBefore') }}
              </p>
            </div>
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
                v-if="isJoinableLive(cls)"
                @click="joinClass(cls.id)"
                class="shrink-0 bg-primary text-cream text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-primary-800 transition"
              >
                {{ $t('dashboard.joinClass') }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Messages with your teacher.
             One thread per student. The sheikh and every assigned
             teacher see it; everything you write is visible to them.
             Useful when the power's out, you're running late, or you
             need to ask a quick question between classes. -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3 px-1">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {{ $t('messages.studentSectionTitle') }}
            </h2>
            <span
              v-if="unreadCount > 0"
              class="text-[10px] font-semibold tabular-nums text-cream bg-primary rounded-full px-2 py-0.5"
              :aria-label="$t('messages.unreadAria', { n: unreadCount })"
            >
              {{ unreadCount }}
            </span>
          </div>
          <MessageThread
            v-if="user?.id"
            :student-id="user.id"
            :title="$t('messages.studentThreadTitle')"
            :empty-title="$t('messages.studentEmptyTitle')"
            :empty-hint="$t('messages.studentEmptyHint')"
            @loaded="handleThreadLoaded"
            @sent="loadUnreadCount"
          />
        </div>

        <!-- Nothing on the schedule at all -->
        <div v-if="!nextClass && !laterClasses.length" class="bg-white rounded-2xl shadow-card p-10 text-center mb-6">
          <p class="text-slate-400 text-sm">{{ $t('dashboard.noUpcoming') }}</p>
        </div>

        <!-- Notebook (view-only). Lesson notes the teacher wrote, one
             per class, newest first. Read-only — the student never
             edits. Shows a quiet placeholder before any notes exist. -->
        <div class="bg-white rounded-2xl shadow-card p-5 mb-6">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl shrink-0" aria-hidden="true">📓</span>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-primary text-balance">
                {{ $t('dashboard.notebookTitle') }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5 text-pretty">
                {{ $t('dashboard.notebookHint') }}
              </p>
            </div>
          </div>
          <p v-if="!notebookLogs.length" class="text-xs text-slate-400 italic py-2 text-pretty">
            {{ $t('dashboard.notebookEmptyHint') }}
          </p>
          <ul v-else class="space-y-3">
            <li
              v-for="log in notebookLogs"
              :key="log.classSessionId"
              class="border border-slate-100 rounded-xl p-3.5"
            >
              <p class="text-xs text-slate-400 tabular-nums">
                {{ formatNotebookDate(log.classSession.startTime) }}
              </p>
              <p class="text-sm font-medium text-primary mt-0.5">
                {{ isAr && log.classSession.titleAr ? log.classSession.titleAr : log.classSession.title }}
              </p>
              <p v-if="log.summary && log.summary.trim()" class="text-sm text-slate-700 whitespace-pre-wrap break-words mt-1.5">
                {{ log.summary }}
              </p>
              <p v-if="log.nextSteps && log.nextSteps.trim()" class="text-sm text-slate-500 whitespace-pre-wrap break-words mt-1.5">
                <span class="font-medium text-slate-400">{{ $t('dashboard.notebookNext') }}</span>
                {{ log.nextSteps }}
              </p>
            </li>
          </ul>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';
import MessageThread from '@/components/dashboard/MessageThread.vue';

const { locale, t } = useI18n();
const { user, logout } = useAuth();
const isAr = computed(() => locale.value === 'ar');

const dashboard = ref(null);
const loading = ref(true);
const showAllUpcoming = ref(false);
const unreadCount = ref(0);

// Reactive ticking clock so the "starts in N min" countdown + the
// live join-button activation update without the student needing to
// refresh the page. 1s is fine — this is one student's dashboard, not
// a busy admin grid.
const now = ref(Date.now());
let clockTimer = null;

// 15-min join window matches the server-side gate in
// server/src/routes/meeting.js. Keep this constant aligned with that
// file: if the server window changes, change this too.
const JOIN_WINDOW_MS = 15 * 60 * 1000;

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
// Notebook entries the teacher has shared (visibility='student').
// Hide empty rows so a blank saved log doesn't show as a bare date.
const notebookLogs = computed(() =>
  (dashboard.value?.classLogs || []).filter(
    (l) => (l.summary && l.summary.trim()) || (l.nextSteps && l.nextSteps.trim())
  )
);

function formatNotebookDate(iso) {
  return new Intl.DateTimeFormat(isAr.value ? 'ar-EG' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(iso));
}

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

// Live join check: re-derive from `now` (which ticks every second) so the
// button switches on at exactly the 15-min mark without a refresh. The
// server-side gate in meeting.js is still authoritative — this is just a
// best-effort UI hint.
function isJoinableLive(cls) {
  if (!cls) return false;
  const start = new Date(cls.startTime).getTime();
  const end = new Date(cls.endTime).getTime();
  const t = now.value;
  return !cls.cancelled && t >= start - JOIN_WINDOW_MS && t <= end;
}

// "Opens in N min" / "Opens in N sec" — drives the student-visible
// countdown right above the disabled join button. Switches to "Live now"
// once the window opens (covered by `liveRelativeWhen` for the title row).
function joinCountdownLabel(cls) {
  if (!cls) return '';
  const opens = new Date(cls.startTime).getTime() - JOIN_WINDOW_MS;
  const msLeft = opens - now.value;
  if (msLeft <= 0) return t('dashboard.openingNow');
  const totalSec = Math.ceil(msLeft / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return t('dashboard.opensInHours', { h: hours, m: minutes });
  }
  if (minutes > 0) {
    return t('dashboard.opensInMin', { n: minutes });
  }
  return t('dashboard.opensInSec', { n: seconds });
}

// Live wrapper around relativeWhen so the "Starts in N min" line ticks
// down without a refresh.
function liveRelativeWhen(cls) {
  // `now.value` is referenced so the computed text re-renders each tick.
  void now.value;
  return relativeWhen(cls);
}

async function loadUnreadCount() {
  try {
    const data = await api.get('/api/messages/unread-count');
    unreadCount.value = data.unreadCount || 0;
  } catch {
    // Best-effort. Leaving the previous value avoids flicker on a
    // transient network blip.
  }
}

function handleThreadLoaded() {
  // Opening the thread on /api/messages/conversations/:studentId
  // server-side bumps lastReadAt, so the unread count drops to zero.
  unreadCount.value = 0;
}

onMounted(async () => {
  try {
    dashboard.value = await api.get('/api/student/dashboard');
  } catch (err) {
    console.error('Failed to load dashboard:', err.message);
  } finally {
    loading.value = false;
  }
  loadUnreadCount();
  clockTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
});
</script>
