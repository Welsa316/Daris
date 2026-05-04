<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="mb-4">
      <h2 class="text-lg font-bold text-primary">{{ $t('admin.teachers.title') }}</h2>
      <p class="text-xs text-slate-400 mt-1">
        {{ isAdmin ? $t('admin.teachers.subtitle') : $t('admin.teachers.subtitleTeacher') }}
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
      <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="!teachers.length" class="text-center py-10">
      <p class="text-slate-400 text-sm">{{ $t('admin.teachers.empty') }}</p>
      <p class="text-xs text-slate-400 mt-1">{{ $t('admin.teachers.emptyHint') }}</p>
    </div>

    <ol v-else class="space-y-3">
      <li
        v-for="t in teachers"
        :key="t.id"
        class="border border-slate-100 rounded-xl p-4 sm:p-5"
      >
        <div class="min-w-0">
          <h3 class="font-semibold text-primary">
            {{ t.firstName }} {{ t.lastName }}
          </h3>
          <!-- Email + last-login are sheikh-only; the directory endpoint
               for teachers omits both so other teachers don't get each
               other's contact details. -->
          <p v-if="t.email" class="text-sm text-slate-500 truncate">{{ t.email }}</p>
          <p class="text-xs text-slate-400 mt-1">
            {{ $t('admin.teachers.joinedOn', { date: formatDate(joinDate(t)) }) }}
            <span v-if="t.lastLoginAt" class="ms-2">
              · {{ $t('admin.teachers.lastLogin', { date: formatDate(t.lastLoginAt) }) }}
            </span>
          </p>
          <p class="text-xs text-slate-500 mt-2 tabular-nums">
            {{ studentCountLabel(studentCount(t)) }}
          </p>
          <!-- Roster pills only render for the sheikh; the directory
               endpoint doesn't ship them so teachers can't see each
               other's student lists. -->
          <ul
            v-if="t.taughtStudents?.length"
            class="mt-3 flex flex-wrap gap-1.5"
          >
            <li
              v-for="ts in t.taughtStudents"
              :key="ts.id"
              class="text-xs bg-cream-100 text-primary rounded-full px-3 py-1"
            >
              {{ ts.student.firstName }} {{ ts.student.lastName }}
            </li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';

const emit = defineEmits(['toast']);

const { t } = useI18n();
const { isAdmin } = useAuth();

const teachers = ref([]);
const loading = ref(true);

// Two endpoints:
//   - sheikh: /api/admin/teachers (requireAdmin) -> full info + rosters
//   - teacher: /api/admin/teachers/directory     -> name + studentCount,
//             plus the sheikh in the same list (for "who else is on the
//             team" awareness). We filter the sheikh out below so the
//             teachers list stays just teachers.
async function loadTeachers() {
  loading.value = true;
  try {
    if (isAdmin.value) {
      const data = await api.get('/api/admin/teachers');
      teachers.value = data.teachers || [];
    } else {
      const data = await api.get('/api/admin/teachers/directory');
      teachers.value = (data.teachers || []).filter((u) => u.role === 'teacher');
    }
  } catch (err) {
    emit('toast', err, 'loadTeachers');
  } finally {
    loading.value = false;
  }
}

// The directory shape uses `joinedAt`; the full-list shape uses
// `createdAt`. Normalising in the template would mean a v-bind helper;
// inline this stays simpler.
function joinDate(t) {
  return t.createdAt || t.joinedAt;
}

// Same shape difference for the assigned-students count: the directory
// returns a precomputed `studentCount`; the full list ships the array
// itself so the sheikh can render the roster pills.
function studentCount(t) {
  if (typeof t.studentCount === 'number') return t.studentCount;
  return t.taughtStudents?.length || 0;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString();
}

// vue-i18n is configured with legacy: false, so $tc isn't available.
// Plurals are emulated with explicit zero/one/many keys instead.
function studentCountLabel(n) {
  if (n === 0) return t('admin.teachers.studentCount.zero');
  if (n === 1) return t('admin.teachers.studentCount.one');
  return t('admin.teachers.studentCount.many', { count: n });
}

onMounted(loadTeachers);
</script>
