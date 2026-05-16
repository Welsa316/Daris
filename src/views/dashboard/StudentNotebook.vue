<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-3xl mx-auto">

      <!-- Header: back, student name, language switch -->
      <div class="flex items-center gap-3 mb-8">
        <button
          type="button"
          @click="goBack"
          class="shrink-0 w-9 h-9 rounded-full bg-white border border-slate-200 text-primary flex items-center justify-center hover:bg-primary hover:text-cream motion-safe:transition-colors"
          :aria-label="$t('admin.notebook.back')"
        >
          <span aria-hidden="true">{{ isAr ? '→' : '←' }}</span>
        </button>
        <h1 class="text-2xl font-display font-bold text-primary truncate min-w-0 flex-1">
          {{ studentName || $t('admin.notebook.title') }}
        </h1>
        <LanguageSwitcher class="shrink-0" />
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

      <!-- Lesson table — a spreadsheet-style grid. Classes group into
           cycles of four; each cycle carries a Paid checkbox per
           subject the student studies. Cycles before the current one
           are hidden. -->
      <section v-else class="bg-white rounded-2xl shadow-card p-5 md:p-6">
        <div v-if="cycles.length === 0" class="text-center py-10 px-4">
          <p class="text-3xl mb-2" aria-hidden="true">📓</p>
          <p class="text-sm text-slate-500 text-pretty">{{ $t('admin.notebook.noClasses') }}</p>
        </div>

        <div v-else class="rounded-xl border border-slate-200 overflow-hidden">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-cream/70">
                <th class="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {{ $t('admin.notebook.dateCol') }}
                </th>
                <th class="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-s border-slate-200">
                  {{ $t('admin.notebook.notesCol') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(cycle, ci) in cycles" :key="cycle.cycleIndex">
                <!-- Cycle header: label + one Paid checkbox per
                     subject. Single-subject students get one unlabelled
                     checkbox; the row turns green once every subject in
                     the cycle is paid. -->
                <tr :class="cycleAllPaid(cycle) ? 'bg-emerald-50' : 'bg-cream/40'">
                  <td colspan="2" class="px-3 py-2 border-t-2 border-slate-300">
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                      <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {{ $t('admin.notebook.cycle', { n: ci + 1 }) }}
                      </span>
                      <div class="flex items-center gap-4 flex-wrap">
                        <label
                          v-for="subj in subjects"
                          :key="subj"
                          class="inline-flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            class="w-5 h-5 accent-primary cursor-pointer"
                            :checked="isPaid(subj, cycle.cycleIndex)"
                            @change="toggleCycle(subj, cycle.cycleIndex, $event.target.checked)"
                          />
                          <span
                            class="text-sm font-semibold"
                            :class="isPaid(subj, cycle.cycleIndex) ? 'text-emerald-700' : 'text-slate-600'"
                          >
                            {{ subjects.length === 1 ? $t('admin.notebook.paid') : subjectLabel(subj) }}
                          </span>
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
                <NotebookEntryRow
                  v-for="entry in cycle.entries"
                  :key="entry.classSessionId"
                  :entry="entry"
                  :student-id="studentId"
                  :is-ar="isAr"
                />
              </template>
            </tbody>
          </table>
        </div>
      </section>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';
import NotebookEntryRow from '@/components/dashboard/NotebookEntryRow.vue';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();
const isAr = computed(() => locale.value === 'ar');

const studentId = route.params.studentId;

const loading = ref(true);
const loadError = ref(false);
const student = ref(null);
const entries = ref([]);
const subjects = ref([]);
// Set of "subject|cycleIndex" keys that are marked paid.
const paidSet = ref(new Set());
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

function subjectLabel(key) {
  return key ? t('admin.subject_' + key) : '';
}

// The cycle the student is currently in — the cycle of the most recent
// class that has already started. Cycles before it are hidden so the
// notebook always opens on the current cycle.
const currentCycleIndex = computed(() => {
  const now = Date.now();
  let idx = 0;
  for (const e of entries.value) {
    if (new Date(e.classSession.startTime).getTime() <= now) idx = e.cycleIndex;
  }
  return idx;
});

// Entries grouped into cycle blocks, current cycle onward, in order.
const cycles = computed(() => {
  const groups = new Map();
  for (const e of entries.value) {
    if (e.cycleIndex < currentCycleIndex.value) continue;
    if (!groups.has(e.cycleIndex)) groups.set(e.cycleIndex, []);
    groups.get(e.cycleIndex).push(e);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([cycleIndex, items]) => ({ cycleIndex, entries: items }));
});

function isPaid(subject, cycleIndex) {
  return paidSet.value.has(`${subject}|${cycleIndex}`);
}

// A cycle reads "fully paid" (green) only when every subject is ticked.
function cycleAllPaid(cycle) {
  return subjects.value.length > 0 &&
    subjects.value.every((s) => isPaid(s, cycle.cycleIndex));
}

async function load() {
  loading.value = true;
  loadError.value = false;
  try {
    const data = await api.get(`/api/admin/students/${studentId}/notebook`);
    student.value = data.student;
    entries.value = data.entries || [];
    subjects.value = data.subjects || [''];
    paidSet.value = new Set(
      (data.paidCycles || []).map((p) => `${p.subject}|${p.cycleIndex}`)
    );
  } catch {
    // 403 (not your student) / 404 — show the friendly state, don't
    // leak whether the student exists.
    loadError.value = true;
  } finally {
    loading.value = false;
  }
}

// Tick / untick one subject's Paid checkbox for a cycle. Optimistic:
// flip the local set immediately, revert if the request fails.
async function toggleCycle(subject, cycleIndex, paid) {
  const key = `${subject}|${cycleIndex}`;
  const prev = new Set(paidSet.value);
  const next = new Set(paidSet.value);
  if (paid) next.add(key);
  else next.delete(key);
  paidSet.value = next;
  try {
    await api.put(`/api/admin/students/${studentId}/cycles/${cycleIndex}`, { subject, paid });
  } catch (e) {
    paidSet.value = prev;
    flashToast(e?.data?.error || t('admin.notebook.saveFailed'));
  }
}

onMounted(load);
</script>
