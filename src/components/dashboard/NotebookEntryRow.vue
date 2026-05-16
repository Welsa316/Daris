<template>
  <!--
    One ledger row in the student notebook: an auto-filled class date on
    the left, a notes cell on the right the teacher writes straight into.
    No "add note" button, no class-picking — the row IS the class. The
    note auto-saves when the teacher clicks away (Sheets-like), with a
    small per-row status so they can trust it landed.
  -->
  <div class="flex flex-col md:flex-row md:items-start gap-1.5 md:gap-4 py-3 border-t border-slate-100 first:border-t-0">
    <!-- Date column — auto-filled from the class schedule, never typed.
         Shows the live class date, so a reschedule moves it and a
         cancelled class drops the row entirely. -->
    <div class="md:w-44 md:shrink-0 md:pt-2">
      <p class="text-sm font-semibold text-primary tabular-nums">{{ dateLabel }}</p>
      <p class="text-xs text-slate-400 truncate">{{ title }}</p>
    </div>

    <!-- Notes cell -->
    <div class="flex-1 min-w-0">
      <textarea
        ref="taRef"
        v-model="noteText"
        rows="2"
        :placeholder="$t('admin.notebook.coveredPlaceholder')"
        :aria-label="title + ' — ' + dateLabel"
        @input="autosize"
        @blur="save"
        class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed focus:border-primary outline-none resize-none overflow-hidden"
      ></textarea>
      <p class="h-4 mt-1 text-xs leading-none" :class="statusClass">
        <span v-if="saveState === 'saving'">{{ $t('admin.notebook.saving') }}</span>
        <span v-else-if="saveState === 'saved'">✓ {{ $t('admin.notebook.saved') }}</span>
        <span v-else-if="saveState === 'error'">{{ $t('admin.notebook.saveFailed') }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { api } from '@/config/api.js';

const props = defineProps({
  // { classSessionId, classSession: {id,title,titleAr,subject,startTime,endTime}, log: ClassLog|null }
  entry: { type: Object, required: true },
  studentId: { type: String, required: true },
  isAr: { type: Boolean, default: false },
});

const taRef = ref(null);
const noteText = ref(props.entry.log?.summary || '');
// Last value confirmed saved on the server — guards against a needless
// PUT when the teacher clicks into a cell and out without changing it.
let savedText = props.entry.log?.summary || '';
const saveState = ref('idle'); // idle | saving | saved | error
let savedTimer = null;

const title = computed(() => {
  const cs = props.entry.classSession;
  return (props.isAr && cs.titleAr ? cs.titleAr : cs.title) || '';
});

const dateLabel = computed(() =>
  new Intl.DateTimeFormat(props.isAr ? 'ar-EG' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(props.entry.classSession.startTime))
);

const statusClass = computed(() => ({
  'text-slate-400': saveState.value === 'saving',
  'text-emerald-600': saveState.value === 'saved',
  'text-red-600': saveState.value === 'error',
}));

// Grow the textarea to fit its content so a long note is fully visible
// without a scrollbar or a manual drag.
function autosize() {
  const el = taRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

async function save() {
  if (noteText.value === savedText) return; // unchanged — skip the PUT
  saveState.value = 'saving';
  try {
    await api.put(
      `/api/admin/class-logs/${props.entry.classSessionId}/${props.studentId}`,
      {
        summary: noteText.value,
        // Pass the other ClassLog fields through untouched; the notebook
        // only edits the one notes cell. Always student-visible.
        nextSteps: props.entry.log?.nextSteps || '',
        homework: props.entry.log?.homework || '',
        adminNotes: props.entry.log?.adminNotes || '',
        visibility: 'student',
      }
    );
    savedText = noteText.value;
    saveState.value = 'saved';
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => {
      if (saveState.value === 'saved') saveState.value = 'idle';
    }, 2500);
  } catch {
    saveState.value = 'error';
  }
}

onMounted(() => nextTick(autosize));
</script>
