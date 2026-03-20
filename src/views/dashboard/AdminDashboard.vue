<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('admin.title') }}</h1>
        <button @click="handleLogout" class="text-sm text-slate-400 hover:text-primary transition">{{ $t('auth.logout') }}</button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <p class="text-3xl font-bold text-primary">{{ stats?.totalEnrolled ?? '-' }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.totalEnrolled') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <p class="text-3xl font-bold text-amber-600">{{ stats?.totalPending ?? '-' }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.totalPending') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <p class="text-3xl font-bold text-blue-600">{{ stats?.upcomingClasses ?? '-' }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.upcomingClasses') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <p class="text-3xl font-bold text-green-600">{{ stats?.recentActivity?.length ?? 0 }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.recentActions') }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
          class="px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-primary text-cream' : 'bg-white text-slate-600 hover:bg-primary/5'">
          {{ $t(tab.label) }}
        </button>
      </div>

      <!-- Pending Enrollments -->
      <div v-if="activeTab === 'enrollments'" class="bg-white rounded-2xl shadow-card p-6">
        <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.pendingEnrollments') }}</h2>
        <div v-if="!enrollments.length" class="text-slate-400 text-sm py-8 text-center">{{ $t('admin.noPending') }}</div>
        <div v-else class="space-y-4">
          <div v-for="req in enrollments" :key="req.id" class="border border-slate-100 rounded-xl p-5">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold text-primary">{{ req.firstName }} {{ req.lastName }}</h3>
                <p class="text-sm text-slate-500">{{ req.email }}</p>
                <p class="text-sm text-slate-400 mt-1">{{ req.country }} · {{ new Date(req.createdAt).toLocaleDateString() }}</p>
                <p v-if="req.phone" class="text-sm text-slate-400">Phone: {{ req.phone }}</p>
                <p v-if="req.whatsapp" class="text-sm text-slate-400">WhatsApp: {{ req.whatsapp }}</p>
                <p v-if="req.telegram" class="text-sm text-slate-400">Telegram: {{ req.telegram }}</p>
                <p v-if="req.enrollmentMessage" class="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg">{{ req.enrollmentMessage }}</p>
              </div>
              <div class="flex gap-2 shrink-0">
                <button @click="handleApprove(req.id)" class="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition">
                  {{ $t('admin.approve') }}
                </button>
                <button @click="handleReject(req.id)" class="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition">
                  {{ $t('admin.reject') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Students -->
      <div v-if="activeTab === 'students'" class="bg-white rounded-2xl shadow-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-primary">{{ $t('admin.enrolledStudents') }}</h2>
          <input v-model="studentSearch" type="text" :placeholder="$t('admin.searchStudents')" class="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
        </div>
        <div v-if="!students.length" class="text-slate-400 text-sm py-8 text-center">{{ $t('admin.noStudents') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100">
                <th class="text-left py-3 px-2 text-slate-500 font-medium">{{ $t('auth.firstName') }}</th>
                <th class="text-left py-3 px-2 text-slate-500 font-medium">{{ $t('auth.email') }}</th>
                <th class="text-left py-3 px-2 text-slate-500 font-medium">{{ $t('auth.country') }}</th>
                <th class="text-left py-3 px-2 text-slate-500 font-medium">{{ $t('admin.enrolled') }}</th>
                <th class="text-left py-3 px-2 text-slate-500 font-medium">{{ $t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in students" :key="s.id" class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="py-3 px-2">{{ s.firstName }} {{ s.lastName }}</td>
                <td class="py-3 px-2 text-slate-500">{{ s.email }}</td>
                <td class="py-3 px-2 text-slate-500">{{ s.country }}</td>
                <td class="py-3 px-2 text-slate-400 text-xs">{{ s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : '-' }}</td>
                <td class="py-3 px-2">
                  <button @click="viewStudent(s.id)" class="text-primary hover:text-primary-800 text-xs font-medium">{{ $t('admin.view') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scheduling -->
      <div v-if="activeTab === 'scheduling'" class="bg-white rounded-2xl shadow-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-primary">{{ $t('admin.classes') }}</h2>
          <button @click="showCreateClass = true" class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">
            {{ $t('admin.createClass') }}
          </button>
        </div>
        <div v-if="!classes.length" class="text-slate-400 text-sm py-8 text-center">{{ $t('admin.noClasses') }}</div>
        <div v-else class="space-y-3">
          <div v-for="cls in classes" :key="cls.id" class="border border-slate-100 rounded-xl p-4" :class="cls.cancelled ? 'opacity-50' : ''">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-primary">{{ cls.title }} <span v-if="cls.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span></h3>
                <p class="text-sm text-slate-500">{{ new Date(cls.startTime).toLocaleString() }} - {{ new Date(cls.endTime).toLocaleTimeString() }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ cls.assignments?.length || 0 }} {{ $t('admin.studentsAssigned') }}</p>
              </div>
              <div v-if="!cls.cancelled" class="flex gap-2">
                <button @click="cancelClass(cls.id)" class="text-red-500 hover:text-red-700 text-xs font-medium">{{ $t('admin.cancel') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div v-if="activeTab === 'activity'" class="bg-white rounded-2xl shadow-card p-6">
        <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.activityLog') }}</h2>
        <div v-if="!stats?.recentActivity?.length" class="text-slate-400 text-sm py-8 text-center">{{ $t('admin.noActivity') }}</div>
        <div v-else class="space-y-2">
          <div v-for="log in stats.recentActivity" :key="log.id" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div>
              <span class="text-sm text-slate-600 font-medium">{{ log.action }}</span>
              <span v-if="log.user" class="text-xs text-slate-400 ltr:ml-2 rtl:mr-2">{{ log.user.firstName }} {{ log.user.lastName }}</span>
            </div>
            <span class="text-xs text-slate-400">{{ new Date(log.createdAt).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Student Detail Modal -->
      <div v-if="selectedStudent" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="selectedStudent = null">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-bold text-primary">{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h2>
            <button @click="selectedStudent = null" class="text-slate-400 hover:text-slate-600">&times;</button>
          </div>
          <div class="space-y-2 text-sm">
            <p><span class="text-slate-400">Email:</span> {{ selectedStudent.email }}</p>
            <p><span class="text-slate-400">Country:</span> {{ selectedStudent.country }}</p>
            <p v-if="selectedStudent.phone"><span class="text-slate-400">Phone:</span> {{ selectedStudent.phone }}</p>
            <p v-if="selectedStudent.whatsapp"><span class="text-slate-400">WhatsApp:</span> {{ selectedStudent.whatsapp }}</p>
            <p v-if="selectedStudent.telegram"><span class="text-slate-400">Telegram:</span> {{ selectedStudent.telegram }}</p>
            <p v-if="selectedStudent.lastLoginAt"><span class="text-slate-400">Last login:</span> {{ new Date(selectedStudent.lastLoginAt).toLocaleString() }}</p>
          </div>

          <!-- Notes -->
          <div class="mt-6">
            <h3 class="font-semibold text-primary mb-3">{{ $t('admin.notes') }}</h3>
            <div v-for="note in selectedStudent.adminNotes" :key="note.id" class="bg-slate-50 rounded-lg p-3 mb-2 text-sm">
              <p>{{ note.content }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ new Date(note.createdAt).toLocaleString() }}</p>
            </div>
            <div class="mt-3">
              <textarea v-model="newNote" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" :placeholder="$t('admin.addNote')"></textarea>
              <button @click="addNote(selectedStudent.id)" class="mt-2 bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 transition">
                {{ $t('admin.saveNote') }}
              </button>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex gap-3">
            <button @click="handleSuspend(selectedStudent.id)" class="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition">
              {{ $t('admin.suspendStudent') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Create Class Modal -->
      <div v-if="showCreateClass" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showCreateClass = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.createClass') }}</h2>
          <form @submit.prevent="createClass" class="space-y-4">
            <input v-model="classForm.title" type="text" required :placeholder="$t('admin.classTitle')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <input v-model="classForm.titleAr" type="text" :placeholder="$t('admin.classTitleAr')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <textarea v-model="classForm.description" rows="2" :placeholder="$t('admin.classDescription')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none"></textarea>
            <div class="grid grid-cols-2 gap-4">
              <input v-model="classForm.startTime" type="datetime-local" required class="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
              <input v-model="classForm.endTime" type="datetime-local" required class="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
            </div>
            <input v-model="classForm.meetingLink" type="url" :placeholder="$t('admin.meetingLink')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <select v-model="classForm.recurrence" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
              <option value="">{{ $t('admin.oneOff') }}</option>
              <option value="weekly">{{ $t('admin.weekly') }}</option>
              <option value="biweekly">{{ $t('admin.biweekly') }}</option>
            </select>
            <div class="flex gap-3 justify-end">
              <button type="button" @click="showCreateClass = false" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
              <button type="submit" class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">{{ $t('admin.create') }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';

const { logout } = useAuth();

const activeTab = ref('enrollments');
const stats = ref(null);
const enrollments = ref([]);
const students = ref([]);
const classes = ref([]);
const studentSearch = ref('');
const selectedStudent = ref(null);
const newNote = ref('');
const showCreateClass = ref(false);

const classForm = reactive({
  title: '', titleAr: '', description: '', startTime: '', endTime: '',
  meetingLink: '', recurrence: '',
});

const tabs = [
  { key: 'enrollments', label: 'admin.enrollments' },
  { key: 'students', label: 'admin.students' },
  { key: 'scheduling', label: 'admin.scheduling' },
  { key: 'activity', label: 'admin.activity' },
];

async function handleLogout() { await logout(); }

async function loadStats() {
  try { stats.value = await api.get('/api/admin/stats'); } catch {}
}

async function loadEnrollments() {
  try {
    const data = await api.get('/api/admin/enrollments/pending');
    enrollments.value = data.requests;
  } catch {}
}

async function loadStudents() {
  try {
    const query = studentSearch.value ? `?search=${encodeURIComponent(studentSearch.value)}` : '';
    const data = await api.get(`/api/admin/students${query}`);
    students.value = data.students;
  } catch {}
}

async function loadClasses() {
  try {
    const data = await api.get('/api/admin/classes');
    classes.value = data.classes;
  } catch {}
}

async function handleApprove(id) {
  try {
    await api.post(`/api/admin/enrollments/${id}/approve`, {});
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
  } catch {}
}

async function handleReject(id) {
  const message = prompt('Rejection message (optional):');
  try {
    await api.post(`/api/admin/enrollments/${id}/reject`, { message });
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
  } catch {}
}

async function viewStudent(id) {
  try {
    const data = await api.get(`/api/admin/students/${id}`);
    selectedStudent.value = data.student;
  } catch {}
}

async function addNote(studentId) {
  if (!newNote.value.trim()) return;
  try {
    const data = await api.post(`/api/admin/students/${studentId}/notes`, { content: newNote.value });
    selectedStudent.value.adminNotes.unshift(data.note);
    newNote.value = '';
  } catch {}
}

async function handleSuspend(id) {
  if (!confirm('Are you sure you want to suspend this student?')) return;
  try {
    await api.post(`/api/admin/students/${id}/suspend`);
    selectedStudent.value = null;
    loadStudents();
    loadStats();
  } catch {}
}

async function cancelClass(id) {
  if (!confirm('Cancel this class? Students will be notified.')) return;
  try {
    await api.post(`/api/admin/classes/${id}/cancel`);
    loadClasses();
  } catch {}
}

async function createClass() {
  try {
    const data = {
      ...classForm,
      startTime: new Date(classForm.startTime).toISOString(),
      endTime: new Date(classForm.endTime).toISOString(),
      recurrence: classForm.recurrence || null,
    };
    await api.post('/api/admin/classes', data);
    showCreateClass.value = false;
    Object.assign(classForm, { title: '', titleAr: '', description: '', startTime: '', endTime: '', meetingLink: '', recurrence: '' });
    loadClasses();
  } catch {}
}

watch(activeTab, (tab) => {
  if (tab === 'enrollments') loadEnrollments();
  if (tab === 'students') loadStudents();
  if (tab === 'scheduling') loadClasses();
});

watch(studentSearch, () => { loadStudents(); });

onMounted(() => {
  loadStats();
  loadEnrollments();
});
</script>
