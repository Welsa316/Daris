<template>
  <Teleport to="body">
    <div
      v-if="classInfo"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      class="fixed inset-0 z-50 flex"
      :class="containerClass"
    >
      <!-- Backdrop. Click outside dismisses. -->
      <div
        class="absolute inset-0 bg-black/40 motion-safe:transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Panel. Right slide-in on desktop, bottom sheet on mobile.
           tw-animate-css would be cleaner but we already use raw Tailwind
           transforms elsewhere; keep it consistent. The motion-safe:
           prefix opts the animation out for users with reduced motion. -->
      <div
        class="relative bg-white shadow-xl flex flex-col w-full lg:w-[28rem] lg:ms-auto h-[90vh] lg:h-dvh max-h-dvh rounded-t-3xl lg:rounded-none motion-safe:transition-transform"
        :class="panelMotion"
      >
        <!-- Subject color bar pinned to the top edge so the drawer
             instantly communicates which kind of class this is. -->
        <div
          class="h-1.5 w-full"
          :class="subjectBar"
          aria-hidden="true"
        ></div>

        <!-- Mobile drag handle. Visual affordance only; doesn't actually
             enable a drag-to-dismiss gesture (touch drag handlers add
             enough complexity to be a Phase F task). -->
        <div class="lg:hidden flex justify-center pt-3" aria-hidden="true">
          <div class="h-1.5 w-12 rounded-full bg-slate-200"></div>
        </div>

        <!-- Header -->
        <header class="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 :id="titleId" class="text-lg font-bold text-primary text-balance">
              {{ titleText }}
            </h2>
            <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span
                v-if="subj"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                :class="`${subj.bg} ${subj.text}`"
              >
                {{ $t('admin.subject_' + classInfo.subject) }}
              </span>
              <span
                v-if="classInfo.cancelled"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-600"
              >
                {{ $t('admin.cancelled') }}
              </span>
              <span
                v-if="classInfo.rescheduled"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"
              >
                {{ $t('admin.rescheduled') }}
              </span>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 shrink-0 -mt-1 -me-1 p-2 rounded-full hover:bg-slate-100 motion-safe:transition-colors"
            :aria-label="$t('admin.close')"
          >
            <span aria-hidden="true" class="text-2xl leading-none">&times;</span>
          </button>
        </header>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-5 py-3 space-y-5">
          <!-- Time block. Viewer's TZ first; class TZ shown as a caption
               only when they differ so we don't double up identical times. -->
          <section>
            <p class="text-xs font-semibold tracking-wide uppercase text-slate-400">
              {{ $t('admin.classDrawer.when') }}
            </p>
            <p class="mt-1 text-base text-primary tabular-nums">
              {{ primaryTime }}
            </p>
            <p
              v-if="differentTz"
              class="text-xs text-slate-400 tabular-nums mt-0.5"
            >
              {{ secondaryTime }}
              <span class="text-slate-500">({{ classInfo.timezone }})</span>
            </p>
          </section>

          <!-- Attendees. Tap a pill to jump to that student's profile so
               the user can manage their lesson report from there. -->
          <section v-if="attendees.length">
            <p class="text-xs font-semibold tracking-wide uppercase text-slate-400">
              {{ $t('admin.classDrawer.attendees', { count: attendees.length }) }}
            </p>
            <ul class="mt-2 flex flex-wrap gap-1.5">
              <li v-for="a in attendees" :key="a.student.id">
                <button
                  type="button"
                  @click="$emit('view-student', a.student.id)"
                  class="text-xs bg-cream-100 text-primary rounded-full px-3 py-1 hover:bg-cream-200 motion-safe:transition-colors"
                >
                  {{ a.student.firstName }} {{ a.student.lastName }}
                </button>
              </li>
            </ul>
            <p class="text-[11px] text-slate-400 mt-2">
              {{ $t('admin.classDrawer.attendeesHint') }}
            </p>
          </section>

          <!-- Empty-attendees fallback. Rare but possible if all assignees
               were removed via the upcoming-classes cleanup. -->
          <section v-else>
            <p class="text-xs font-semibold tracking-wide uppercase text-slate-400">
              {{ $t('admin.classDrawer.attendeesNone') }}
            </p>
            <p class="text-sm text-slate-500 mt-1">
              {{ $t('admin.classDrawer.attendeesNoneHint') }}
            </p>
          </section>
        </div>

        <!-- Sticky footer. On mobile this respects the safe-area inset so
             the buttons never get pushed off-screen by the home indicator. -->
        <footer
          v-if="canManage && !classInfo.cancelled"
          class="border-t border-slate-100 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-4 flex flex-col gap-2"
        >
          <button
            type="button"
            @click="$emit('reschedule', classInfo)"
            class="w-full bg-primary text-cream py-3 rounded-full text-sm font-semibold hover:bg-primary-800 motion-safe:transition-colors"
          >
            {{ $t('admin.reschedule') }}
          </button>
          <div class="flex gap-2">
            <button
              type="button"
              @click="$emit('cancel', classInfo.id)"
              class="flex-1 bg-red-50 text-red-700 py-2.5 rounded-full text-sm font-semibold hover:bg-red-100 motion-safe:transition-colors"
            >
              {{ $t('admin.cancelOnlyThis') }}
            </button>
            <button
              v-if="classInfo.seriesId"
              type="button"
              @click="$emit('cancel-series', classInfo)"
              class="flex-1 bg-red-50 text-red-700 py-2.5 rounded-full text-sm font-semibold hover:bg-red-100 motion-safe:transition-colors"
            >
              {{ $t('admin.cancelSeries') }}
            </button>
          </div>
        </footer>

        <!-- Cancelled-class footer: no actions, just a hint that history
             is preserved so the sheikh isn't surprised to see it on the
             calendar still. -->
        <footer
          v-else-if="classInfo.cancelled"
          class="border-t border-slate-100 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-4"
        >
          <p class="text-xs text-slate-400 text-center">
            {{ $t('admin.classDrawer.cancelledHint') }}
          </p>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, watch, ref, nextTick } from 'vue';

const props = defineProps({
  // The class to display. When null, the drawer is closed (parent
  // controls visibility via this prop, not a v-model:open boolean).
  classInfo: {
    type: Object,
    default: null,
  },
  // Viewer's IANA timezone. Used to format the "when" line. The class's
  // own timezone is shown only as a caption when it differs.
  viewerTz: {
    type: String,
    required: true,
  },
  // Locale flag for date formatting. Vue I18n's `t` is also used inside
  // for message keys but locale switches don't reach formatting helpers
  // we ship here, so we keep this explicit.
  isAr: {
    type: Boolean,
    default: false,
  },
  // Whether the current user can change the class (sheikh: yes; teachers
  // for their own assigned-student classes: yes when wired in Phase E).
  // Defaults to true for the sheikh-only Phase D rollout.
  canManage: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['close', 'reschedule', 'cancel', 'cancel-series', 'view-student']);

// Stable id for aria-labelledby. New per-mount so multiple drawer
// instances don't collide.
const titleId = `class-drawer-${Math.random().toString(36).slice(2, 9)}`;

// Subject color palette mirrors the source of truth in AdminDashboard.
// Duplicated here on purpose: the drawer should stay self-contained so
// it doesn't need a composable touching every consumer to update.
const SUBJECTS = {
  quran:  { bg: 'bg-amber-50',   text: 'text-amber-800', bar: 'bg-amber-500' },
  fiqh:   { bg: 'bg-primary/10', text: 'text-primary',   bar: 'bg-primary'   },
  arabic: { bg: 'bg-blue-50',    text: 'text-blue-800',  bar: 'bg-blue-500'  },
};

const subj = computed(() =>
  props.classInfo ? SUBJECTS[props.classInfo.subject] || null : null
);

const subjectBar = computed(() => {
  if (!props.classInfo) return 'bg-slate-200';
  if (props.classInfo.cancelled) return 'bg-slate-300';
  return subj.value?.bar || 'bg-slate-300';
});

// Title falls back to the saved title when no assignments are loaded
// (matches AdminDashboard's classDisplayName logic exactly).
const titleText = computed(() => {
  const cls = props.classInfo;
  if (!cls) return '';
  const names = (cls.assignments || [])
    .map((a) => a.student?.firstName)
    .filter(Boolean);
  if (names.length) return names.join(' + ');
  return props.isAr && cls.titleAr ? cls.titleAr : cls.title || '';
});

const attendees = computed(() => props.classInfo?.assignments || []);

// Time formatting. We replicate the existing helpers because Phase D
// scope avoids touching the larger calendar codebase. Both timestamps
// (start, end) are formatted in the viewer's tz; if the class's tz
// differs we render a secondary line in the class tz.
function formatRange(start, end, tz) {
  const locale = props.isAr ? 'ar-EG' : 'en-GB';
  const startFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(start));
  const endFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(end));
  return `${startFmt} – ${endFmt}`;
}

const primaryTime = computed(() => {
  if (!props.classInfo) return '';
  return formatRange(props.classInfo.startTime, props.classInfo.endTime, props.viewerTz);
});

const differentTz = computed(() => {
  if (!props.classInfo) return false;
  return !!props.classInfo.timezone && props.classInfo.timezone !== props.viewerTz;
});

const secondaryTime = computed(() => {
  if (!props.classInfo || !differentTz.value) return '';
  return formatRange(props.classInfo.startTime, props.classInfo.endTime, props.classInfo.timezone);
});

// Slide-in animation. Off-screen during the very first render, then
// animated in via a watch on classInfo. Tailwind's motion-safe: prefix
// gates the transform so reduced-motion users see an instant transition.
const open = ref(false);
const containerClass = computed(() => 'items-end lg:items-stretch lg:justify-end');
const panelMotion = computed(() => {
  // Off-screen direction depends on viewport: bottom on mobile, end on
  // desktop. We can't use ms/end utilities for transform values cleanly,
  // so toggle a flag and let the class binding swap the transform.
  if (open.value) return 'translate-y-0 lg:translate-x-0';
  return 'translate-y-full lg:translate-y-0 lg:translate-x-full';
});

watch(
  () => props.classInfo,
  async (val) => {
    if (val) {
      // Wait one tick so the panel mounts off-screen, then animate in.
      open.value = false;
      await nextTick();
      requestAnimationFrame(() => {
        open.value = true;
      });
    } else {
      open.value = false;
    }
  },
  { immediate: true }
);

// Lock background scroll while the drawer is open. Restored on close
// or unmount. Mobile bottom sheet would otherwise bleed touch scroll
// into the page below.
function lockScroll() {
  document.body.style.overflow = 'hidden';
}
function unlockScroll() {
  document.body.style.overflow = '';
}
watch(
  () => props.classInfo,
  (val) => {
    if (val) lockScroll();
    else unlockScroll();
  }
);
onMounted(() => {
  if (props.classInfo) lockScroll();
});
onBeforeUnmount(unlockScroll);
</script>
