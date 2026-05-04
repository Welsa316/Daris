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
              {{ $t('admin.teachers.assignTitle', { name: teacherName }) }}
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              {{ $t('admin.teachers.assignSubtitle') }}
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
          <li v-if="!filtered.length" class="text-sm text-slate-400 py-6 text-center">
            {{ $t('admin.teachers.noMatchingStudents') }}
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
            :disabled="saving"
            class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
          >
            {{ saving ? $t('admin.saving') : $t('admin.teachers.saveAssignments') }}
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

const { t } = useI18n();

const props = defineProps({
  teacher: {
    type: Object,
    required: true,
  },
  allStudents: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['close', 'saved']);

const titleId = `assign-${Math.random().toString(36).slice(2, 9)}`;
const search = ref('');
const saving = ref(false);

// Selected students start from the teacher's existing assignment list so
// the modal works as "current state, edit to change". Stored as a Set
// for O(1) toggle checks.
const selected = ref(new Set(
  props.teacher.taughtStudents.map((ts) => ts.student.id)
));

const teacherName = computed(
  () => `${props.teacher.firstName} ${props.teacher.lastName}`
);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return props.allStudents;
  return props.allStudents.filter((s) => {
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
  for (const s of filtered.value) next.add(s.id);
  selected.value = next;
}

function clearAll() {
  selected.value = new Set();
}

// Plural helper. vue-i18n is on legacy:false here so $tc isn't available;
// we emulate the three plural buckets with explicit keys.
function selectedCountLabel(n) {
  if (n === 0) return t('admin.teachers.selectedCount.zero');
  if (n === 1) return t('admin.teachers.selectedCount.one');
  return t('admin.teachers.selectedCount.many', { count: n });
}

async function save() {
  saving.value = true;
  try {
    await api.put(`/api/admin/teachers/${props.teacher.id}/students`, {
      studentIds: [...selected.value],
    });
    emit('saved');
  } catch (err) {
    // Bubble up so the parent toast surfaces it; the modal stays open
    // so the sheikh can fix the error and retry without losing their
    // selection.
    console.error('assign students failed', err);
    saving.value = false;
  }
}

onMounted(() => {
  // Trap focus on the search input on open so keyboard users can start
  // searching immediately.
  setTimeout(() => {
    const input = document.querySelector(`[aria-labelledby="${titleId}"] input[type="text"]`);
    input?.focus();
  }, 50);
});
</script>
