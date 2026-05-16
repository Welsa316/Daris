<template>
  <!--
    One row in the notebook table: an auto-filled class date in the
    left cell, an editable notes cell on the right. The textarea is
    borderless and fills the cell, so the table gridline IS the cell
    edge — it reads as a spreadsheet, not a stack of input boxes. The
    note auto-saves when the teacher clicks away, with a small status
    so they can trust it landed.
  -->
  <tr>
    <!-- Date cell — auto-filled from the live class schedule, never
         typed. A reschedule moves the date; a cancelled class drops
         the row entirely. -->
    <td class="align-top w-32 md:w-44 px-3 py-2 border-t border-slate-200">
      <p class="text-sm font-semibold text-primary tabular-nums leading-snug">{{ dateLabel }}</p>
      <p class="text-xs text-slate-400 truncate leading-snug mt-0.5">{{ title }}</p>
    </td>

    <!-- Notes cell — the whole cell is the editable surface. -->
    <td class="align-top p-0 border-t border-s border-slate-200">
      <textarea
        ref="taRef"
        v-model="noteText"
        rows="2"
        :placeholder="$t('admin.notebook.coveredPlaceholder')"
        :aria-label="title + ' — ' + dateLabel"
        @input="autosize"
        @blur="save"
        class="block w-full px-3 py-2 text-sm text-slate-700 leading-relaxed bg-transparent border-0 outline-none resize-none overflow-hidden focus:bg-cream/40 motion-safe:transition-colors"
      ></textarea>
      <p
        v-if="saveState !== 'idle'"
        class="px-3 pb-1.5 -mt-0.5 text-[11px] leading-none"
        :class="statusClass"
      >
        <span v-if="saveState === 'saving'">{{ $t('admin.notebook.saving') }}</span>
        <span v-else-if="saveState === 'saved'">✓ {{ $t('admin.notebook.saved') }}</span>
        <span v-else>{{ $t('admin.notebook.saveFailed') }}</span>
      </p>
    </td>
  </tr>
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
