<template>
  <div class="min-h-screen bg-cream pt-24 pb-12 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('admin.title') }}</h1>
        <div class="flex items-center gap-3">
          <LanguageSwitcher />
          <button @click="handleLogout" class="text-sm text-slate-400 hover:text-primary transition">{{ $t('auth.logout') }}</button>
        </div>
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

      <!-- Upcoming Classes (always visible) -->
      <div class="bg-white rounded-2xl shadow-card p-6 mb-8">
        <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.upcomingClassesTitle') || 'Upcoming Classes' }}</h2>
        <div v-if="!upcomingClasses.length" class="text-slate-400 text-sm py-4 text-center">{{ $t('admin.noUpcomingClasses') || 'No upcoming classes' }}</div>
        <div v-else class="space-y-3">
          <div v-for="cls in upcomingClasses" :key="cls.id"
            class="flex items-center justify-between border border-slate-100 rounded-xl p-4 hover:border-primary/30 transition">
            <div>
              <h3 class="font-semibold text-primary">{{ isAr && cls.titleAr ? cls.titleAr : cls.title }}</h3>
              <p class="text-sm text-slate-500 mt-0.5">{{ formatClassTime(cls.startTime) }} – {{ new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ cls.assignments?.map(a => a.student.firstName + ' ' + a.student.lastName).join(', ') }}</p>
              <p class="text-xs mt-1" :class="classTimeLabel(cls).color">{{ classTimeLabel(cls).text }}</p>
            </div>
            <a v-if="cls.meetingLink || globalMeetingLink"
              :href="cls.meetingLink || globalMeetingLink" target="_blank" rel="noopener"
              class="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition shrink-0 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              {{ $t('admin.joinClass') || 'Join' }}
            </a>
            <span v-else class="text-xs text-slate-400 italic shrink-0">{{ $t('admin.noMeetingLink') || 'No meeting link set' }}</span>
          </div>
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
                <p v-if="req.phone" class="text-sm text-slate-400">{{ $t('admin.phoneLabel') }}: {{ req.phone }}</p>
                <p v-if="req.whatsapp" class="text-sm text-slate-400">{{ $t('admin.whatsappLabel') }}: {{ req.whatsapp }}</p>
                <p v-if="req.telegram" class="text-sm text-slate-400">{{ $t('admin.telegramLabel') }}: {{ req.telegram }}</p>
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
      <div v-if="activeTab === 'scheduling'" class="space-y-4">
        <!-- Global Meeting Link -->
        <div class="bg-white rounded-2xl shadow-card p-4">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-primary whitespace-nowrap">{{ $t('admin.globalMeetingLink') }}</label>
            <input v-model="globalMeetingLink" type="url" :placeholder="$t('admin.meetingLinkPlaceholder')"
              class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
            <button @click="saveMeetingLink" :disabled="savingLink"
              class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50 shrink-0">
              {{ savingLink ? $t('admin.saving') : $t('admin.save') }}
            </button>
          </div>
          <p class="text-xs text-slate-400 mt-1">{{ $t('admin.meetingLinkHint') }}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-primary">{{ $t('admin.classes') }}</h2>
            <div class="flex items-center gap-2">
              <!-- Calendar/List toggle -->
              <div class="flex bg-slate-100 rounded-lg p-0.5">
                <button @click="calendarView = true" class="px-3 py-1 rounded-md text-xs font-medium transition"
                  :class="calendarView ? 'bg-white text-primary shadow-sm' : 'text-slate-500'">
                  {{ $t('admin.calendarView') }}
                </button>
                <button @click="calendarView = false" class="px-3 py-1 rounded-md text-xs font-medium transition"
                  :class="!calendarView ? 'bg-white text-primary shadow-sm' : 'text-slate-500'">
                  {{ $t('admin.listView') }}
                </button>
              </div>
              <button @click="showScheduleForm = true" class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">
                {{ $t('admin.scheduleStudent') }}
              </button>
            </div>
          </div>

          <!-- Calendar View -->
          <div v-if="calendarView">
            <!-- Week navigation -->
            <div class="flex items-center justify-between mb-4">
              <button @click="prevWeek" class="text-slate-500 hover:text-primary text-sm font-medium">&larr; {{ $t('admin.prevWeek') }}</button>
              <div class="flex items-center gap-3">
                <button v-if="!isThisWeek" @click="calendarWeekStart = getMonday(new Date()); selectedClass = null"
                  class="text-xs text-primary border border-primary/30 px-2 py-0.5 rounded-full hover:bg-primary/5 transition">
                  {{ $t('admin.today') }}
                </button>
                <span class="text-sm font-medium text-primary">
                  {{ calendarWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                  &ndash;
                  {{ new Date(calendarWeekStart.getTime() + 6 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }}
                </span>
              </div>
              <button @click="nextWeek" class="text-slate-500 hover:text-primary text-sm font-medium">{{ $t('admin.nextWeek') }} &rarr;</button>
            </div>

            <!-- 7-day grid -->
            <div class="grid grid-cols-7 gap-2">
              <!-- Day headers -->
              <div v-for="(day, i) in calendarDays" :key="'h'+i"
                class="text-center text-xs font-medium pb-1 border-b border-slate-100"
                :class="day.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-500'">
                {{ $t('admin.' + DAY_KEYS[(day.getDay())]) }}
                <span class="block text-lg font-bold" :class="day.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-700'">{{ day.getDate() }}</span>
              </div>

              <!-- Day columns -->
              <div v-for="(day, i) in calendarDays" :key="'d'+i" class="min-h-[100px]">
                <div v-for="cls in classesByDay[day.toISOString().split('T')[0]] || []" :key="cls.id"
                  @click="selectedClass = cls"
                  class="mb-1 rounded-lg p-2 text-xs cursor-pointer hover:ring-2 hover:ring-primary/30 transition"
                  :class="[cls.cancelled ? 'bg-slate-100 text-slate-400 line-through' : 'bg-primary/10 text-primary', selectedClass?.id === cls.id ? 'ring-2 ring-primary' : '']">
                  <p class="font-medium truncate">{{ isAr && cls.titleAr ? cls.titleAr : cls.title }}</p>
                  <p class="text-[10px] opacity-70">{{ new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div v-if="!(classesByDay[day.toISOString().split('T')[0]] || []).length" class="text-[10px] text-slate-300 text-center pt-4">—</div>
              </div>
            </div>

            <!-- Selected class detail -->
            <div v-if="selectedClass" class="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-primary">{{ isAr && selectedClass.titleAr ? selectedClass.titleAr : selectedClass.title }}
                    <span v-if="selectedClass.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span>
                  </h3>
                  <p class="text-sm text-slate-500 mt-1">{{ new Date(selectedClass.startTime).toLocaleString() }} – {{ new Date(selectedClass.endTime).toLocaleTimeString() }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ selectedClass.assignments?.length || 0 }} {{ $t('admin.studentsAssigned') }}</p>
                  <div v-if="selectedClass.assignments?.length" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="a in selectedClass.assignments" :key="a.student.id" class="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                      {{ a.student.firstName }} {{ a.student.lastName }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button v-if="!selectedClass.cancelled" @click="cancelClass(selectedClass.id); selectedClass = null" class="text-red-500 hover:text-red-700 text-xs font-medium">{{ $t('admin.cancel') }}</button>
                  <button @click="selectedClass = null" class="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
              </div>
            </div>
          </div>

          <!-- List View (original) -->
          <div v-else>
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
            <p><span class="text-slate-400">{{ $t('admin.emailLabel') }}:</span> {{ selectedStudent.email }}</p>
            <p><span class="text-slate-400">{{ $t('admin.countryLabel') }}:</span> {{ selectedStudent.country }}</p>
            <p v-if="selectedStudent.phone"><span class="text-slate-400">{{ $t('admin.phoneLabel') }}:</span> {{ selectedStudent.phone }}</p>
            <p v-if="selectedStudent.whatsapp"><span class="text-slate-400">{{ $t('admin.whatsappLabel') }}:</span> {{ selectedStudent.whatsapp }}</p>
            <p v-if="selectedStudent.telegram"><span class="text-slate-400">{{ $t('admin.telegramLabel') }}:</span> {{ selectedStudent.telegram }}</p>
            <p v-if="selectedStudent.lastLoginAt"><span class="text-slate-400">{{ $t('admin.lastLogin') }}:</span> {{ new Date(selectedStudent.lastLoginAt).toLocaleString() }}</p>
          </div>

          <!-- Student's Classes -->
          <div class="mt-6">
            <h3 class="font-semibold text-primary mb-3">{{ $t('admin.studentClasses') }}</h3>
            <div v-if="!studentClasses.length" class="text-slate-400 text-sm">{{ $t('admin.noStudentClasses') }}</div>
            <div v-else class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="a in studentClasses" :key="a.id" class="border border-slate-100 rounded-lg p-3 text-sm"
                :class="a.classSession.cancelled ? 'opacity-50' : ''">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-medium text-primary">{{ isAr && a.classSession.titleAr ? a.classSession.titleAr : a.classSession.title }}
                      <span v-if="a.classSession.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span>
                    </p>
                    <p class="text-xs text-slate-500">{{ new Date(a.classSession.startTime).toLocaleString() }} - {{ new Date(a.classSession.endTime).toLocaleTimeString() }}</p>
                    <p v-if="a.classSession.recurrence" class="text-xs text-slate-400">{{ a.classSession.recurrence }}</p>
                  </div>
                  <span :class="new Date(a.classSession.startTime) > new Date() ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
                    class="text-xs px-2 py-0.5 rounded-full shrink-0">
                    {{ new Date(a.classSession.startTime) > new Date() ? $t('admin.upcoming') : $t('admin.past') }}
                  </span>
                </div>
              </div>
            </div>
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

      <!-- Schedule Student Modal -->
      <div v-if="showScheduleForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showScheduleForm = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.scheduleStudent') }}</h2>
          <form @submit.prevent="scheduleStudent" class="space-y-4">
            <!-- Student -->
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.selectStudent') }}</label>
              <select v-model="scheduleForm.studentId" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="" disabled>{{ $t('admin.selectStudent') }}</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
              </select>
            </div>

            <!-- Days of week -->
            <div>
              <label class="block text-sm text-slate-500 mb-2">{{ $t('admin.classDays') }}</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="(dayKey, i) in FULL_DAY_KEYS" :key="i"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer text-sm transition"
                  :class="scheduleForm.days.includes(i) ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300'">
                  <input type="checkbox" :value="i" v-model="scheduleForm.days" class="sr-only" />
                  {{ $t('admin.' + dayKey) }}
                </label>
              </div>
            </div>

            <!-- Time -->
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.classTime') }}</label>
              <input v-model="scheduleForm.time" type="time" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.duration') }}</label>
              <select v-model="scheduleForm.duration" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="30">30 {{ $t('admin.minutes') }}</option>
                <option value="45">45 {{ $t('admin.minutes') }}</option>
                <option value="60">1 {{ $t('admin.hour') }}</option>
                <option value="90">1.5 {{ $t('admin.hours') }}</option>
                <option value="120">2 {{ $t('admin.hours') }}</option>
              </select>
            </div>

            <!-- Weeks -->
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.repeatUntil') }}</label>
              <select v-model="scheduleForm.weeks" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="4">4 {{ $t('admin.weeks') }}</option>
                <option value="8">8 {{ $t('admin.weeks') }}</option>
                <option value="12">12 {{ $t('admin.weeks') }}</option>
                <option value="24">24 {{ $t('admin.weeks') }}</option>
                <option value="52">52 {{ $t('admin.weeks') }} (1 {{ $t('admin.year') }})</option>
              </select>
            </div>

            <!-- Preview -->
            <div v-if="scheduleForm.days.length && scheduleForm.studentId" class="bg-primary/5 rounded-lg p-3 text-sm text-primary">
              {{ schedulePreview }}
            </div>

            <div class="flex gap-3 justify-end">
              <button type="button" @click="showScheduleForm = false" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
              <button type="submit" :disabled="creatingClass || !scheduleForm.days.length || !scheduleForm.studentId"
                class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                {{ creatingClass ? $t('admin.creating') : $t('admin.scheduleNow') }}
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Toast -->
      <Transition name="fade">
        <div v-if="toast" class="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div class="bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm pointer-events-auto">{{ toast }}</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';

const { locale, t } = useI18n();
const { logout } = useAuth();

const isAr = computed(() => locale.value === 'ar');

const activeTab = ref('enrollments');
const stats = ref(null);
const enrollments = ref([]);
const students = ref([]);
const classes = ref([]);
const studentSearch = ref('');
const selectedStudent = ref(null);
const newNote = ref('');
const showScheduleForm = ref(false);
const creatingClass = ref(false);
const selectedClass = ref(null);
const toast = ref('');
const globalMeetingLink = ref('');
const savingLink = ref(false);

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const FULL_DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Simplified schedule form
const scheduleForm = reactive({
  studentId: '',
  days: [],      // array of dayOfWeek numbers (0=Sun, 1=Mon, ...)
  time: '15:00', // HH:MM
  duration: '60', // minutes
  weeks: '12',
});

// Calendar state
const calendarView = ref(true); // true = calendar, false = list
const calendarWeekStart = ref(getMonday(new Date()));

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function prevWeek() {
  calendarWeekStart.value = new Date(calendarWeekStart.value.getTime() - 7 * 86400000);
}
function nextWeek() {
  calendarWeekStart.value = new Date(calendarWeekStart.value.getTime() + 7 * 86400000);
}

const calendarDays = computed(() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(calendarWeekStart.value.getTime() + i * 86400000);
    days.push(d);
  }
  return days;
});

const classesByDay = computed(() => {
  const map = {};
  for (const d of calendarDays.value) {
    const key = d.toISOString().split('T')[0];
    map[key] = [];
  }
  for (const cls of classes.value) {
    const key = new Date(cls.startTime).toISOString().split('T')[0];
    if (map[key]) map[key].push(cls);
  }
  // Sort each day's classes by start time
  for (const key in map) map[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  return map;
});

const isThisWeek = computed(() => {
  const now = getMonday(new Date());
  return calendarWeekStart.value.getTime() === now.getTime();
});

const upcomingClasses = computed(() => {
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return classes.value
    .filter(cls => !cls.cancelled && new Date(cls.startTime) >= now && new Date(cls.startTime) <= threeDays)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 10);
});

function formatClassTime(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Today, ${timeStr}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${timeStr}`;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + timeStr;
}

function classTimeLabel(cls) {
  const now = new Date();
  const start = new Date(cls.startTime);
  const end = new Date(cls.endTime);
  const diffMin = Math.round((start - now) / 60000);

  if (now >= start && now <= end) return { text: 'Live now', color: 'text-green-600 font-semibold' };
  if (diffMin <= 30 && diffMin > 0) return { text: `Starts in ${diffMin} min`, color: 'text-amber-600 font-medium' };
  if (diffMin <= 60 && diffMin > 0) return { text: `In ${diffMin} minutes`, color: 'text-blue-600' };
  return { text: '', color: '' };
}

const studentClasses = computed(() => {
  if (!selectedStudent.value?.classAssignments) return [];
  return selectedStudent.value.classAssignments;
});

const schedulePreview = computed(() => {
  const weeks = parseInt(scheduleForm.weeks) || 12;
  const totalSessions = scheduleForm.days.length * weeks;
  const dayNames = scheduleForm.days.map(d => t('admin.' + FULL_DAY_KEYS[d])).join(', ');
  const student = students.value.find(s => s.id === scheduleForm.studentId);
  const name = student ? `${student.firstName} ${student.lastName}` : '';
  return `${totalSessions} ${t('admin.classesFor')} ${name} — ${dayNames} ${t('admin.at')} ${scheduleForm.time}`;
});

const tabs = [
  { key: 'enrollments', label: 'admin.enrollments' },
  { key: 'students', label: 'admin.students' },
  { key: 'scheduling', label: 'admin.scheduling' },
  { key: 'activity', label: 'admin.activity' },
];

function showToast(err) {
  const msg = err?.message || err?.data?.error || t('admin.error') || 'Error';
  toast.value = msg;
  setTimeout(() => { toast.value = ''; }, 3000);
}

async function handleLogout() { await logout(); }

async function loadStats() {
  try { stats.value = await api.get('/api/admin/stats'); } catch (e) { showToast(e); }
}

async function loadEnrollments() {
  try {
    const data = await api.get('/api/admin/enrollments/pending');
    enrollments.value = data.requests;
  } catch (e) { showToast(e); }
}

async function loadStudents() {
  try {
    const query = studentSearch.value ? `?search=${encodeURIComponent(studentSearch.value)}` : '';
    const data = await api.get(`/api/admin/students${query}`);
    students.value = data.students;
  } catch (e) { showToast(e); }
}

async function loadClasses() {
  try {
    const data = await api.get('/api/admin/classes?limit=200');
    classes.value = data.classes;
  } catch (e) { showToast(e); }
}

async function loadSettings() {
  try {
    const data = await api.get('/api/admin/settings');
    globalMeetingLink.value = data.settings?.meetingLink || '';
  } catch {}
}

async function saveMeetingLink() {
  if (!globalMeetingLink.value) return;
  savingLink.value = true;
  try {
    await api.put('/api/admin/settings/meeting-link', { meetingLink: globalMeetingLink.value });
  } catch (e) { showToast(e); } finally {
    savingLink.value = false;
  }
}

async function handleApprove(id) {
  try {
    await api.post(`/api/admin/enrollments/${id}/approve`, {});
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
  } catch (e) { showToast(e); }
}

async function handleReject(id) {
  const message = prompt(t('admin.rejectPrompt'));
  try {
    await api.post(`/api/admin/enrollments/${id}/reject`, { message });
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
  } catch (e) { showToast(e); }
}

async function viewStudent(id) {
  try {
    const data = await api.get(`/api/admin/students/${id}`);
    selectedStudent.value = data.student;
  } catch (e) { showToast(e); }
}

async function addNote(studentId) {
  if (!newNote.value.trim()) return;
  try {
    const data = await api.post(`/api/admin/students/${studentId}/notes`, { content: newNote.value });
    selectedStudent.value.adminNotes.unshift(data.note);
    newNote.value = '';
  } catch (e) { showToast(e); }
}

async function handleSuspend(id) {
  if (!confirm(t('admin.suspendConfirm'))) return;
  try {
    await api.post(`/api/admin/students/${id}/suspend`);
    selectedStudent.value = null;
    loadStudents();
    loadStats();
  } catch (e) { showToast(e); }
}

async function cancelClass(id) {
  if (!confirm(t('admin.cancelConfirm'))) return;
  try {
    await api.post(`/api/admin/classes/${id}/cancel`);
    loadClasses();
  } catch (e) { showToast(e); }
}

function getNextDayOfWeek(dayOfWeek, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const result = new Date(now);
  result.setHours(h, m, 0, 0);
  const currentDay = now.getDay();
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil < 0 || (daysUntil === 0 && result <= now)) daysUntil += 7;
  result.setDate(result.getDate() + daysUntil);
  return result;
}

async function scheduleStudent() {
  if (creatingClass.value) return;
  creatingClass.value = true;
  try {
    const student = students.value.find(s => s.id === scheduleForm.studentId);
    const title = student ? `${student.firstName} ${student.lastName}` : 'Class';
    const durationMs = parseInt(scheduleForm.duration) * 60000;
    const weeks = parseInt(scheduleForm.weeks) || 12;

    const sessions = [];
    for (const day of scheduleForm.days) {
      const firstOccurrence = getNextDayOfWeek(day, scheduleForm.time);
      for (let w = 0; w < weeks; w++) {
        const start = new Date(firstOccurrence.getTime() + w * 7 * 86400000);
        const end = new Date(start.getTime() + durationMs);
        sessions.push({ startTime: start.toISOString(), endTime: end.toISOString() });
      }
    }

    await api.post('/api/admin/classes/batch', {
      studentId: scheduleForm.studentId,
      title,
      sessions,
    });

    showScheduleForm.value = false;
    Object.assign(scheduleForm, { studentId: '', days: [], time: '15:00', duration: '60', weeks: '12' });
    loadClasses();
  } catch (e) { showToast(e); } finally {
    creatingClass.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'enrollments') loadEnrollments();
  if (tab === 'students') loadStudents();
  if (tab === 'scheduling') { loadClasses(); loadSettings(); }
});

watch(studentSearch, () => { loadStudents(); });
watch(showScheduleForm, (v) => { if (v && !students.value.length) loadStudents(); });

onMounted(() => {
  loadStats();
  loadEnrollments();
  loadClasses();
  loadSettings();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
