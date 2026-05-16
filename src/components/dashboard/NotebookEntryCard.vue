<template>
  <!--
    One class session in the student notebook. Shows the lesson date +
    title, the saved note (or a prompt to add one), and an inline
    two-field editor when expanded. The date comes from the class's
    startTime — a note written days late still reads the real lesson
    date, which is the whole reason notes attach to classes.
  -->
  <div class="border border-slate-100 rounded-xl p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="font-medium text-primary truncate">{{ title }}</p>
        <p class="text-xs text-slate-500 tabular-nums mt-0.5">{{ dateLabel }}</p>
      </div>
      <button
        type="button"
        @click="$emit('toggle')"
        class="shrink-0 text-xs font-medium text-primary hover:text-primary-800 underline"
      >
        {{ expanded ? $t('admin.cancel') : (hasNote ? $t('admin.notebook.editNote') : $t('admin.notebook.addNote')) }}
      </button>
    </div>

    <!-- Collapsed: show the saved note, or a quiet prompt -->
    <div v-if="!expanded" class="mt-2">
      <template v-if="hasNote">
        <p class="text-sm text-slate-700 whitespace-pre-wrap break-words">{{ entry.log.summary }}</p>
        <p
          v-if="entry.log.nextSteps && entry.log.nextSteps.trim()"
          class="text-sm text-slate-500 whitespace-pre-wrap break-words mt-1.5"
        >
          <span class="font-medium text-slate-400">{{ $t('admin.notebook.nextInline') }}</span>
          {{ entry.log.nextSteps }}
        </p>
      </template>
      <p v-else class="text-sm text-slate-400 italic">{{ $t('admin.notebook.noNoteYet') }}</p>
    </div>

    <!-- Expanded: inline editor, two fields only -->
    <div v-else class="mt-3 border-t border-slate-100 pt-3 space-y-3">
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">
          {{ $t('admin.notebook.coveredLabel') }}
        </label>
        <textarea
          v-model="draft.summary"
          rows="4"
          :placeholder="$t('admin.notebook.coveredPlaceholder')"
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-primary outline-none resize-y"
        ></textarea>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">
          {{ $t('admin.notebook.nextLabel') }}
        </label>
        <textarea
          v-model="draft.nextSteps"
          rows="3"
          :placeholder="$t('admin.notebook.nextPlaceholder')"
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:border-primary outline-none resize-y"
        ></textarea>
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          {{ $t('admin.cancel') }}
        </button>
        <button
          type="button"
          @click="$emit('save')"
          :disabled="saving"
          class="bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
        >
          {{ saving ? $t('admin.saving') : $t('admin.notebook.saveNote') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // { classSessionId, classSession: {id,title,titleAr,subject,startTime,endTime}, log: ClassLog|null }
  entry: { type: Object, required: true },
  isAr: { type: Boolean, default: false },
  expanded: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  // Shared draft owned by the parent — only one card is expanded at a
  // time, so binding directly into it is safe.
  draft: { type: Object, required: true },
});
defineEmits(['toggle', 'save', 'cancel']);

const title = computed(() => {
  const cs = props.entry.classSession;
  return (props.isAr && cs.titleAr ? cs.titleAr : cs.title) || '';
});

const hasNote = computed(() =>
  !!(props.entry.log && props.entry.log.summary && props.entry.log.summary.trim())
);

const dateLabel = computed(() =>
  new Intl.DateTimeFormat(props.isAr ? 'ar-EG' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(props.entry.classSession.startTime))
);
</script>
