<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h2 class="text-lg font-bold text-primary">{{ $t('admin.teachers.title') }}</h2>
        <p class="text-xs text-slate-400 mt-1">{{ $t('admin.teachers.subtitle') }}</p>
      </div>
      <button
        @click="showPromoteForm = !showPromoteForm"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition-colors shrink-0"
      >
        {{ showPromoteForm ? $t('admin.teachers.cancel') : $t('admin.teachers.addTeacher') }}
      </button>
    </div>

    <!-- Promote form: take an enrolled student's email and flip them to teacher -->
    <div v-if="showPromoteForm" class="border border-cream-300 bg-cream-50 rounded-xl p-4 mb-6">
      <p class="text-sm text-slate-600 mb-3">{{ $t('admin.teachers.promoteHint') }}</p>
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="promoteEmail"
          type="email"
          :placeholder="$t('admin.teachers.promotePlaceholder')"
          class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          @keyup.enter="handlePromote"
        />
        <button
          @click="handlePromote"
          :disabled="promoting || !promoteEmail"
          class="bg-primary text-cream px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
        >
          {{ promoting ? $t('admin.saving') : $t('admin.teachers.promote') }}
        </button>
      </div>
      <p v-if="promoteError" class="text-xs text-red-600 mt-2">{{ promoteError }}</p>
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
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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
              <span v-if="t.taughtStudents.length > 0" class="text-slate-400">
                · {{ t.taughtStudents.slice(0, 3).map(s => s.student.firstName).join(', ') }}
                <span v-if="t.taughtStudents.length > 3">
                  +{{ t.taughtStudents.length - 3 }}
                </span>
              </span>
            </p>
          </div>
          <div class="flex flex-wrap gap-2 shrink-0">
            <button
              @click="openAssignModal(t)"
              class="bg-cream-100 text-primary px-4 py-2 rounded-full text-xs font-medium hover:bg-cream-200 transition-colors"
            >
              {{ $t('admin.teachers.assign') }}
            </button>
            <button
              @click="handleDemote(t)"
              :disabled="demotingId === t.id"
              class="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {{ $t('admin.teachers.demote') }}
            </button>
          </div>
        </div>
      </li>
    </ol>

    <!-- Assign students modal -->
    <AssignStudentsModal
      v-if="assignTarget"
      :teacher="assignTarget"
      :all-students="allStudents"
      @close="assignTarget = null"
      @saved="onAssignmentsSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/config/api.js';
import { confirmDialog } from '@/composables/useConfirmDialog';
import AssignStudentsModal from '@/components/dashboard/AssignStudentsModal.vue';

const emit = defineEmits(['toast', 'roleChanged']);

const { t } = useI18n();

const teachers = ref([]);
const allStudents = ref([]);
const loading = ref(true);

const showPromoteForm = ref(false);
const promoteEmail = ref('');
const promoting = ref(false);
const promoteError = ref('');

const assignTarget = ref(null);
const demotingId = ref(null);

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

async function loadAllStudents() {
  // Pulls a flat list of every enrolled student so the assignment modal
  // has a checkbox source. The Students endpoint paginates; we hit it
  // once with a generous limit for now (school size is small).
  try {
    const data = await api.get('/api/admin/students?limit=500');
    allStudents.value = data.students || [];
  } catch (err) {
    emit('toast', err, 'loadStudents');
  }
}

async function handlePromote() {
  if (!promoteEmail.value) return;
  promoting.value = true;
  promoteError.value = '';
  try {
    // First find the user by email. We use the existing students list
    // since promoting happens out of an enrolled student in 99% of
    // cases. For other roles the sheikh has to use the CLI script.
    const target = allStudents.value.find(
      (s) => s.email.toLowerCase().trim() === promoteEmail.value.toLowerCase().trim()
    );
    if (!target) {
      promoteError.value = t('admin.teachers.promoteNotFound');
      promoting.value = false;
      return;
    }
    await api.post(`/api/admin/teachers/${target.id}/role`, { role: 'teacher' });
    promoteEmail.value = '';
    showPromoteForm.value = false;
    await loadTeachers();
    emit('toast', t('admin.teachers.promoted'));
    emit('roleChanged');
  } catch (err) {
    promoteError.value = err?.data?.error || t('admin.teachers.promoteFailed');
  } finally {
    promoting.value = false;
  }
}

async function handleDemote(teacher) {
  const ok = await confirmDialog({
    title: t('admin.teachers.demoteTitle'),
    message: t('admin.teachers.demoteConfirm', {
      name: `${teacher.firstName} ${teacher.lastName}`,
      count: teacher.taughtStudents.length,
    }),
    confirmLabel: t('admin.teachers.demote'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  demotingId.value = teacher.id;
  try {
    await api.post(`/api/admin/teachers/${teacher.id}/role`, {
      role: 'enrolled_student',
    });
    await loadTeachers();
    emit('toast', t('admin.teachers.demoted'));
    emit('roleChanged');
  } catch (err) {
    emit('toast', err, 'demote');
  } finally {
    demotingId.value = null;
  }
}

function openAssignModal(teacher) {
  assignTarget.value = teacher;
}

async function onAssignmentsSaved() {
  assignTarget.value = null;
  await loadTeachers();
  emit('toast', t('admin.teachers.assignmentsSaved'));
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

onMounted(async () => {
  await Promise.all([loadTeachers(), loadAllStudents()]);
});
</script>
