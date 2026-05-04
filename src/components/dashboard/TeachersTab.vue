<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="mb-4">
      <h2 class="text-lg font-bold text-primary">{{ $t('admin.teachers.title') }}</h2>
      <p class="text-xs text-slate-400 mt-1">{{ $t('admin.teachers.subtitle') }}</p>
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
          <p class="text-sm text-slate-500 truncate">{{ t.email }}</p>
          <p class="text-xs text-slate-400 mt-1">
            {{ $t('admin.teachers.joinedOn', { date: formatDate(t.createdAt) }) }}
            <span v-if="t.lastLoginAt" class="ms-2">
              · {{ $t('admin.teachers.lastLogin', { date: formatDate(t.lastLoginAt) }) }}
            </span>
          </p>
          <p class="text-xs text-slate-500 mt-2 tabular-nums">
            {{ studentCountLabel(t.taughtStudents.length) }}
          </p>
          <ul
            v-if="t.taughtStudents.length"
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
import { api } from '@/config/api.js';

const emit = defineEmits(['toast']);

const { t } = useI18n();

const teachers = ref([]);
const loading = ref(true);

async function loadTeachers() {
  loading.value = true;
  try {
    const data = await api.get('/api/admin/teachers');
    teachers.value = data.teachers || [];
  } catch (err) {
    emit('toast', err, 'loadTeachers');
  } finally {
    loading.value = false;
  }
}

function formatDate(iso) {
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
