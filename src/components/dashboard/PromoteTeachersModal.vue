<template>
  <Teleport to="body">
    <div
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="$emit('close')"
      @keydown.esc.stop="$emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <header class="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 :id="titleId" class="text-lg font-bold text-primary">
              {{ $t('admin.teachers.promoteTitle') }}
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              {{ pureTeacher ? $t('admin.teachers.promoteSubtitlePure') : $t('admin.teachers.promoteSubtitle') }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 shrink-0 text-2xl leading-none"
            :aria-label="$t('admin.close')"
          >
            &times;
          </button>
        </header>

        <!-- Pure-teacher mode toggle. When checked, the chosen users
             ALSO have isStudent=false flipped, hiding them from the
             students list and the schedule form's student picker. -->
        <div class="px-5 py-3 border-b border-slate-100 bg-cream-50">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="pureTeacher"
              class="h-4 w-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <div class="min-w-0">
              <span class="text-sm font-medium text-primary">
                {{ $t('admin.teachers.pureTeacherLabel') }}
              </span>
              <span class="block text-xs text-slate-500 mt-0.5">
                {{ $t('admin.teachers.pureTeacherHint') }}
              </span>
            </div>
          </label>
        </div>

        <div class="px-5 py-3 border-b border-slate-100">
          <input
            v-model="search"
            type="text"
            :placeholder="$t('admin.searchStudents')"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <div class="flex items-center justify-between mt-3 text-xs">
            <span class="text-slate-500 tabular-nums">
              {{ selectedCountLabel(selected.size) }}
            </span>
            <div class="flex gap-3">
              <button
                @click="selectAllVisible"
                class="text-primary hover:text-primary-800 font-medium"
              >
                {{ $t('admin.teachers.selectAll') }}
              </button>
              <button
                @click="clearAll"
                class="text-slate-500 hover:text-slate-700 font-medium"
              >
                {{ $t('admin.teachers.clearAll') }}
              </button>
            </div>
          </div>
        </div>

        <ol class="flex-1 overflow-y-auto px-5 py-3 space-y-1">
          <li
            v-if="loading"
            class="text-sm text-slate-400 py-6 text-center"
          >
            {{ $t('admin.loading') }}
          </li>
          <li
            v-else-if="!filtered.length"
            class="text-sm text-slate-400 py-6 text-center"
          >
            {{ $t('admin.teachers.noPromoteCandidates') }}
          </li>
          <li
            v-for="s in filtered"
            :key="s.id"
            class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-cream-50 cursor-pointer"
            @click="toggle(s.id)"
          >
            <input
              type="checkbox"
              :checked="selected.has(s.id)"
              @change.stop="toggle(s.id)"
              @click.stop
              class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-700 truncate">
                {{ s.firstName }} {{ s.lastName }}
              </p>
              <p class="text-xs text-slate-400 truncate">{{ s.email }}</p>
            </div>
            <span
              v-if="!s.emailVerified"
              class="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"
            >
              {{ $t('admin.teachers.emailUnverified') }}
            </span>
          </li>
        </ol>

        <footer class="p-5 border-t border-slate-100 flex justify-end gap-2">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-full transition"
          >
            {{ $t('admin.cancel') }}
          </button>
          <button
            @click="save"
            :disabled="saving || selected.size === 0"
            class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
          >
            {{ saving ? $t('admin.saving') : $t('admin.teachers.promoteSave') }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';

defineProps({
  // Reserved for future plumbing if we want to highlight a
  // pre-selected student (e.g. from the schedule form). Unused today.
});
const emit = defineEmits(['close', 'saved', 'toast']);

const { t } = useI18n();

const titleId = `promote-${Math.random().toString(36).slice(2, 9)}`;
const search = ref('');
const candidates = ref([]);
const loading = ref(true);
const saving = ref(false);
const selected = ref(new Set());
// When checked, the chosen users get isStudent=false flipped on top
// of isTeacher=true so they disappear from the students list. Defaults
// to false: most promotions are dual-role (senior students who teach).
const pureTeacher = ref(false);

// Pull the full list of enrolled students who are NOT already teachers.
// Server-scoped naturally because the call is sheikh-only on the route
// itself; teachers don't have access to this overlay.
async function loadCandidates() {
  loading.value = true;
  try {
    const data = await api.get('/api/admin/students?limit=500');
    candidates.value = (data.students || []).filter((s) => !s.isTeacher);
  } catch (err) {
    emit('toast', err, 'loadStudents');
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return candidates.value;
  return candidates.value.filter((s) => {
    const hay = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
    return hay.includes(q);
  });
});

function toggle(id) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

function selectAllVisible() {
  const next = new Set(selected.value);
  for (const s of filtered.value) {
    if (s.emailVerified) next.add(s.id); // skip unverified emails
  }
  selected.value = next;
}

function clearAll() {
  selected.value = new Set();
}

function selectedCountLabel(n) {
  if (n === 0) return t('admin.teachers.selectedCount.zero');
  if (n === 1) return t('admin.teachers.selectedCount.one');
  return t('admin.teachers.selectedCount.many', { count: n });
}

async function save() {
  if (selected.value.size === 0) return;
  saving.value = true;
  try {
    await api.post('/api/admin/teachers/promote', {
      userIds: [...selected.value],
      pureTeacher: pureTeacher.value,
    });
    emit('saved');
  } catch (err) {
    emit('toast', err, 'promoteTeachers');
    saving.value = false;
  }
}

onMounted(() => {
  loadCandidates();
  // Focus the search input on open so keyboard users can start
  // searching immediately.
  setTimeout(() => {
    const input = document.querySelector(`[aria-labelledby="${titleId}"] input[type="text"]`);
    input?.focus();
  }, 50);
});
</script>
