<template>
  <!--
    Bottom-right messaging widget. The whole point is that a student or
    teacher who's looking at any page (their schedule, an article, the
    home tab) can pop open the chat without hunting for the Messages tab
    or scrolling to a section. Designed for users who aren't tech-savvy:
    one fixed button, always in the same place, always one click away.

    Two collapsed states:
      • Pill with icon + label + unread count — discoverable, can't be
        mistaken for "decorative" UI.
      • Expanded card — anchored above the pill on desktop, full-screen
        on phones so the keyboard doesn't fight the thread.

    Role behaviour:
      • Student → one thread (their own). Open straight into it.
      • Teacher → mini conversation list. Click one to drill into the
        thread.
      • Sheikh → same mini list, sees every student. Threads where the
        sheikh isn't the assigned teacher render read-only (server
        enforces this; client just hides the composer).
  -->
  <div
    v-if="shouldShow"
    class="fixed bottom-4 end-4 z-50 print:hidden"
  >
    <!-- Expanded chat panel. Sits above the pill on desktop; full-screen
         on mobile so the OS keyboard doesn't shove things off-screen. -->
    <transition
      enter-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
      enter-from-class="opacity-0 motion-safe:translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="motion-safe:transition motion-safe:duration-150 motion-safe:ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 motion-safe:translate-y-2"
    >
      <div
        v-if="open"
        class="absolute bottom-20 end-0 w-[35rem] max-w-[calc(100vw-2rem)] h-[54rem] max-h-[calc(100vh-7rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col origin-bottom-end max-md:fixed max-md:inset-2 max-md:w-auto max-md:h-auto max-md:max-w-none max-md:max-h-none"
      >
        <!-- Header. Different content depending on whether we're in the
             list view or inside a thread. -->
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-cream/40">
          <button
            v-if="staffInThread"
            type="button"
            @click="backToList"
            class="text-slate-500 hover:text-primary motion-safe:transition-colors text-xl shrink-0"
            :aria-label="$t('messages.widgetBack')"
          >
            ←
          </button>
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-display font-bold text-primary truncate">
              {{ headerTitle }}
            </h3>
            <p v-if="headerSubtitle" class="text-xs text-slate-500 truncate mt-1">
              {{ headerSubtitle }}
            </p>
          </div>
          <button
            type="button"
            @click="close"
            class="text-slate-400 hover:text-primary motion-safe:transition-colors text-xl shrink-0 leading-none"
            :aria-label="$t('messages.widgetClose')"
          >
            ✕
          </button>
        </div>

        <!-- BODY: list (staff) OR thread (everyone) -->
        <div v-if="showListView" class="flex-1 overflow-y-auto">
          <div v-if="listLoading && conversations.length === 0" class="text-center text-xs text-slate-400 py-8">
            {{ $t('messages.loading') }}
          </div>
          <div v-else-if="conversations.length === 0" class="text-center text-xs text-slate-400 py-10 px-4 text-pretty">
            {{ $t('messages.emptyList') }}
          </div>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="row in conversations" :key="row.studentId">
              <button
                type="button"
                @click="openThread(row.studentId)"
                class="w-full text-start px-6 py-4 hover:bg-cream-50 motion-safe:transition-colors"
              >
                <div class="flex items-center justify-between gap-2">
                  <p
                    class="text-base font-medium truncate flex items-center gap-2"
                    :class="row.unreadCount > 0 ? 'text-primary font-semibold' : 'text-slate-700'"
                  >
                    <span class="truncate">{{ row.studentName || $t('messages.unnamedStudent') }}</span>
                    <span
                      v-if="row.canWrite === false"
                      class="shrink-0 text-[10px] uppercase tracking-wider text-slate-400 border border-slate-200 rounded-sm px-1.5 py-px font-medium"
                      :title="$t('messages.readOnlyHint')"
                    >
                      {{ $t('messages.readOnlyBadge') }}
                    </span>
                  </p>
                  <span
                    v-if="row.unreadCount > 0"
                    class="shrink-0 text-xs font-semibold tabular-nums text-cream bg-primary rounded-full px-2 py-0.5"
                  >
                    {{ row.unreadCount }}
                  </span>
                </div>
                <p
                  v-if="row.lastMessage"
                  class="text-sm text-slate-500 mt-1 truncate"
                >
                  <span v-if="row.lastMessage.fromSelf" class="text-slate-400">{{ $t('messages.youPrefix') }} </span>{{ row.lastMessage.body }}
                </p>
                <p v-else class="text-sm text-slate-400 mt-1 italic">
                  {{ $t('messages.noMessagesYet') }}
                </p>
              </button>
            </li>
          </ul>
        </div>

        <div v-else-if="activeStudentId" class="flex-1 min-h-0 flex flex-col">
          <MessageThread
            :key="activeStudentId"
            :student-id="activeStudentId"
            :title="activeStudentName || ($t('messages.threadTitle'))"
            :empty-title="$t('messages.studentEmptyTitle')"
            :empty-hint="emptyHint"
            :force-read-only="activeRowCanWrite === false"
            compact
            class="flex-1 min-h-0 !rounded-none !shadow-none !h-full"
            @loaded="onThreadLoaded"
            @sent="onThreadSent"
          />
        </div>
      </div>
    </transition>

    <!-- Collapsed pill. Always visible (when authenticated), wraps a
         chat icon + label + unread badge. The label and the unread
         count both make it obvious what the button does, which matters
         a lot for non-tech-savvy users who might otherwise ignore a
         bare icon. -->
    <button
      type="button"
      @click="toggle"
      class="group inline-flex items-center gap-3 bg-primary text-cream rounded-full ps-6 pe-7 py-4 shadow-2xl hover:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold motion-safe:transition-all"
      :class="open ? 'scale-95' : ''"
      :aria-label="open ? $t('messages.widgetClose') : $t('messages.widgetOpen')"
      :aria-expanded="open"
    >
      <span class="text-2xl leading-none" aria-hidden="true">💬</span>
      <span class="text-base font-semibold">{{ $t('messages.widgetLabel') }}</span>
      <span
        v-if="unreadCount > 0"
        class="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-full bg-gold text-primary text-sm font-bold tabular-nums"
        :aria-label="$t('messages.unreadAria', { n: unreadCount })"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { api } from '@/config/api.js';
import { useAuth } from '@/composables/useAuth.js';
import { useConversationListSocket } from '@/composables/useConversationSocket.js';
import MessageThread from './MessageThread.vue';

const { t } = useI18n();
const route = useRoute();
const { user, isAuthenticated, isStaff } = useAuth();

const open = ref(false);
const conversations = ref([]);
const listLoading = ref(false);
const activeStudentId = ref(null);
const unreadCount = ref(0);

// Marketing routes (/, /en/*, /ar/*) host the public site; the widget
// has no business there. Auth pages similarly: a non-logged-in visitor
// signing up doesn't need a chat affordance.
const HIDDEN_PATH_PATTERNS = [
  /^\/(en|ar)(\/about|\/programs|\/faq|\/articles|\/contact|\/?$)/,
  /^\/(login|register|verify-email|reset-password|forgot-password)/,
];
const isHiddenRoute = computed(() =>
  HIDDEN_PATH_PATTERNS.some((re) => re.test(route.path))
);

// Effective "should we render?" = authenticated AND not on a route
// where the widget would be noise. Computed against the live route.
const shouldShow = computed(() => isAuthenticated.value && !isHiddenRoute.value);

// Decide which view the panel is in:
//   - Student: always the thread (their own).
//   - Staff with no selection yet: the list.
//   - Staff after picking a row: the thread.
const staffInThread = computed(() => isStaff.value && !!activeStudentId.value);
const showListView = computed(() => isStaff.value && !activeStudentId.value);

const activeRow = computed(() =>
  conversations.value.find((c) => c.studentId === activeStudentId.value) || null
);
const activeStudentName = computed(() => activeRow.value?.studentName || '');
const activeRowCanWrite = computed(() => activeRow.value?.canWrite !== false);

const headerTitle = computed(() => {
  if (!open.value) return '';
  if (showListView.value) return t('messages.widgetListTitle');
  if (staffInThread.value) return activeStudentName.value || t('messages.threadTitle');
  return t('messages.widgetStudentTitle');
});

const headerSubtitle = computed(() => {
  if (staffInThread.value && activeRowCanWrite.value === false) {
    return t('messages.readOnlyHint');
  }
  return '';
});

const emptyHint = computed(() =>
  isStaff.value
    ? t('messages.adminThreadEmptyHint')
    : t('messages.studentEmptyHint')
);

async function loadList() {
  if (!isAuthenticated.value) return;
  listLoading.value = true;
  try {
    const data = await api.get('/api/messages/conversations');
    conversations.value = data.conversations || [];
    unreadCount.value = conversations.value.reduce(
      (sum, c) => sum + (c.unreadCount || 0),
      0
    );
    // Student: there's exactly one row (their own). Auto-bind the
    // thread so the widget skips the meaningless list view entirely.
    if (!isStaff.value && conversations.value.length === 1) {
      activeStudentId.value = conversations.value[0].studentId;
    }
  } catch {
    // Silent: a 401 is the common shape here and the auth layer will
    // handle redirecting; spamming the user with widget errors helps
    // no one.
  } finally {
    listLoading.value = false;
  }
}

async function loadUnreadCount() {
  if (!isAuthenticated.value) return;
  try {
    const data = await api.get('/api/messages/unread-count');
    unreadCount.value = data.unreadCount || 0;
  } catch {
    // Silent. The pill just won't show the badge until we recover.
  }
}

function toggle() {
  if (open.value) close();
  else openPanel();
}

async function openPanel() {
  open.value = true;
  await loadList();
}

function close() {
  open.value = false;
}

function openThread(studentId) {
  activeStudentId.value = studentId;
  // Mark this row as read optimistically so the badge clears before
  // the next list refresh.
  const row = conversations.value.find((c) => c.studentId === studentId);
  if (row) {
    unreadCount.value -= row.unreadCount || 0;
    if (unreadCount.value < 0) unreadCount.value = 0;
    row.unreadCount = 0;
  }
}

function backToList() {
  activeStudentId.value = null;
}

function onThreadLoaded() {
  // Inside-thread refresh: clear unread on the active row + total.
  const row = conversations.value.find(
    (c) => c.studentId === activeStudentId.value
  );
  if (row) {
    unreadCount.value -= row.unreadCount || 0;
    if (unreadCount.value < 0) unreadCount.value = 0;
    row.unreadCount = 0;
  }
}

async function onThreadSent() {
  // After a send the list ordering needs a refresh — the row should
  // jump to the top with the new preview.
  await loadList();
}

// Sidebar live updates: bump unread + reorder when a message lands in
// any conversation visible to us. Same logic as MessagesTab; kept
// independent so each surface is self-contained.
const { updates: liveListUpdates } = useConversationListSocket();
watch(
  liveListUpdates,
  (queue) => {
    if (!queue.length) return;
    while (queue.length) {
      const ev = queue.shift();
      applyLiveUpdate(ev);
    }
  },
  { deep: true }
);

function applyLiveUpdate(ev) {
  const idx = conversations.value.findIndex((c) => c.studentId === ev.studentId);
  if (idx === -1) {
    // Unknown conversation — could be a brand-new one; refetch.
    loadList();
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
  const inActiveThread =
    open.value && activeStudentId.value === ev.studentId;
  const isOwnMessage = ev.lastMessage.senderId === user.value?.id;
  if (!inActiveThread && !isOwnMessage) {
    row.unreadCount = (row.unreadCount || 0) + 1;
    unreadCount.value += 1;
  }
  // Move to the top of the list.
  conversations.value.splice(idx, 1);
  conversations.value.unshift(row);
}

// Light polling for the unread-count when the widget is collapsed.
// The socket pushes are the primary signal but a polling fallback
// catches the case where the socket dropped without our knowing.
let pollTimer = null;
function startPolling() {
  stopPolling();
  pollTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible' && !open.value) {
      loadUnreadCount();
    }
  }, 45_000);
}
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

onMounted(async () => {
  // Initial unread badge so the pill is informative on first paint.
  if (isAuthenticated.value) await loadUnreadCount();
  startPolling();
});

onBeforeUnmount(() => stopPolling());

// React to login/logout in-session: clear state when the user is gone,
// and prime the badge once auth resolves.
watch(
  () => isAuthenticated.value,
  (authed) => {
    if (authed) {
      loadUnreadCount();
    } else {
      open.value = false;
      activeStudentId.value = null;
      conversations.value = [];
      unreadCount.value = 0;
    }
  }
);

// Hide the widget entirely on marketing / auth routes. We still keep
// the component mounted (so socket subscriptions don't churn on every
// navigation) but render nothing.
watch(
  () => shouldShow.value,
  (show) => {
    if (!show && open.value) open.value = false;
  }
);
</script>
