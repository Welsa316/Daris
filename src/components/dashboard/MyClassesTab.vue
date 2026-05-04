<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div>
        <h2 class="text-lg font-bold text-primary">{{ $t('admin.myClasses.title') }}</h2>
        <p class="text-xs text-slate-400 mt-1">{{ $t('admin.myClasses.subtitle') }}</p>
      </div>
      <button
        type="button"
        @click="$emit('schedule')"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors shrink-0"
      >
        {{ $t('admin.scheduleStudent') }}
      </button>
    </div>

    <!-- Empty state. Three flavours so the teacher knows whether they're
         waiting on the sheikh or on themselves. -->
    <div v-if="!grouped.length" class="text-center py-10">
      <p class="text-slate-400 text-sm">{{ emptyTitle }}</p>
      <p class="text-xs text-slate-400 mt-1">{{ emptyHint }}</p>
    </div>

    <ol v-else class="space-y-6">
      <li v-for="group in grouped" :key="group.dateKey">
        <h3 class="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-2">
          {{ group.label }}
          <span class="text-slate-400 font-normal ms-1">· {{ group.classes.length }}</span>
        </h3>
        <ul class="space-y-2">
          <li v-for="cls in group.classes" :key="cls.id">
            <button
              type="button"
              @click="$emit('select', cls)"
              class="w-full text-start border border-slate-100 rounded-xl p-4 hover:border-primary/30 hover:bg-cream-50/40 motion-safe:transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
              :class="cls.cancelled ? 'opacity-50' : ''"
              :aria-label="ariaLabel(cls)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="font-semibold text-primary text-balance">{{ classTitle(cls) }}</h4>
                    <span
                      v-if="subjectStyle(cls.subject)"
                      class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                      :class="`${subjectStyle(cls.subject).bg} ${subjectStyle(cls.subject).text}`"
                    >
                      {{ $t('admin.subject_' + cls.subject) }}
                    </span>
                    <span v-if="cls.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span>
                    <span v-if="cls.rescheduled" class="text-amber-600 text-xs">({{ $t('admin.rescheduled') }})</span>
                  </div>
                  <p class="text-sm text-slate-500 mt-0.5 tabular-nums">
                    {{ formatTimeRange(cls) }}
                  </p>
                  <p
                    v-if="differentTz(cls)"
                    class="text-xs text-slate-400 tabular-nums"
                  >
                    {{ formatTimeRange(cls, cls.timezone) }}
                    <span class="text-slate-500">({{ cls.timezone }})</span>
                  </p>
                </div>
                <span class="text-xs text-slate-400 shrink-0 self-center">{{ $t('admin.classDrawer.openHint') }}</span>
              </div>
            </button>
          </li>
        </ul>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  // Full scoped class list (server already filters to assigned-students
  // + own creations for teachers). We pick the upcoming subset here.
  classes: {
    type: Array,
    required: true,
  },
  // Viewer's IANA timezone for display.
  viewerTz: {
    type: String,
    required: true,
  },
  // Locale flag for date formatting.
  isAr: {
    type: Boolean,
    default: false,
  },
  // True when the teacher has at least one student assigned. When false
  // the empty state nudges them at the sheikh, not themselves.
  hasStudents: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['select', 'schedule']);

const { t } = useI18n();

// Subject palette — kept local per the same logic as ClassDetailDrawer
// so this component stays self-contained.
const SUBJECTS = {
  quran:  { bg: 'bg-amber-50',   text: 'text-amber-800' },
  fiqh:   { bg: 'bg-primary/10', text: 'text-primary'   },
  arabic: { bg: 'bg-blue-50',    text: 'text-blue-800'  },
};
function subjectStyle(s) {
  return SUBJECTS[s] || null;
}

// Pick the next two weeks of upcoming, non-cancelled classes. We DON'T
// drop empty-assignment classes here (unlike the dashboard's "next 3
// days" widget) because the teacher might still want to see them and
// jump into the drawer to clean up.
const upcoming = computed(() => {
  const now = Date.now();
  const horizon = now + 14 * 24 * 60 * 60 * 1000;
  return props.classes
    .filter((c) => {
      const t = new Date(c.startTime).getTime();
      return t >= now && t <= horizon;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
});

// Group by viewer-local date so "Today" and "Tomorrow" headers feel
// natural. Key by the YYYY-MM-DD in the viewer's tz, not UTC, otherwise
// a 9pm class can land on the wrong day.
const grouped = computed(() => {
  const out = new Map();
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: props.viewerTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  for (const cls of upcoming.value) {
    const key = fmt.format(new Date(cls.startTime));
    if (!out.has(key)) out.set(key, { dateKey: key, classes: [] });
    out.get(key).classes.push(cls);
  }
  // Convert to array and add display labels (Today / Tomorrow / date).
  const arr = [...out.values()];
  const today = fmt.format(new Date());
  const tomorrow = fmt.format(new Date(Date.now() + 24 * 60 * 60 * 1000));
  for (const g of arr) {
    if (g.dateKey === today) g.label = t('admin.today');
    else if (g.dateKey === tomorrow) g.label = t('admin.myClasses.tomorrow');
    else {
      g.label = new Intl.DateTimeFormat(props.isAr ? 'ar-EG' : 'en-GB', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: props.viewerTz,
      }).format(new Date(`${g.dateKey}T12:00:00Z`));
    }
  }
  return arr;
});

const emptyTitle = computed(() =>
  props.hasStudents
    ? t('admin.myClasses.emptyTitle')
    : t('admin.myClasses.noStudentsTitle')
);
const emptyHint = computed(() =>
  props.hasStudents
    ? t('admin.myClasses.emptyHint')
    : t('admin.myClasses.noStudentsHint')
);

// Mirrors classDisplayName from AdminDashboard. Local to keep the
// component self-contained.
function classTitle(cls) {
  const names = (cls.assignments || [])
    .map((a) => a.student?.firstName)
    .filter(Boolean);
  if (names.length === 0) return props.isAr && cls.titleAr ? cls.titleAr : cls.title || '';
  return names.join(' + ');
}

function formatTimeRange(cls, tz = props.viewerTz) {
  const locale = props.isAr ? 'ar-EG' : 'en-GB';
  const start = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(cls.startTime));
  const end = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(cls.endTime));
  return `${start} – ${end}`;
}

function differentTz(cls) {
  return !!cls.timezone && cls.timezone !== props.viewerTz;
}

function ariaLabel(cls) {
  const parts = [classTitle(cls), formatTimeRange(cls)];
  if (cls.cancelled) parts.push(t('admin.cancelled'));
  else if (cls.rescheduled) parts.push(t('admin.rescheduled'));
  parts.push(t('admin.classDrawer.openHint'));
  return parts.join(' · ');
}
</script>
