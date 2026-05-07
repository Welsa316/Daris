<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div>
        <h2 class="text-lg font-bold text-primary">{{ $t('admin.teachers.title') }}</h2>
        <p class="text-xs text-slate-400 mt-1">
          {{ isAdmin ? $t('admin.teachers.subtitle') : $t('admin.teachers.subtitleTeacher') }}
        </p>
      </div>
      <button
        v-if="isAdmin"
        type="button"
        @click="showPromoteModal = true"
        class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 motion-safe:transition-colors shrink-0"
      >
        {{ $t('admin.teachers.promoteCta') }}
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
      <div class="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="!teachers.length" class="text-center py-10">
      <p class="text-slate-400 text-sm">{{ $t('admin.teachers.empty') }}</p>
      <p v-if="isAdmin" class="text-xs text-slate-400 mt-1">{{ $t('admin.teachers.emptyHintSheikh') }}</p>
      <p v-else class="text-xs text-slate-400 mt-1">{{ $t('admin.teachers.emptyHint') }}</p>
    </div>

    <ol v-else class="space-y-3">
      <li
        v-for="t in teachers"
        :key="t.id"
        class="border border-slate-100 rounded-xl p-4 sm:p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-primary">
                {{ t.firstName }} {{ t.lastName }}
              </h3>
              <!-- Capability badges. Admin (sheikh) gets the gold "Owner"
                   pill at the top of the list. Regular teachers get
                   "Also a student" or "Teacher only" depending on
                   whether they have isStudent set. -->
              <span
                v-if="t.isOwner"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                :title="$t('admin.teachers.ownerTooltip')"
              >
                {{ $t('admin.teachers.ownerBadge') }}
              </span>
              <span
                v-else-if="isDualRole(t)"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                :title="$t('admin.teachers.dualRoleTooltip')"
              >
                {{ $t('admin.teachers.dualRoleBadge') }}
              </span>
              <span
                v-else-if="isPureTeacher(t)"
                class="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                :title="$t('admin.teachers.pureTeacherTooltip')"
              >
                {{ $t('admin.teachers.pureTeacherBadge') }}
              </span>
            </div>
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
          <!-- Sheikh-only demote button. Hidden on the Owner (admin) row
               itself — there's no concept of "demoting the sheikh"
               from the dashboard; that would require a CLI script
               + rebuilding the school's admin chain. Confirmation
               dialog warns about the assignment cascade for regular
               teachers so the action isn't a surprise. -->
          <button
            v-if="isAdmin && !t.isOwner"
            type="button"
            @click="confirmDemote(t)"
            :disabled="demotingId === t.id"
            class="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-medium hover:bg-amber-200 motion-safe:transition-colors disabled:opacity-50 self-start sm:shrink-0"
          >
            {{ $t('admin.teachers.demote') }}
          </button>
        </div>
      </li>
    </ol>

    <PromoteTeachersModal
      v-if="showPromoteModal"
      @close="showPromoteModal = false"
      @saved="onPromoted"
      @toast="(err, action) => $emit('toast', err, action)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';
import { confirmDialog } from '@/composables/useConfirmDialog.js';
import PromoteTeachersModal from '@/components/dashboard/PromoteTeachersModal.vue';

const emit = defineEmits(['toast', 'changed']);

const { t } = useI18n();
const { isAdmin } = useAuth();

const teachers = ref([]);
const loading = ref(true);
const showPromoteModal = ref(false);
const demotingId = ref(null);

// Two endpoints depending on role:
//   - sheikh: /api/admin/teachers (requireAdmin) -> full info + rosters
//   - teacher: /api/admin/teachers/directory     -> name + studentCount,
//             plus the sheikh in the same list. We filter the sheikh out
//             below so the teachers list stays just teachers.
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

// A user is dual-role when they have isTeacher=true AND isStudent=true
// AND a non-admin role. They take classes AND teach. Only the full-list
// endpoint returns these fields, so the directory view never shows the
// badge.
function isDualRole(t) {
  return (
    t.isTeacher === true &&
    t.isStudent === true &&
    t.role !== 'admin' &&
    t.role !== undefined
  );
}

// A pure teacher has isTeacher=true + isStudent=false. They never appear
// in the students list and can't be assigned to attend classes.
function isPureTeacher(t) {
  return t.isTeacher === true && t.isStudent === false;
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

async function confirmDemote(teacher) {
  const count = studentCount(teacher);
  const ok = await confirmDialog({
    title: t('admin.teachers.demoteTitle'),
    message: t('admin.teachers.demoteConfirm', {
      name: `${teacher.firstName} ${teacher.lastName}`,
      count,
    }),
    confirmLabel: t('admin.teachers.demote'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  demotingId.value = teacher.id;
  try {
    await api.post('/api/admin/teachers/demote', { userIds: [teacher.id] });
    emit('toast', t('admin.teachers.demoted'));
    emit('changed');
    await loadTeachers();
  } catch (err) {
    emit('toast', err, 'demoteTeachers');
  } finally {
    demotingId.value = null;
  }
}

async function onPromoted() {
  showPromoteModal.value = false;
  emit('toast', t('admin.teachers.promoted'));
  emit('changed');
  await loadTeachers();
}

onMounted(loadTeachers);
</script>
