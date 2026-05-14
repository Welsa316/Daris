<template>
  <div class="bg-white rounded-2xl shadow-card overflow-hidden">
    <div class="grid grid-cols-1 md:grid-cols-[18rem_1fr] min-h-[36rem]">
      <!-- Left: conversation list. On phones the list stacks above the
           thread; clicking a row scrolls to the thread. -->
      <aside class="border-b md:border-b-0 md:border-e border-slate-100 flex flex-col">
        <div class="px-4 py-4 border-b border-slate-100">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-sm font-display font-bold text-primary">
              {{ $t('messages.adminListTitle') }}
            </h2>
            <span
              v-if="totalUnread > 0"
              class="text-[10px] font-semibold tabular-nums text-cream bg-primary rounded-full px-2 py-0.5"
            >
              {{ totalUnread }}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 mt-1 text-pretty">
            {{ isSheikh ? $t('messages.adminListHintSheikh') : $t('messages.adminListHintTeacher') }}
          </p>
          <label class="sr-only" :for="searchId">{{ $t('messages.searchLabel') }}</label>
          <input
            :id="searchId"
            v-model="search"
            type="text"
            :placeholder="$t('messages.searchPlaceholder')"
            class="mt-3 w-full text-sm rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div class="flex-1 overflow-y-auto" :class="loading ? 'opacity-60' : ''">
          <div v-if="loading && !conversations.length" class="text-center text-xs text-slate-400 py-8">
            {{ $t('messages.loading') }}
          </div>
          <div v-else-if="!filteredConversations.length" class="text-center text-xs text-slate-400 py-8 px-4 text-pretty">
            {{ search ? $t('messages.noMatch') : $t('messages.emptyList') }}
          </div>
          <ul v-else class="divide-y divide-slate-100">
            <li
              v-for="row in filteredConversations"
              :key="row.studentId"
            >
              <button
                type="button"
                @click="select(row.studentId)"
                class="w-full text-start px-4 py-3 motion-safe:transition-colors"
                :class="row.studentId === selectedStudentId
                  ? 'bg-primary/5 border-s-2 border-primary'
                  : 'hover:bg-cream-50 border-s-2 border-transparent'"
              >
                <div class="flex items-center justify-between gap-2">
                  <p
                    class="text-sm font-medium truncate flex items-center gap-1.5"
                    :class="row.unreadCount > 0 ? 'text-primary font-semibold' : 'text-slate-700'"
                  >
                    <span class="truncate">{{ row.studentName || $t('messages.unnamedStudent') }}</span>
                    <!-- Read-only badge: only meaningful for the sheikh,
                         who can see every conversation but only reply in
                         the ones where they're the assigned teacher. -->
                    <span
                      v-if="row.canWrite === false"
                      class="shrink-0 text-[9px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded-sm px-1 py-px font-medium"
                      :title="$t('messages.readOnlyHint')"
                    >
                      {{ $t('messages.readOnlyBadge') }}
                    </span>
                  </p>
                  <span
                    v-if="row.unreadCount > 0"
                    class="shrink-0 text-[10px] font-semibold tabular-nums text-cream bg-primary rounded-full px-1.5 py-0.5"
                    :aria-label="$t('messages.unreadAria', { n: row.unreadCount })"
                  >
                    {{ row.unreadCount }}
                  </span>
                  <span
                    v-else-if="row.lastMessageAt"
                    class="shrink-0 text-[10px] text-slate-400 tabular-nums"
                  >
                    {{ formatListTime(row.lastMessageAt) }}
                  </span>
                </div>
                <p
                  v-if="row.lastMessage"
                  class="text-xs text-slate-500 mt-0.5 truncate"
                  :class="row.lastMessage.fromSelf ? 'italic' : ''"
                >
                  <span v-if="row.lastMessage.fromSelf" class="text-slate-400">{{ $t('messages.youPrefix') }} </span>{{ row.lastMessage.body }}
                </p>
                <p v-else class="text-xs text-slate-400 mt-0.5 italic">
                  {{ $t('messages.noMessagesYet') }}
                </p>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Right: the actual thread. Falls back to a friendly empty
           state when nothing is selected. -->
      <section ref="threadAnchor" class="min-w-0 bg-cream/10">
        <MessageThread
          v-if="selectedStudentId"
          :key="selectedStudentId"
          :student-id="selectedStudentId"
          :title="selectedTitle"
          :empty-title="$t('messages.adminThreadEmptyTitle')"
          :empty-hint="$t('messages.adminThreadEmptyHint')"
          :force-read-only="selectedRowCanWrite === false"
          compact
          @loaded="onThreadLoaded"
          @sent="onThreadSent"
        />
        <div v-else class="flex items-center justify-center h-full p-10 text-center">
          <div>
            <p class="text-4xl mb-3" aria-hidden="true">💬</p>
            <h3 class="text-sm font-semibold text-primary">{{ $t('messages.pickAStudent') }}</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-xs mx-auto text-pretty">
              {{ $t('messages.pickAStudentHint') }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';
import { useConversationListSocket } from '@/composables/useConversationSocket.js';
import { useAuth } from '@/composables/useAuth.js';
import MessageThread from './MessageThread.vue';

defineProps({
  // True when the viewer is the sheikh. Drives the help text and the
  // empty-list copy ("you'll see every conversation here" vs "your
  // assigned students").
  isSheikh: { type: Boolean, default: false },
});
const emit = defineEmits(['unread-changed']);

const { locale } = useI18n();
const { user } = useAuth();

const conversations = ref([]);
const search = ref('');
const loading = ref(false);
const selectedStudentId = ref(null);
const threadAnchor = ref(null);
const searchId = `msg-list-search-${Math.random().toString(36).slice(2, 8)}`;

// Live sidebar updates: server pushes conversation:updated whenever a
// message lands in any conversation this user can read. We splice the
// update into the existing list and bump unread (unless the bumped
// conversation is the one currently selected, in which case the thread
// view already handled it).
const { updates: liveListUpdates } = useConversationListSocket();
watch(
  liveListUpdates,
  (queue) => {
    if (!queue.length) return;
    while (queue.length) {
      const ev = queue.shift();
      applySidebarUpdate(ev);
    }
    emit('unread-changed', totalUnread.value);
  },
  { deep: true }
);

function applySidebarUpdate(ev) {
  const idx = conversations.value.findIndex((c) => c.studentId === ev.studentId);
  // We can't know the student's display name from the event alone, so
  // if the row isn't in the list yet (e.g. a brand-new conversation),
  // fall back to a full refetch. Cheap and rare.
  if (idx === -1) {
    load();
    return;
  }
  const row = conversations.value[idx];
  row.conversationId = ev.conversationId;
  row.lastMessage = {
    id: ev.lastMessage.id,
    body: ev.lastMessage.body,
    senderId: ev.lastMessage.senderId,
    createdAt: ev.lastMessage.createdAt,
    fromSelf: ev.lastMessage.senderId === user.value?.id,
  };
  row.lastMessageAt = ev.lastMessageAt;
  // Don't bump unread when the recipient is already viewing the thread
  // — they're actively reading it, the badge would be misleading.
  if (selectedStudentId.value !== ev.studentId && ev.lastMessage.senderId !== user.value?.id) {
    row.unreadCount = (row.unreadCount || 0) + 1;
  }
  // Move the freshly-updated row to the top so the sidebar always
  // shows the most active conversation first.
  conversations.value.splice(idx, 1);
  conversations.value.unshift(row);
}

const totalUnread = computed(() =>
  conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
);

const filteredConversations = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return conversations.value;
  return conversations.value.filter((c) =>
    (c.studentName || '').toLowerCase().includes(q)
  );
});

const selectedTitle = computed(() => {
  const row = conversations.value.find((c) => c.studentId === selectedStudentId.value);
  return row?.studentName || '';
});

// Whether the viewer can write into the currently-selected thread.
// Falls back to true so we don't briefly disable the composer for a
// freshly-selected row before the list refreshes.
const selectedRowCanWrite = computed(() => {
  const row = conversations.value.find((c) => c.studentId === selectedStudentId.value);
  return row?.canWrite !== false;
});

async function load() {
  loading.value = true;
  try {
    const data = await api.get('/api/messages/conversations');
    conversations.value = data.conversations || [];
    emit('unread-changed', totalUnread.value);
  } catch {
    // Show empty list rather than a noisy error — the parent dashboard
    // has its own toast pipeline; messaging shouldn't hijack it.
  } finally {
    loading.value = false;
  }
}

function select(studentId) {
  selectedStudentId.value = studentId;
  // Optimistically clear the unread for this row so the badge updates
  // immediately. The server clears it on the next load too.
  const row = conversations.value.find((c) => c.studentId === studentId);
  if (row) row.unreadCount = 0;
  emit('unread-changed', totalUnread.value);
  // On mobile the thread sits below the list. Bring it into view so the
  // user doesn't have to hunt for it.
  nextTick(() => {
    if (window.innerWidth < 768) {
      threadAnchor.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    }
  });
}

function onThreadLoaded() {
  const row = conversations.value.find((c) => c.studentId === selectedStudentId.value);
  if (row) row.unreadCount = 0;
  emit('unread-changed', totalUnread.value);
}

async function onThreadSent() {
  // Refresh the sidebar so the row jumps to the top with the new
  // preview text + lastMessageAt. Cheap call.
  await load();
}

function formatListTime(iso) {
  const localeTag = locale.value === 'ar' ? 'ar-EG' : 'en-US';
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return new Intl.DateTimeFormat(localeTag, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  }
  return new Intl.DateTimeFormat(localeTag, {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

// Poll the sidebar list every 30s so new conversations / unread bumps
// surface without a manual refresh. Only when the tab is visible.
let pollTimer = null;
function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') {
      load();
    }
  }, 30_000);
}
function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}
function onVisibility() {
  if (document.visibilityState === 'visible') load();
}

onMounted(() => {
  load();
  startPolling();
  document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
  stopPolling();
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>
