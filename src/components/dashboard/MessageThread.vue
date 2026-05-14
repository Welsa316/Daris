<template>
  <div class="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col" :class="compact ? 'h-[28rem]' : 'h-[36rem] max-h-[80vh]'">
    <!-- Header: who's in the conversation. Quietly reminds the student
         that the sheikh sees everything, so no one types something they
         wouldn't say in front of him. -->
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
      <div class="min-w-0">
        <h3 class="text-sm font-display font-bold text-primary truncate">
          {{ title || $t('messages.threadTitle') }}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5 truncate">
          {{ participantSummary }}
        </p>
      </div>
      <button
        type="button"
        @click="refresh"
        :aria-label="$t('messages.refresh')"
        class="text-slate-400 hover:text-primary motion-safe:transition-colors text-sm shrink-0"
        :title="$t('messages.refresh')"
      >
        ↻
      </button>
    </div>

    <!-- Message list. Always scrollable so a long thread never pushes
         the composer off-screen. Anchored to the bottom on new messages. -->
    <div
      ref="scrollRef"
      class="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-cream/30"
      :aria-busy="loading ? 'true' : 'false'"
    >
      <div v-if="loading && !messages.length" class="text-center text-xs text-slate-400 py-8">
        {{ $t('messages.loading') }}
      </div>
      <div v-else-if="!messages.length" class="text-center py-10 px-4">
        <p class="text-3xl mb-2" aria-hidden="true">💬</p>
        <p class="text-sm text-slate-600 font-medium">{{ emptyTitle }}</p>
        <p class="text-xs text-slate-400 mt-1 text-pretty">{{ emptyHint }}</p>
      </div>

      <template v-else>
        <div
          v-for="(m, i) in messages"
          :key="m.id"
        >
          <!-- Day divider between consecutive messages from different days. -->
          <div
            v-if="shouldShowDayDivider(i)"
            class="flex justify-center my-3"
          >
            <span class="text-[10px] uppercase tracking-wider text-slate-400 bg-white border border-slate-100 rounded-full px-2.5 py-0.5">
              {{ formatDayDivider(m.createdAt) }}
            </span>
          </div>

          <div
            class="flex"
            :class="m.fromSelf ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words"
              :class="bubbleClass(m)"
            >
              <p
                v-if="!m.fromSelf && showSenderName(i)"
                class="text-[11px] font-semibold mb-0.5"
                :class="senderNameClass(m)"
              >
                {{ m.senderName }}
                <span
                  v-if="m.senderRole === 'sheikh'"
                  class="ms-1 text-[10px] uppercase tracking-wider text-gold"
                  aria-hidden="true"
                >
                  · {{ $t('messages.roleSheikh') }}
                </span>
              </p>
              <p>{{ m.body }}</p>
              <p
                class="text-[10px] mt-1 tabular-nums"
                :class="m.fromSelf ? 'text-cream/70 text-end' : 'text-slate-400'"
              >
                {{ formatTime(m.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Composer. Plain textarea + send button. Enter sends, Shift+Enter
         newlines so a non-tech-savvy user types like any normal chat box. -->
    <form @submit.prevent="onSend" class="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
      <div class="flex items-end gap-2">
        <label class="sr-only" :for="composerId">{{ $t('messages.composerLabel') }}</label>
        <textarea
          :id="composerId"
          ref="composerRef"
          v-model="draft"
          rows="1"
          :placeholder="$t('messages.composerPlaceholder')"
          :maxlength="MAX_BODY"
          @keydown.enter.exact.prevent="onSend"
          @input="autosize"
          class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none max-h-32"
        ></textarea>
        <button
          type="submit"
          :disabled="!canSend"
          class="shrink-0 bg-primary text-cream rounded-full px-4 py-2 text-sm font-semibold hover:bg-primary-800 motion-safe:transition disabled:opacity-40 disabled:cursor-not-allowed"
          :aria-label="$t('messages.send')"
        >
          <span v-if="sending">{{ $t('messages.sending') }}</span>
          <span v-else>{{ $t('messages.send') }}</span>
        </button>
      </div>
      <p v-if="error" class="text-xs text-red-600 mt-2">{{ error }}</p>
      <p v-else class="text-[11px] text-slate-400 mt-2">
        {{ $t('messages.sheikhSeesAll') }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';

const props = defineProps({
  // The student-anchored conversation to load. Required.
  studentId: { type: String, required: true },
  // Optional display name for the header (falls back to the generic
  // "Messages" title if absent).
  title: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  // When the parent wants different empty-state copy (e.g. teacher view
  // vs student view) it can override here.
  emptyTitle: { type: String, default: '' },
  emptyHint: { type: String, default: '' },
});
const emit = defineEmits(['sent', 'loaded']);

const { locale, t } = useI18n();
const isAr = computed(() => locale.value === 'ar');

const MAX_BODY = 4000;

const messages = ref([]);
const participants = ref({ student: null, teachers: [], sheikhs: [] });
const loading = ref(false);
const draft = ref('');
const sending = ref(false);
const error = ref('');
const scrollRef = ref(null);
const composerRef = ref(null);
const composerId = `msg-composer-${Math.random().toString(36).slice(2, 8)}`;

const canSend = computed(() => !sending.value && draft.value.trim().length > 0);

// Header subtitle: a short, plain-language list of who else is in the
// thread. Sheikh is always present, so we always mention him.
const participantSummary = computed(() => {
  const p = participants.value;
  const teacherCount = (p.teachers || []).length;
  const sheikhCount = (p.sheikhs || []).length;
  const parts = [];
  if (sheikhCount > 0) {
    const first = p.sheikhs[0];
    parts.push(`${first.firstName || ''} ${first.lastName || ''}`.trim() || t('messages.roleSheikh'));
  }
  if (teacherCount === 1) {
    const tch = p.teachers[0];
    parts.push(`${tch.firstName || ''} ${tch.lastName || ''}`.trim());
  } else if (teacherCount > 1) {
    parts.push(t('messages.nTeachers', { n: teacherCount }));
  }
  return parts.join(' · ');
});

function bubbleClass(m) {
  if (m.fromSelf) return 'bg-primary text-cream';
  if (m.senderRole === 'sheikh') return 'bg-gold/15 text-primary border border-gold/30';
  return 'bg-white text-slate-700 border border-slate-100';
}

function senderNameClass(m) {
  if (m.senderRole === 'sheikh') return 'text-gold';
  if (m.senderRole === 'teacher') return 'text-primary';
  return 'text-slate-500';
}

function showSenderName(i) {
  // Show the sender name on the first message in a run from one person,
  // and on every sheikh message (so the gold tag is always visible).
  const m = messages.value[i];
  if (!m) return false;
  if (m.senderRole === 'sheikh') return true;
  const prev = messages.value[i - 1];
  if (!prev) return true;
  return prev.senderId !== m.senderId;
}

function shouldShowDayDivider(i) {
  const m = messages.value[i];
  if (!m) return false;
  if (i === 0) return true;
  const prev = messages.value[i - 1];
  const d1 = new Date(m.createdAt);
  const d2 = new Date(prev.createdAt);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
}

function formatTime(iso) {
  const localeTag = isAr.value ? 'ar-EG' : 'en-US';
  return new Intl.DateTimeFormat(localeTag, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

function formatDayDivider(iso) {
  const localeTag = isAr.value ? 'ar-EG' : 'en-US';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return t('messages.today');
  if (sameDay(d, yesterday)) return t('messages.yesterday');
  return new Intl.DateTimeFormat(localeTag, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

async function load() {
  if (!props.studentId) return;
  loading.value = true;
  try {
    const data = await api.get(`/api/messages/conversations/${props.studentId}`);
    messages.value = data.messages || [];
    participants.value = data.participants || { student: null, teachers: [], sheikhs: [] };
    emit('loaded', { unreadCleared: true });
    await scrollToBottom();
  } catch (e) {
    error.value = e?.data?.error || e.message || t('messages.loadFailed');
  } finally {
    loading.value = false;
  }
}

async function refresh() {
  await load();
}

async function onSend() {
  if (!canSend.value) return;
  const body = draft.value.trim();
  if (!body) return;
  sending.value = true;
  error.value = '';
  try {
    const data = await api.post(
      `/api/messages/conversations/${props.studentId}/messages`,
      { body }
    );
    messages.value.push(data.message);
    draft.value = '';
    await nextTick();
    autosize();
    await scrollToBottom();
    emit('sent', data.message);
  } catch (e) {
    error.value = e?.data?.error || e.message || t('messages.sendFailed');
  } finally {
    sending.value = false;
    composerRef.value?.focus?.();
  }
}

async function scrollToBottom() {
  await nextTick();
  const el = scrollRef.value;
  if (el) el.scrollTop = el.scrollHeight;
}

function autosize() {
  const el = composerRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
}

// Poll every 20s for new messages so the thread updates without a manual
// refresh. Plain interval is fine — the UI is light and the queries are
// cheap (one student-anchored conversation per call).
let pollTimer = null;
function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadDelta();
    }
  }, 20_000);
}
function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

// Cheap delta load: only fetch + replace if the latest id has changed.
// Avoids the visible flicker of replacing the whole array every 20s.
async function loadDelta() {
  if (!props.studentId) return;
  try {
    const data = await api.get(`/api/messages/conversations/${props.studentId}`);
    const incoming = data.messages || [];
    const lastIncomingId = incoming[incoming.length - 1]?.id || null;
    const lastLocalId = messages.value[messages.value.length - 1]?.id || null;
    if (lastIncomingId !== lastLocalId) {
      messages.value = incoming;
      participants.value = data.participants || participants.value;
      emit('loaded', { unreadCleared: true });
      await scrollToBottom();
    }
  } catch {
    // Silent — the next tick will retry. Showing a toast every 20s
    // when offline is worse than a quiet stale view.
  }
}

function onVisibility() {
  if (document.visibilityState === 'visible') loadDelta();
}

watch(
  () => props.studentId,
  (val) => {
    if (val) {
      messages.value = [];
      load();
    }
  },
  { immediate: false }
);

onMounted(async () => {
  await load();
  startPolling();
  document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
  stopPolling();
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>
