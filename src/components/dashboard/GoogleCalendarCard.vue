<template>
  <div class="bg-white rounded-2xl shadow-card p-5">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="min-w-0">
        <h3 class="font-semibold text-primary flex items-center gap-2 flex-wrap">
          {{ $t('admin.gcal.title') }}
          <span
            v-if="status === 'active'"
            class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-green-50 text-green-700"
          >
            {{ $t('admin.gcal.statusActive') }}
          </span>
          <span
            v-else-if="status === 'needs_reconnect'"
            class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"
          >
            {{ $t('admin.gcal.statusNeedsReconnect') }}
          </span>
          <span
            v-else-if="status === 'disconnected'"
            class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
          >
            {{ $t('admin.gcal.statusDisconnected') }}
          </span>
        </h3>
        <p class="text-xs text-slate-500 mt-1">{{ subtitleCopy }}</p>
      </div>
      <span
        class="shrink-0 size-9 flex items-center justify-center rounded-full"
        :class="iconBg"
        aria-hidden="true"
      >
        <!-- Calendar icon. Static, no animation. -->
        <svg
          class="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </span>
    </div>

    <!-- Loading skeleton on first paint. -->
    <div v-if="loading" class="space-y-2">
      <div class="h-4 bg-slate-100 rounded animate-pulse"></div>
      <div class="h-4 w-2/3 bg-slate-100 rounded animate-pulse"></div>
    </div>

    <!-- Not configured (env vars missing on the server). -->
    <div v-else-if="!configured" class="text-sm text-slate-500">
      <p>{{ $t('admin.gcal.notConfigured') }}</p>
    </div>

    <!-- Not yet connected. Sheikh hasn't run the OAuth flow. -->
    <div v-else-if="status === 'not_connected'">
      <p class="text-sm text-slate-500 mb-3">
        {{ $t('admin.gcal.notConnectedHint') }}
      </p>
      <button
        type="button"
        @click="handleConnect"
        :disabled="busy"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
      >
        {{ busy ? $t('admin.saving') : $t('admin.gcal.connectCta') }}
      </button>
    </div>

    <!-- Connected and healthy. -->
    <div v-else-if="status === 'active'">
      <dl class="text-sm space-y-1">
        <div class="flex flex-wrap gap-2">
          <dt class="text-slate-400">{{ $t('admin.gcal.account') }}:</dt>
          <dd class="font-medium text-slate-700 truncate">{{ data.googleAccountEmail }}</dd>
        </div>
        <div class="flex flex-wrap gap-2">
          <dt class="text-slate-400">{{ $t('admin.gcal.connectedOn') }}:</dt>
          <dd class="text-slate-600 tabular-nums">{{ formatDate(data.connectedAt) }}</dd>
        </div>
        <div v-if="data.lastSyncedAt" class="flex flex-wrap gap-2">
          <dt class="text-slate-400">{{ $t('admin.gcal.lastSynced') }}:</dt>
          <dd class="text-slate-600 tabular-nums">{{ formatDateTime(data.lastSyncedAt) }}</dd>
        </div>
      </dl>
      <!-- Backfill CTA shows up only when there's at least one
           future, uncancelled class that hasn't synced yet. The
           background job drains at ~10/min so a 100-class backfill
           takes about 10 minutes. -->
      <div v-if="data.unsyncedCount > 0" class="mt-3 p-3 rounded-lg bg-cream-50 border border-cream-200">
        <p class="text-sm text-primary mb-2">
          {{ $t('admin.gcal.backfillHint', { count: data.unsyncedCount }) }}
        </p>
        <button
          type="button"
          @click="handleBackfill"
          :disabled="busy"
          class="bg-primary text-cream px-4 py-2 rounded-full text-xs font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
        >
          {{ busy ? $t('admin.saving') : $t('admin.gcal.backfillCta', { count: data.unsyncedCount }) }}
        </button>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          @click="handleDisconnect"
          :disabled="busy"
          class="bg-red-50 text-red-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-red-100 motion-safe:transition-colors disabled:opacity-50"
        >
          {{ busy ? $t('admin.saving') : $t('admin.gcal.disconnectCta') }}
        </button>
      </div>
    </div>

    <!-- Reconnect needed. Refresh token rejected (revoked, password
         changed, etc). The card prompts the same OAuth flow as
         not_connected; the server reuses the existing row on
         exchangeCodeForTokens. -->
    <div v-else-if="status === 'needs_reconnect'">
      <p class="text-sm text-amber-700 mb-1">
        {{ $t('admin.gcal.needsReconnectHint') }}
      </p>
      <p v-if="data.lastErrorMessage" class="text-xs text-slate-500 mb-3 truncate" :title="data.lastErrorMessage">
        {{ data.lastErrorMessage }}
      </p>
      <button
        type="button"
        @click="handleConnect"
        :disabled="busy"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
      >
        {{ busy ? $t('admin.saving') : $t('admin.gcal.reconnectCta') }}
      </button>
    </div>

    <!-- Previously disconnected. Same connect button as not_connected
         but with a different copy so the sheikh sees that nothing was
         deleted on Google's side; events stayed there. -->
    <div v-else-if="status === 'disconnected'">
      <p class="text-sm text-slate-500 mb-3">
        {{ $t('admin.gcal.disconnectedHint') }}
      </p>
      <button
        type="button"
        @click="handleConnect"
        :disabled="busy"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
      >
        {{ busy ? $t('admin.saving') : $t('admin.gcal.reconnectCta') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';
import { confirmDialog } from '@/composables/useConfirmDialog.js';

const emit = defineEmits(['toast']);

const { t } = useI18n();

const loading = ref(true);
const busy = ref(false);
const configured = ref(true);
const data = ref({});
// Derived from data: 'not_connected' | 'active' | 'needs_reconnect' | 'disconnected'
const status = computed(() => {
  if (!configured.value) return 'unconfigured';
  return data.value?.status || 'not_connected';
});

const subtitleCopy = computed(() => {
  switch (status.value) {
    case 'active':
      return t('admin.gcal.subtitleActive');
    case 'needs_reconnect':
      return t('admin.gcal.subtitleNeedsReconnect');
    case 'disconnected':
      return t('admin.gcal.subtitleDisconnected');
    case 'not_connected':
      return t('admin.gcal.subtitleNotConnected');
    default:
      return t('admin.gcal.subtitleNotConnected');
  }
});

const iconBg = computed(() => {
  switch (status.value) {
    case 'active':
      return 'bg-green-50 text-green-700';
    case 'needs_reconnect':
      return 'bg-amber-50 text-amber-700';
    case 'disconnected':
      return 'bg-slate-100 text-slate-500';
    default:
      return 'bg-cream-100 text-primary';
  }
});

async function loadStatus() {
  loading.value = true;
  try {
    const res = await api.get('/api/admin/google-calendar/status');
    if (res?.configured === false) {
      configured.value = false;
      data.value = {};
    } else {
      configured.value = true;
      data.value = res || {};
    }
  } catch (err) {
    emit('toast', err, 'loadGCalStatus');
  } finally {
    loading.value = false;
  }
}

// Fetch the OAuth consent URL from the server, then navigate to it.
// Going through fetch() (instead of an <a href>) means our api.js
// wrapper handles silent token refresh on TOKEN_EXPIRED. A bare link
// would 401 the moment the 15-min access JWT expired with no chance
// to recover.
async function handleConnect() {
  busy.value = true;
  try {
    const res = await api.get('/api/admin/google-calendar/connect');
    if (res?.url) {
      // Top-level navigation to Google's consent screen.
      window.location.href = res.url;
    } else {
      emit('toast', t('admin.gcal.connectError', { reason: 'no_url' }));
      busy.value = false;
    }
  } catch (err) {
    emit('toast', err, 'gcalConnect');
    busy.value = false;
  }
  // Don't reset busy on success — the navigation is in flight.
}

async function handleBackfill() {
  busy.value = true;
  try {
    const res = await api.post('/api/admin/google-calendar/backfill');
    const enqueued = res?.enqueued ?? 0;
    emit('toast', t('admin.gcal.backfillToast', { count: enqueued }));
    // Re-fetch status so the unsyncedCount drops as the job drains.
    // Setting a small delay so the first ops have time to be picked up.
    setTimeout(() => loadStatus(), 1500);
  } catch (err) {
    emit('toast', err, 'gcalBackfill');
  } finally {
    busy.value = false;
  }
}

async function handleDisconnect() {
  const ok = await confirmDialog({
    title: t('admin.gcal.disconnectTitle'),
    message: t('admin.gcal.disconnectConfirm'),
    confirmLabel: t('admin.gcal.disconnectCta'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  busy.value = true;
  try {
    await api.post('/api/admin/google-calendar/disconnect');
    emit('toast', t('admin.gcal.disconnected'));
    await loadStatus();
  } catch (err) {
    emit('toast', err, 'gcalDisconnect');
  } finally {
    busy.value = false;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString();
}
function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

onMounted(loadStatus);

// Expose a way for the parent to refresh after a callback redirect
// (?calendar=connected lands here after Google sends the user back).
defineExpose({ refresh: loadStatus });
</script>
