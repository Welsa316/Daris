<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Header: back, student name, balance pill -->
      <div class="flex items-center gap-3 mb-8">
        <button
          type="button"
          @click="goBack"
          class="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 text-primary flex items-center justify-center hover:bg-primary hover:text-cream motion-safe:transition-colors"
          :aria-label="$t('admin.notebook.back')"
        >
          <span aria-hidden="true">{{ isAr ? '→' : '←' }}</span>
        </button>
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl font-display font-bold text-primary truncate">
            {{ studentName || $t('admin.notebook.title') }}
          </h1>
          <p v-if="student && student.expectedMonthlyAmount" class="mt-1">
            <BalancePill :student="balancePillStudent" />
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center text-sm text-slate-400 py-16">
        {{ $t('messages.loading') }}
      </div>

      <!-- Load error / not available -->
      <div v-else-if="loadError" class="bg-white rounded-2xl shadow-card p-10 text-center">
        <p class="text-3xl mb-3" aria-hidden="true">📓</p>
        <p class="text-sm text-slate-600 font-medium">{{ $t('admin.notebook.notFound') }}</p>
        <button
          type="button"
          @click="goBack"
          class="mt-4 text-sm text-primary hover:text-primary-800 underline"
        >
          {{ $t('admin.notebook.back') }}
        </button>
      </div>

      <template v-else>
        <!-- Class entries -->
        <section class="bg-white rounded-2xl shadow-card p-5 md:p-6 mb-6">
          <div v-if="entries.length === 0" class="text-center py-10 px-4">
            <p class="text-3xl mb-2" aria-hidden="true">📓</p>
            <p class="text-sm text-slate-500 text-pretty">{{ $t('admin.notebook.noClasses') }}</p>
          </div>

          <template v-else>
            <!-- Upcoming -->
            <template v-if="upcomingEntries.length">
              <h2 class="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400 pb-2">
                {{ $t('admin.notebook.upcoming') }}
                <span class="tabular-nums text-slate-300">· {{ upcomingEntries.length }}</span>
              </h2>
              <div class="space-y-2.5 mb-5">
                <NotebookEntryCard
                  v-for="entry in upcomingEntries"
                  :key="entry.classSessionId"
                  :entry="entry"
                  :is-ar="isAr"
                  :expanded="expandedEntryId === entry.classSessionId"
                  :saving="savingNote"
                  :draft="logDraft"
                  @toggle="toggleNote(entry)"
                  @save="saveNote(entry)"
                  @cancel="expandedEntryId = null"
                />
              </div>
            </template>

            <!-- Past -->
            <template v-if="pastEntries.length">
              <h2 class="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-400 pb-2">
                {{ $t('admin.notebook.past') }}
                <span class="tabular-nums text-slate-300">· {{ pastEntries.length }}</span>
              </h2>
              <div class="space-y-2.5">
                <NotebookEntryCard
                  v-for="entry in pastEntries"
                  :key="entry.classSessionId"
                  :entry="entry"
                  :is-ar="isAr"
                  :expanded="expandedEntryId === entry.classSessionId"
                  :saving="savingNote"
                  :draft="logDraft"
                  @toggle="toggleNote(entry)"
                  @save="saveNote(entry)"
                  @cancel="expandedEntryId = null"
                />
              </div>
            </template>
          </template>
        </section>

        <!-- Payments -->
        <section class="bg-white rounded-2xl shadow-card p-5 md:p-6">
          <h2 class="text-sm font-display font-bold text-primary mb-3">
            {{ $t('admin.notebook.paymentsTitle') }}
          </h2>

          <div v-if="Object.keys(paymentTotals).length" class="mb-4 bg-primary/5 rounded-lg p-3 text-sm">
            <span class="text-slate-500">{{ $t('admin.payments.total') }}:</span>
            <span v-for="(minor, cur) in paymentTotals" :key="cur" class="ms-2 font-medium text-primary">
              {{ formatMoney(minor, cur) }}
            </span>
          </div>

          <div v-if="!payments.length" class="text-slate-400 text-sm py-3">
            {{ $t('admin.payments.none') }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="p in payments"
              :key="p.id"
              class="border border-slate-100 rounded-lg p-3 text-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-primary">{{ formatMoney(p.amount, p.currency) }} · {{ p.period }}</p>
                  <p class="text-xs text-slate-500 tabular-nums">{{ formatDate(p.paidAt) }}</p>
                  <p v-if="p.notes" class="text-xs text-slate-400 mt-1">{{ p.notes }}</p>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button type="button" @click="openPaymentForm(p)" class="text-xs text-primary hover:text-primary-800 underline">{{ $t('admin.edit') }}</button>
                  <button type="button" @click="deletePayment(p)" class="text-xs text-red-500 hover:text-red-700 underline">{{ $t('admin.delete') }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              v-if="!showPaymentForm"
              type="button"
              @click="openPaymentForm(null)"
              class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors"
            >
              + {{ $t('admin.payments.record') }}
            </button>
            <div v-else class="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <h3 class="font-medium text-primary">
                {{ editingPaymentId ? $t('admin.payments.editTitle') : $t('admin.payments.recordTitle') }}
              </h3>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.amount') }}</label>
                  <input
                    v-model="paymentForm.amount"
                    type="number" step="0.01" min="0" dir="ltr"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.currency') }}</label>
                  <select
                    v-model="paymentForm.currency"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"
                  >
                    <option>EGP</option>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>SAR</option>
                    <option>AED</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.period') }}</label>
                <input
                  v-model="paymentForm.period"
                  type="text"
                  :placeholder="$t('admin.payments.periodPh')"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.paidAt') }}</label>
                <input
                  v-model="paymentForm.paidAt"
                  type="date" dir="ltr"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"
                />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.notes') }}</label>
                <textarea
                  v-model="paymentForm.notes"
                  rows="2"
                  :placeholder="$t('admin.payments.notesPh')"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"
                ></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" @click="showPaymentForm = false" class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">
                  {{ $t('admin.cancel') }}
                </button>
                <button
                  type="button"
                  @click="savePayment"
                  :disabled="savingPayment"
                  class="bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors disabled:opacity-50"
                >
                  {{ savingPayment ? $t('admin.saving') : $t('admin.payments.save') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- Toast -->
    <transition
      enter-active-class="motion-safe:transition motion-safe:duration-200"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="motion-safe:transition motion-safe:duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast"
        class="fixed bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-primary text-cream text-sm px-4 py-2 rounded-full shadow-lg z-50"
      >
        {{ toast }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';
import BalancePill from '@/components/dashboard/BalancePill.vue';
import NotebookEntryCard from '@/components/dashboard/NotebookEntryCard.vue';

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const isAr = computed(() => locale.value === 'ar');

const studentId = route.params.studentId;

const loading = ref(true);
const loadError = ref(false);
const student = ref(null);
const entries = ref([]);
const payments = ref([]);
const paymentTotals = ref({});
const toast = ref('');

function flashToast(msg) {
  toast.value = msg;
  setTimeout(() => { toast.value = ''; }, 3000);
}

function goBack() {
  // Return to wherever the teacher came from (Home picker / student
  // detail modal). Fall back to /admin on a cold deep-link.
  if (window.history.length > 1) router.back();
  else router.push('/admin');
}

const studentName = computed(() => {
  if (!student.value) return '';
  return `${student.value.firstName || ''} ${student.value.lastName || ''}`.trim();
});

// BalancePill shape: expectedMonthly* from the student + paidThisMonth
// recomputed from this month's payments.
const balancePillStudent = computed(() => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const paidThisMonth = {};
  for (const p of payments.value) {
    if (new Date(p.paidAt) >= monthStart) {
      paidThisMonth[p.currency] = (paidThisMonth[p.currency] || 0) + p.amount;
    }
  }
  return { ...(student.value || {}), paidThisMonth };
});

// Split entries into upcoming (soonest first) and past (most recent
// first). The API returns them startTime-desc already.
const now = ref(Date.now());
const upcomingEntries = computed(() =>
  entries.value
    .filter((e) => new Date(e.classSession.startTime).getTime() > now.value)
    .slice()
    .sort((a, b) => new Date(a.classSession.startTime) - new Date(b.classSession.startTime))
);
const pastEntries = computed(() =>
  entries.value.filter((e) => new Date(e.classSession.startTime).getTime() <= now.value)
);

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    const data = await api.get(`/api/admin/students/${studentId}/notebook`);
    student.value = data.student;
    entries.value = data.entries || [];
    payments.value = data.payments || [];
    paymentTotals.value = data.paymentTotals || {};
  } catch {
    // 403 (not your student) / 404 — show the friendly state, don't
    // leak whether the student exists.
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// --- Lesson notes ---

const expandedEntryId = ref(null);
const savingNote = ref(false);
const logDraft = reactive({ summary: '', nextSteps: '' });

function toggleNote(entry) {
  if (expandedEntryId.value === entry.classSessionId) {
    expandedEntryId.value = null;
    return;
  }
  logDraft.summary = entry.log?.summary || '';
  logDraft.nextSteps = entry.log?.nextSteps || '';
  expandedEntryId.value = entry.classSessionId;
}

async function saveNote(entry) {
  if (savingNote.value) return;
  savingNote.value = true;
  try {
    const data = await api.put(
      `/api/admin/class-logs/${entry.classSessionId}/${studentId}`,
      {
        summary: logDraft.summary,
        nextSteps: logDraft.nextSteps,
        // Pass existing values through so a note edited here never
        // wipes a homework / private note set elsewhere. Notebook
        // notes are always student-visible.
        homework: entry.log?.homework || '',
        adminNotes: entry.log?.adminNotes || '',
        visibility: 'student',
      }
    );
    entry.log = data.log;
    expandedEntryId.value = null;
    flashToast(t('admin.notebook.noteSaved'));
  } catch (e) {
    flashToast(e?.data?.error || t('admin.actionFailed.saveClassLog'));
  } finally {
    savingNote.value = false;
  }
}

// --- Payments ---

const showPaymentForm = ref(false);
const editingPaymentId = ref(null);
const savingPayment = ref(false);
const paymentForm = reactive({ amount: '', currency: 'EGP', period: '', paidAt: '', notes: '' });

function openPaymentForm(payment) {
  if (payment) {
    editingPaymentId.value = payment.id;
    paymentForm.amount = (payment.amount / 100).toFixed(2);
    paymentForm.currency = payment.currency;
    paymentForm.period = payment.period;
    paymentForm.paidAt = new Date(payment.paidAt).toISOString().slice(0, 10);
    paymentForm.notes = payment.notes || '';
  } else {
    editingPaymentId.value = null;
    paymentForm.amount = '';
    paymentForm.currency = 'EGP';
    paymentForm.period = '';
    paymentForm.paidAt = new Date().toISOString().slice(0, 10);
    paymentForm.notes = '';
  }
  showPaymentForm.value = true;
}

async function refreshPayments() {
  const data = await api.get(`/api/admin/students/${studentId}/payments`);
  payments.value = data.payments || [];
  paymentTotals.value = data.totals || {};
}

async function savePayment() {
  if (savingPayment.value) return;
  const amountMinor = Math.round(parseFloat(paymentForm.amount) * 100);
  if (!amountMinor || amountMinor <= 0 || !paymentForm.period.trim()) {
    flashToast(t('admin.payments.missingFields'));
    return;
  }
  savingPayment.value = true;
  try {
    const body = {
      amount: amountMinor,
      currency: paymentForm.currency,
      period: paymentForm.period.trim(),
      paidAt: new Date(paymentForm.paidAt).toISOString(),
      notes: paymentForm.notes?.trim() || null,
    };
    if (editingPaymentId.value) {
      await api.put(`/api/admin/payments/${editingPaymentId.value}`, body);
    } else {
      await api.post(`/api/admin/students/${studentId}/payments`, body);
    }
    showPaymentForm.value = false;
    await refreshPayments();
  } catch (e) {
    flashToast(e?.data?.error || t('admin.actionFailed.savePayment'));
  } finally {
    savingPayment.value = false;
  }
}

async function deletePayment(payment) {
  try {
    await api.delete(`/api/admin/payments/${payment.id}`);
    await refreshPayments();
  } catch (e) {
    flashToast(e?.data?.error || t('admin.actionFailed.deletePayment'));
  }
}

// --- Formatting ---

function formatMoney(minor, currency) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}
function formatDate(iso) {
  return new Intl.DateTimeFormat(isAr.value ? 'ar-EG' : 'en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(iso));
}

onMounted(load);
</script>
