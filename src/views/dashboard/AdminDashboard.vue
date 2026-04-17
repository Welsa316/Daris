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
          <template v-if="statsError">
            <button @click="loadStats" class="text-xs text-red-600 hover:text-red-700 underline">
              {{ $t('admin.statsFailed') }}
            </button>
          </template>
          <template v-else>
            <p class="text-3xl font-bold text-primary">{{ stats?.totalEnrolled ?? '-' }}</p>
          </template>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.totalEnrolled') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <template v-if="statsError">
            <button @click="loadStats" class="text-xs text-red-600 hover:text-red-700 underline">
              {{ $t('admin.statsFailed') }}
            </button>
          </template>
          <template v-else>
            <p class="text-3xl font-bold text-amber-600">{{ stats?.totalPending ?? '-' }}</p>
          </template>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.totalPending') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <template v-if="statsError">
            <button @click="loadStats" class="text-xs text-red-600 hover:text-red-700 underline">
              {{ $t('admin.statsFailed') }}
            </button>
          </template>
          <template v-else>
            <p class="text-3xl font-bold text-blue-600">{{ stats?.upcomingClasses ?? '-' }}</p>
          </template>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.upcomingClasses') }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-card p-5 text-center">
          <template v-if="statsError">
            <button @click="loadStats" class="text-xs text-red-600 hover:text-red-700 underline">
              {{ $t('admin.statsFailed') }}
            </button>
          </template>
          <template v-else>
            <p class="text-3xl font-bold text-green-600">{{ stats?.recentActivity?.length ?? 0 }}</p>
          </template>
          <p class="text-sm text-slate-500 mt-1">{{ $t('admin.recentActions') }}</p>
        </div>
      </div>

      <!-- Upcoming Classes (always visible) -->
      <div class="bg-white rounded-2xl shadow-card p-6 mb-8">
        <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.upcomingClassesTitle') }}</h2>
        <div v-if="!upcomingClasses.length" class="text-slate-400 text-sm py-4 text-center">{{ $t('admin.noUpcomingClasses') }}</div>
        <div v-else class="space-y-3">
          <div v-for="cls in upcomingClasses" :key="cls.id"
            class="flex items-center justify-between border border-slate-100 rounded-xl p-4 hover:border-primary/30 transition">
            <div>
              <h3 class="font-semibold text-primary">{{ classDisplayName(cls) }}</h3>
              <p class="text-sm text-slate-500 mt-0.5">{{ formatClassTime(cls.startTime) }} – {{ new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
              <p class="text-xs mt-1" :class="classTimeLabel(cls).color">{{ classTimeLabel(cls).text }}</p>
            </div>
            <template v-if="cls.meetingLink || globalMeetingLink">
              <a v-if="isJoinable(cls)"
                :href="cls.meetingLink || globalMeetingLink" target="_blank" rel="noopener"
                class="bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition shrink-0 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                {{ $t('admin.joinClass') }}
              </a>
              <span v-else class="text-xs text-slate-400 italic shrink-0 text-end" :title="new Date(cls.startTime).toLocaleString()">
                {{ joinAvailabilityLabel(cls) }}
              </span>
            </template>
            <span v-else class="text-xs text-slate-400 italic shrink-0">{{ $t('admin.noMeetingLink') }}</span>
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
              <button v-if="classes.length" @click="deleteAllClasses" class="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition">
                {{ $t('admin.deleteAll') }}
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
                  :class="[cls.cancelled ? 'bg-slate-100 text-slate-400 line-through' : cls.rescheduled ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-primary/10 text-primary', selectedClass?.id === cls.id ? 'ring-2 ring-primary' : '']">
                  <p class="font-medium truncate">{{ classDisplayName(cls) }}</p>
                  <p class="text-[10px] opacity-70">{{ new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div v-if="!(classesByDay[day.toISOString().split('T')[0]] || []).length" class="text-[10px] text-slate-300 text-center pt-4">—</div>
              </div>
            </div>

            <!-- Selected class detail -->
            <div v-if="selectedClass" class="mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold text-primary">{{ classDisplayName(selectedClass) }}
                    <span v-if="selectedClass.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span>
                    <span v-if="selectedClass.rescheduled" class="text-amber-600 text-xs">({{ $t('admin.rescheduled') }})</span>
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
                  <button v-if="!selectedClass.cancelled" @click="openReschedule(selectedClass)" class="text-amber-600 hover:text-amber-700 text-xs font-medium">{{ $t('admin.reschedule') }}</button>
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
                    <h3 class="font-semibold text-primary">{{ classDisplayName(cls) }} <span v-if="cls.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span><span v-if="cls.rescheduled" class="text-amber-600 text-xs"> ({{ $t('admin.rescheduled') }})</span></h3>
                    <p class="text-sm text-slate-500">{{ new Date(cls.startTime).toLocaleString() }} - {{ new Date(cls.endTime).toLocaleTimeString() }}</p>
                    <p class="text-xs text-slate-400 mt-1">{{ cls.assignments?.length || 0 }} {{ $t('admin.studentsAssigned') }}</p>
                  </div>
                  <div v-if="!cls.cancelled" class="flex gap-2">
                    <button @click="openReschedule(cls)" class="text-amber-600 hover:text-amber-700 text-xs font-medium">{{ $t('admin.reschedule') }}</button>
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

          <!-- Tabs: Classes | Payments | Export -->
          <div class="mt-6 border-b border-slate-100 flex gap-1">
            <button
              v-for="tab in ['classes', 'payments', 'export']"
              :key="tab"
              @click="studentDetailTab = tab"
              class="px-4 py-2 text-sm font-medium border-b-2 transition"
              :class="studentDetailTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'"
            >
              {{ $t('admin.tab.' + tab) }}
            </button>
          </div>

          <!-- Loading skeleton shown across all tabs while fetching -->
          <div v-if="studentDetailLoading" class="mt-4 space-y-2" aria-hidden="true">
            <div class="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
            <div class="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
            <div class="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>

          <!-- Classes tab: list + per-class log expander -->
          <div v-else-if="studentDetailTab === 'classes'" class="mt-4">
            <div v-if="!studentClasses.length" class="text-slate-400 text-sm py-4">{{ $t('admin.noStudentClasses') }}</div>
            <div v-else class="space-y-2 max-h-80 overflow-y-auto">
              <div v-for="a in studentClasses" :key="a.id" class="border border-slate-100 rounded-lg p-3 text-sm"
                :class="a.classSession.cancelled ? 'opacity-50' : ''">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium text-primary">{{ isAr && a.classSession.titleAr ? a.classSession.titleAr : a.classSession.title }}
                      <span v-if="a.classSession.cancelled" class="text-red-500 text-xs">({{ $t('admin.cancelled') }})</span>
                      <span v-if="a.classSession.rescheduled" class="text-amber-600 text-xs">({{ $t('admin.rescheduled') }})</span>
                    </p>
                    <p class="text-xs text-slate-500">{{ new Date(a.classSession.startTime).toLocaleString() }} - {{ new Date(a.classSession.endTime).toLocaleTimeString() }}</p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <span :class="new Date(a.classSession.startTime) > new Date() ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'"
                      class="text-xs px-2 py-0.5 rounded-full">
                      {{ new Date(a.classSession.startTime) > new Date() ? $t('admin.upcoming') : $t('admin.past') }}
                    </span>
                    <button
                      @click="expandClassLog(a.classSession.id)"
                      class="text-xs text-primary hover:text-primary-800 underline"
                    >
                      {{ expandedLogClassId === a.classSession.id
                        ? $t('admin.classLog.close')
                        : (logForClass(a.classSession.id) ? $t('admin.classLog.edit') : $t('admin.classLog.add')) }}
                    </button>
                  </div>
                </div>

                <!-- Expanded: existing log summary + edit form -->
                <div v-if="expandedLogClassId === a.classSession.id" class="mt-3 border-t border-slate-100 pt-3 space-y-2">
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">{{ $t('admin.classLog.summaryLabel') }}</label>
                    <textarea v-model="logDraft.summary" rows="3"
                      class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none"
                      :placeholder="$t('admin.classLog.summaryPh')"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-500 mb-1">{{ $t('admin.classLog.nextStepsLabel') }}</label>
                    <textarea v-model="logDraft.nextSteps" rows="2"
                      class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none"
                      :placeholder="$t('admin.classLog.nextStepsPh')"
                    ></textarea>
                  </div>
                  <div class="flex justify-end gap-2">
                    <button @click="expandedLogClassId = null"
                      class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">
                      {{ $t('admin.cancel') }}
                    </button>
                    <button @click="saveClassLog(a.classSession.id, selectedStudent.id)"
                      :disabled="savingLog"
                      class="bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                      {{ savingLog ? $t('admin.saving') : $t('admin.classLog.save') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <button
                @click="clearUpcomingClasses(selectedStudent.id)"
                :disabled="clearingUpcoming"
                class="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-200 transition disabled:opacity-50"
              >
                {{ clearingUpcoming ? $t('admin.saving') : $t('admin.clearUpcoming') }}
              </button>
              <button @click="handleSuspend(selectedStudent.id)"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition">
                {{ $t('admin.suspendStudent') }}
              </button>
            </div>
          </div>

          <!-- Payments tab -->
          <div v-else-if="studentDetailTab === 'payments'" class="mt-4">
            <div v-if="Object.keys(studentPaymentTotals).length" class="mb-4 bg-primary/5 rounded-lg p-3 text-sm">
              <span class="text-slate-500">{{ $t('admin.payments.total') }}:</span>
              <span v-for="(minor, cur) in studentPaymentTotals" :key="cur" class="ms-2 font-medium text-primary">
                {{ formatMoney(minor, cur) }}
              </span>
            </div>
            <div v-if="!studentPayments.length" class="text-slate-400 text-sm py-4">{{ $t('admin.payments.none') }}</div>
            <div v-else class="space-y-2 max-h-72 overflow-y-auto">
              <div v-for="p in studentPayments" :key="p.id" class="border border-slate-100 rounded-lg p-3 text-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium text-primary">{{ formatMoney(p.amount, p.currency) }} · {{ p.period }}</p>
                    <p class="text-xs text-slate-500">{{ new Date(p.paidAt).toLocaleDateString() }}</p>
                    <p v-if="p.notes" class="text-xs text-slate-400 mt-1">{{ p.notes }}</p>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button @click="openPaymentForm(p)" class="text-xs text-primary hover:text-primary-800 underline">{{ $t('admin.edit') }}</button>
                    <button @click="deletePayment(p.id, selectedStudent.id)" class="text-xs text-red-500 hover:text-red-700 underline">{{ $t('admin.delete') }}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <button v-if="!showPaymentForm" @click="openPaymentForm(null)"
                class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">
                + {{ $t('admin.payments.record') }}
              </button>
              <div v-else class="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                <h4 class="font-medium text-primary">{{ editingPaymentId ? $t('admin.payments.editTitle') : $t('admin.payments.recordTitle') }}</h4>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.amount') }}</label>
                    <input v-model="paymentForm.amount" type="number" step="0.01" min="0"
                      class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white" />
                  </div>
                  <div>
                    <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.currency') }}</label>
                    <select v-model="paymentForm.currency"
                      class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white">
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
                  <input v-model="paymentForm.period" type="text"
                    :placeholder="$t('admin.payments.periodPh')"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.paidAt') }}</label>
                  <input v-model="paymentForm.paidAt" type="date" dir="ltr"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white" />
                </div>
                <div>
                  <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.payments.notes') }}</label>
                  <textarea v-model="paymentForm.notes" rows="2"
                    :placeholder="$t('admin.payments.notesPh')"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none bg-white"></textarea>
                </div>
                <div class="flex justify-end gap-2">
                  <button @click="showPaymentForm = false"
                    class="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
                  <button @click="savePayment(selectedStudent.id)" :disabled="savingPayment"
                    class="bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                    {{ savingPayment ? $t('admin.saving') : $t('admin.payments.save') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Export tab -->
          <div v-else-if="studentDetailTab === 'export'" class="mt-4 space-y-3">
            <p class="text-sm text-slate-500">{{ $t('admin.export.desc') }}</p>
            <button @click="downloadStudentCsv(selectedStudent.id)"
              class="w-full bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">
              {{ $t('admin.export.student') }}
            </button>
            <button @click="downloadAllPaymentsCsv"
              class="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-200 transition">
              {{ $t('admin.export.allPayments') }}
            </button>
            <button @click="downloadAllClassLogsCsv"
              class="w-full bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-200 transition">
              {{ $t('admin.export.allClassLogs') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Schedule Student Modal -->
      <div v-if="showScheduleForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeScheduleForm">
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
              <input v-model="scheduleForm.time" type="time" required dir="ltr" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
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

            <!-- Inline conflict banner. Appears after check-conflicts finds
                 overlaps; stays inside this same form so there's no modal-stack. -->
            <div v-if="conflictModal.conflicts.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div>
                <p class="text-sm font-semibold text-amber-900">{{ $t('admin.conflict.title') }}</p>
                <p class="text-xs text-amber-800 mt-0.5">{{ $t('admin.conflict.subtitle') }}</p>
              </div>

              <!-- Existing-slot group: merge / create separate / skip -->
              <div v-if="existingSlotConflicts.length" class="bg-white/70 border border-amber-100 rounded-lg p-3">
                <p class="text-xs font-medium text-primary mb-1">
                  {{ $t('admin.conflict.existingSlotGroup').replace('{count}', existingSlotConflicts.length) }}
                </p>
                <p class="text-[11px] text-slate-500 mb-2">{{ conflictGroupPreview(existingSlotConflicts) }}</p>
                <div class="space-y-1.5 text-sm">
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="bulk-existing" value="merge" v-model="conflictModal.bulkExisting" class="mt-0.5" />
                    <span>{{ $t('admin.conflict.merge') }}</span>
                  </label>
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="bulk-existing" value="create" v-model="conflictModal.bulkExisting" class="mt-0.5" />
                    <span>{{ $t('admin.conflict.createSeparate') }}</span>
                  </label>
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="bulk-existing" value="skip" v-model="conflictModal.bulkExisting" class="mt-0.5" />
                    <span>{{ $t('admin.conflict.skip') }}</span>
                  </label>
                </div>
              </div>

              <!-- Same-student group: skip / force -->
              <div v-if="sameStudentConflicts.length" class="bg-white/70 border border-amber-100 rounded-lg p-3">
                <p class="text-xs font-medium text-amber-800 mb-1">
                  {{ $t('admin.conflict.sameStudentGroup').replace('{count}', sameStudentConflicts.length) }}
                </p>
                <p class="text-[11px] text-amber-700 mb-2">{{ conflictGroupPreview(sameStudentConflicts) }}</p>
                <div class="space-y-1.5 text-sm">
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="bulk-same" value="skip" v-model="conflictModal.bulkSame" class="mt-0.5" />
                    <span>{{ $t('admin.conflict.skip') }}</span>
                  </label>
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="bulk-same" value="force" v-model="conflictModal.bulkSame" class="mt-0.5" />
                    <span>{{ $t('admin.conflict.scheduleAnyway') }}</span>
                  </label>
                </div>
              </div>

              <details class="text-xs text-amber-800">
                <summary class="cursor-pointer hover:text-amber-900">
                  {{ $t('admin.conflict.showSessions').replace('{count}', conflictModal.conflicts.length) }}
                </summary>
                <ul class="mt-2 space-y-1 list-disc list-inside">
                  <li v-for="c in conflictModal.conflicts" :key="c.startTime">
                    {{ formatConflictTime(c.startTime) }}
                  </li>
                </ul>
              </details>
            </div>

            <div class="flex gap-3 justify-end">
              <button type="button" @click="closeScheduleForm" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
              <button type="submit" :disabled="creatingClass || !scheduleForm.days.length || !scheduleForm.studentId"
                class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                <template v-if="creatingClass">{{ $t('admin.creating') }}</template>
                <template v-else-if="conflictModal.conflicts.length">{{ $t('admin.conflict.confirm') }}</template>
                <template v-else>{{ $t('admin.scheduleNow') }}</template>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Reschedule Modal -->
      <div v-if="showRescheduleModal && rescheduleTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showRescheduleModal = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-bold text-primary">{{ $t('admin.rescheduleTitle') }}</h2>
            <button @click="showRescheduleModal = false" class="text-slate-400 hover:text-slate-600">&times;</button>
          </div>
          <p class="text-sm text-slate-500 mb-4">{{ rescheduleTarget.title }}</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.newDate') }}</label>
              <input v-model="rescheduleDate" type="date" dir="ltr" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
            </div>
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.newTime') }}</label>
              <input v-model="rescheduleTime" type="time" dir="ltr" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
            </div>
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button @click="showRescheduleModal = false" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
            <button @click="rescheduleClass" :disabled="!rescheduleDate || !rescheduleTime"
              class="bg-amber-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50">
              {{ $t('admin.reschedule') }}
            </button>
          </div>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';
import { confirmDialog, promptDialog } from '@/composables/useConfirmDialog.js';
import { queueUndoable } from '@/composables/useUndoToast.js';

const { locale, t } = useI18n();
const { logout } = useAuth();

// Admin locale is controlled by the LanguageSwitcher in the header. We used
// to force Arabic on mount, but that fought with the toggle the sheikh now
// uses to flip between views — it just snapped back to Arabic on every
// component re-render.

const isAr = computed(() => locale.value === 'ar');

const activeTab = ref('enrollments');
const stats = ref(null);
const statsError = ref(false);
const enrollments = ref([]);
const students = ref([]);
const classes = ref([]);
const studentSearch = ref('');
const selectedStudent = ref(null);
const showScheduleForm = ref(false);
const creatingClass = ref(false);
const selectedClass = ref(null);
const toast = ref('');
const globalMeetingLink = ref('');
const savingLink = ref(false);
const showRescheduleModal = ref(false);
const rescheduleTarget = ref(null);
const rescheduleDate = ref('');
const rescheduleTime = ref('');

// --- Student detail expansion: tabs + per-student data -------------------
// The old modal had a single free-form notes textbox. It's now replaced with
// a Classes / Payments / Export tab switcher, backed by the server.
const studentDetailTab = ref('classes');
const studentDetailLoading = ref(false);
const studentClassLogs = ref([]);
const studentPayments = ref([]);
const studentPaymentTotals = ref({});
const expandedLogClassId = ref(null);
const logDraft = reactive({ summary: '', nextSteps: '' });
const savingLog = ref(false);

const showPaymentForm = ref(false);
const editingPaymentId = ref(null);
const paymentForm = reactive({
  amount: '',
  currency: 'EGP',
  period: '',
  paidAt: new Date().toISOString().slice(0, 10),
  notes: '',
});
const savingPayment = ref(false);
const clearingUpcoming = ref(false);

// --- Conflict resolution modal -------------------------------------------
// One decision per *kind* (not per session). We found the sheikh was being
// asked to pick 12x "merge" in a row for a recurring class — so now the
// modal asks once for all existing_slot conflicts and once for all
// same_student conflicts.
// Inline conflict banner state. Conflict modal no longer opens — the banner
// lives inside the schedule form itself. `conflicts.length > 0` is what
// drives the banner's visibility.
const conflictModal = reactive({
  conflicts: [], // raw array from /classes/check-conflicts
  bulkExisting: 'merge', // merge | create | skip — applied to every existing_slot conflict
  bulkSame: 'skip',      // skip | force — applied to every same_student conflict
  pendingPayload: null,
});

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
    .filter(cls =>
      !cls.cancelled
      && new Date(cls.startTime) >= now
      && new Date(cls.startTime) <= threeDays
      // Drop classes whose only students have been removed — backend already
      // strips soft-deleted assignments, so length === 0 means nobody is left.
      && (cls.assignments?.length ?? 0) > 0
    )
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 10);
});

function formatClassTime(iso) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const localeTag = isAr.value ? 'ar-EG' : undefined;
  const timeStr = d.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) {
    return t('admin.relativeToday').replace('{time}', timeStr);
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return t('admin.relativeTomorrow').replace('{time}', timeStr);
  }
  const dateStr = d.toLocaleDateString(localeTag, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

function classTimeLabel(cls) {
  const now = new Date();
  const start = new Date(cls.startTime);
  const end = new Date(cls.endTime);
  const diffMin = Math.round((start - now) / 60000);

  if (now >= start && now <= end) {
    return { text: t('admin.liveNow'), color: 'text-green-600 font-semibold' };
  }
  if (diffMin <= 30 && diffMin > 0) {
    return {
      text: t('admin.startsInMin').replace('{n}', diffMin),
      color: 'text-amber-600 font-medium',
    };
  }
  if (diffMin <= 60 && diffMin > 0) {
    return {
      text: t('admin.inMinutes').replace('{n}', diffMin),
      color: 'text-blue-600',
    };
  }
  return { text: '', color: '' };
}

const studentClasses = computed(() => {
  if (!selectedStudent.value?.classAssignments) return [];
  return selectedStudent.value.classAssignments;
});

const existingSlotConflicts = computed(() =>
  (conflictModal.conflicts || []).filter((c) => c.kind === 'existing_slot')
);
const sameStudentConflicts = computed(() =>
  (conflictModal.conflicts || []).filter((c) => c.kind === 'same_student')
);

// Reads naturally in both directions instead of forcing an English-structured
// sentence into Arabic. Uses a single key per locale with placeholders.
const schedulePreview = computed(() => {
  const weeks = parseInt(scheduleForm.weeks) || 12;
  const totalSessions = scheduleForm.days.length * weeks;
  const separator = isAr.value ? '، ' : ', ';
  const dayNames = scheduleForm.days.map(d => t('admin.' + FULL_DAY_KEYS[d])).join(separator);
  const student = students.value.find(s => s.id === scheduleForm.studentId);
  const name = student ? `${student.firstName} ${student.lastName}` : '';
  return t('admin.schedulePreview')
    .replace('{count}', totalSessions)
    .replace('{name}', name)
    .replace('{days}', dayNames)
    .replace('{time}', scheduleForm.time);
});

const tabs = [
  { key: 'enrollments', label: 'admin.enrollments' },
  { key: 'students', label: 'admin.students' },
  { key: 'scheduling', label: 'admin.scheduling' },
  { key: 'activity', label: 'admin.activity' },
];

// `action` is a key under `admin.actionFailed.*`. When provided, the toast
// is prefixed with that label so the sheikh knows *which* action blew up,
// not just the raw server message. Pass a plain string instead of an error
// object to show an info toast without any prefix.
function showToast(err, action) {
  if (typeof err === 'string') {
    toast.value = err;
    setTimeout(() => { toast.value = ''; }, 3000);
    return;
  }
  const msg = err?.data?.error || err?.message || t('admin.error');
  toast.value = action
    ? `${t('admin.actionFailed.' + action)}: ${msg}`
    : msg;
  setTimeout(() => { toast.value = ''; }, 5000);
}

async function handleLogout() { await logout(); }

async function loadStats() {
  statsError.value = false;
  try {
    stats.value = await api.get('/api/admin/stats');
  } catch (e) {
    statsError.value = true;
    showToast(e, 'loadStats');
  }
}

async function loadEnrollments() {
  try {
    const data = await api.get('/api/admin/enrollments/pending');
    enrollments.value = data.requests;
  } catch (e) { showToast(e, 'loadEnrollments'); }
}

async function loadStudents() {
  try {
    const query = studentSearch.value ? `?search=${encodeURIComponent(studentSearch.value)}` : '';
    const data = await api.get(`/api/admin/students${query}`);
    students.value = data.students;
  } catch (e) { showToast(e, 'loadStudents'); }
}

async function loadClasses() {
  try {
    const data = await api.get('/api/admin/classes?limit=200');
    classes.value = data.classes;
  } catch (e) { showToast(e, 'loadClasses'); }
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
  } catch (e) { showToast(e, 'saveMeetingLink'); } finally {
    savingLink.value = false;
  }
}

async function handleApprove(id) {
  try {
    await api.post(`/api/admin/enrollments/${id}/approve`, {});
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
    loadStudents();
  } catch (e) { showToast(e, 'approve'); }
}

async function handleReject(id) {
  const message = await promptDialog({
    title: t('admin.rejectEnrollmentTitle'),
    message: t('admin.rejectEnrollmentPrompt'),
    placeholder: t('admin.rejectEnrollmentPlaceholder'),
    confirmLabel: t('admin.reject'),
    cancelLabel: t('admin.cancel'),
  });
  if (message === null) return; // user cancelled
  try {
    await api.post(`/api/admin/enrollments/${id}/reject`, { message: message || null });
    enrollments.value = enrollments.value.filter((e) => e.id !== id);
    loadStats();
  } catch (e) { showToast(e, 'reject'); }
}

async function viewStudent(id) {
  try {
    const data = await api.get(`/api/admin/students/${id}`);
    selectedStudent.value = data.student;
    studentDetailTab.value = 'classes';
    expandedLogClassId.value = null;
    showPaymentForm.value = false;
    await loadStudentDetailData(id);
  } catch (e) { showToast(e, 'viewStudent'); }
}

// Legacy AdminNote textbox was replaced by the Classes / Payments tabs.
// Keeping the endpoints but no longer calling them from the UI.

async function handleSuspend(id) {
  const ok = await confirmDialog({
    title: t('admin.suspendTitle'),
    message: t('admin.suspendConfirm'),
    confirmLabel: t('admin.suspendStudent'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  try {
    await api.post(`/api/admin/students/${id}/suspend`);
    selectedStudent.value = null;
    loadStudents();
    loadStats();
  } catch (e) { showToast(e, 'suspend'); }
}

function cancelClass(id) {
  // Optimistic UI: mark the class cancelled locally, fire the real API call
  // after a 6-second undo window. If the admin hits "Undo" in that window
  // we restore the previous state and skip the API call — no "are you
  // sure?" modal at all.
  const cls = classes.value.find((c) => c.id === id);
  if (!cls) return;
  const previousValue = cls.cancelled;
  cls.cancelled = true;
  if (selectedClass.value && selectedClass.value.id === id) {
    selectedClass.value = { ...selectedClass.value, cancelled: true };
  }

  queueUndoable({
    label: t('admin.cancelClassDone'),
    undoLabel: t('admin.undo'),
    action: async () => {
      try {
        await api.post(`/api/admin/classes/${id}/cancel`);
        loadClasses();
      } catch (e) {
        cls.cancelled = previousValue;
        showToast(e, 'cancelClass');
      }
    },
    onUndo: () => {
      cls.cancelled = previousValue;
      if (selectedClass.value && selectedClass.value.id === id) {
        selectedClass.value = { ...selectedClass.value, cancelled: previousValue };
      }
    },
  });
}

function openReschedule(cls) {
  rescheduleTarget.value = cls;
  const d = new Date(cls.startTime);
  rescheduleDate.value = d.toISOString().split('T')[0];
  rescheduleTime.value = d.toTimeString().slice(0, 5);
  showRescheduleModal.value = true;
}

async function rescheduleClass() {
  if (!rescheduleTarget.value || !rescheduleDate.value || !rescheduleTime.value) return;
  const cls = rescheduleTarget.value;
  const originalDuration = new Date(cls.endTime) - new Date(cls.startTime);
  const newStart = new Date(`${rescheduleDate.value}T${rescheduleTime.value}:00`);
  const newEnd = new Date(newStart.getTime() + originalDuration);

  try {
    await api.post(`/api/admin/classes/${cls.id}/reschedule`, {
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    });
    showRescheduleModal.value = false;
    rescheduleTarget.value = null;
    selectedClass.value = null;
    loadClasses();
  } catch (e) { showToast(e, 'reschedule'); }
}

async function deleteAllClasses() {
  const ok = await confirmDialog({
    title: t('admin.deleteAllTitle'),
    message: t('admin.deleteAllConfirm'),
    confirmLabel: t('admin.deleteAll'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  try {
    await api.delete('/api/admin/classes');
    selectedClass.value = null;
    loadClasses();
  } catch (e) { showToast(e, 'deleteAll'); }
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

  // Second pass: conflicts already surfaced inline, admin picked their
  // resolution, and clicked the same submit button. Ship it.
  if (conflictModal.conflicts.length && conflictModal.pendingPayload) {
    await submitConflictResolution();
    return;
  }

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

    const { conflicts } = await api.post('/api/admin/classes/check-conflicts', {
      studentId: scheduleForm.studentId,
      sessions,
    });

    const payload = { studentId: scheduleForm.studentId, title, sessions };

    if (conflicts?.length) {
      // Surface the conflicts inline in the same form; defaults are the
      // "safe" picks. The admin picks, then hits the same submit button.
      conflictModal.conflicts = conflicts;
      conflictModal.bulkExisting = 'merge';
      conflictModal.bulkSame = 'skip';
      conflictModal.pendingPayload = payload;
      return;
    }

    const result = await api.post('/api/admin/classes/batch', payload);
    showBatchOutcomeToast(result);
    closeScheduleForm();
    loadClasses();
  } catch (e) { showToast(e, 'scheduleStudent'); } finally {
    creatingClass.value = false;
  }
}

// Build the per-session resolution map from the two group choices and POST.
async function submitConflictResolution() {
  const payload = conflictModal.pendingPayload;
  if (!payload) return;
  creatingClass.value = true;
  try {
    // Key by startMs-endMs (matches the backend) so no ISO-string
    // serialization difference can drop a resolution silently.
    const resolutions = {};
    for (const c of conflictModal.conflicts) {
      const key = `${new Date(c.startTime).getTime()}-${new Date(c.endTime).getTime()}`;
      resolutions[key] =
        c.kind === 'existing_slot' ? conflictModal.bulkExisting : conflictModal.bulkSame;
    }
    const result = await api.post('/api/admin/classes/batch', { ...payload, resolutions });
    showBatchOutcomeToast(result);
    closeScheduleForm();
    loadClasses();
  } catch (e) {
    showToast(e, 'scheduleStudent');
  } finally {
    creatingClass.value = false;
  }
}

// Reset the schedule form + any inline conflicts so opening it again starts
// from a clean slate.
function closeScheduleForm() {
  showScheduleForm.value = false;
  Object.assign(scheduleForm, {
    studentId: '', days: [], time: '15:00', duration: '60', weeks: '12',
  });
  conflictModal.conflicts = [];
  conflictModal.pendingPayload = null;
}

// Read the backend's { created, merged, skipped } shape and surface it so the
// sheikh can see exactly what happened to the 12-week batch he just submitted.
function showBatchOutcomeToast(result) {
  const created = result?.created ?? 0;
  const merged = result?.merged ?? 0;
  const skipped = result?.skipped ?? 0;
  toast.value = t('admin.batchSummary')
    .replace('{created}', created)
    .replace('{merged}', merged)
    .replace('{skipped}', skipped);
  setTimeout(() => { toast.value = ''; }, 5000);
}

// A ticking "now" ref so Join-button visibility and countdown labels update
// without a manual refresh. 30-second granularity is plenty for minute-level
// messaging.
const now = ref(Date.now());
const nowTick = setInterval(() => { now.value = Date.now(); }, 30_000);

// The join link only becomes active 30 min before class start and stays
// active until class end. Outside that window the button is replaced with a
// countdown label so the sheikh can see exactly when it will open.
const JOIN_WINDOW_MIN = 30;

function isJoinable(cls) {
  if (cls.cancelled) return false;
  const start = new Date(cls.startTime).getTime();
  const end = new Date(cls.endTime).getTime();
  return now.value >= start - JOIN_WINDOW_MIN * 60_000 && now.value <= end;
}

function joinAvailabilityLabel(cls) {
  const start = new Date(cls.startTime).getTime();
  const end = new Date(cls.endTime).getTime();
  if (now.value > end) return t('admin.joinEnded');
  const minsUntilOpen = Math.ceil((start - JOIN_WINDOW_MIN * 60_000 - now.value) / 60_000);
  if (minsUntilOpen <= 0) return t('admin.joinLive');
  if (minsUntilOpen < 60) {
    return t('admin.joinOpensInMin').replace('{n}', minsUntilOpen);
  }
  const hours = Math.ceil(minsUntilOpen / 60);
  return t('admin.joinOpensInHr').replace('{n}', hours);
}

// Display name for a class. When multiple students share a class (co-taught),
// the stored `title` is just whoever was scheduled first — show the actual
// attendee list so the calendar reflects reality. Falls back to the stored
// title if assignments haven't loaded.
function classDisplayName(cls) {
  const names = (cls.assignments || [])
    .map((a) => a.student?.firstName)
    .filter(Boolean);
  if (names.length === 0) return isAr.value && cls.titleAr ? cls.titleAr : (cls.title || '—');
  return names.join(' + ');
}

// Used by the conflict modal to show a "Fri 1:00 PM · Fri 1:00 PM · +3 more"
// style preview without listing every single occurrence.
function conflictGroupPreview(group) {
  if (!group.length) return '';
  const firstThree = group.slice(0, 3).map((c) => formatConflictTime(c.startTime));
  const more = group.length - firstThree.length;
  return firstThree.join(' · ') + (more > 0 ? ` · +${more} ${t('admin.conflict.more')}` : '');
}

function formatConflictTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Student detail: class logs + payments -------------------------------

async function loadStudentDetailData(studentId) {
  studentDetailLoading.value = true;
  try {
    const [logs, payments] = await Promise.all([
      api.get(`/api/admin/students/${studentId}/class-logs`),
      api.get(`/api/admin/students/${studentId}/payments`),
    ]);
    studentClassLogs.value = logs.logs || [];
    studentPayments.value = payments.payments || [];
    studentPaymentTotals.value = payments.totals || {};
  } catch (e) {
    showToast(e, 'loadStudentData');
  } finally {
    studentDetailLoading.value = false;
  }
}

function logForClass(classSessionId) {
  return studentClassLogs.value.find((l) => l.classSessionId === classSessionId);
}

function expandClassLog(classSessionId) {
  if (expandedLogClassId.value === classSessionId) {
    expandedLogClassId.value = null;
    return;
  }
  const existing = logForClass(classSessionId);
  logDraft.summary = existing?.summary || '';
  logDraft.nextSteps = existing?.nextSteps || '';
  expandedLogClassId.value = classSessionId;
}

async function saveClassLog(classSessionId, studentId) {
  savingLog.value = true;
  try {
    const data = await api.put(`/api/admin/class-logs/${classSessionId}/${studentId}`, {
      summary: logDraft.summary,
      nextSteps: logDraft.nextSteps,
    });
    // Merge into studentClassLogs so the UI reflects the new state without a refetch.
    const idx = studentClassLogs.value.findIndex(
      (l) => l.classSessionId === classSessionId
    );
    const merged = { ...data.log, classSession: logForClass(classSessionId)?.classSession };
    if (idx === -1) {
      studentClassLogs.value.unshift(merged);
    } else {
      studentClassLogs.value[idx] = { ...studentClassLogs.value[idx], ...data.log };
    }
    expandedLogClassId.value = null;
  } catch (e) {
    showToast(e, 'saveClassLog');
  } finally {
    savingLog.value = false;
  }
}

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

async function savePayment(studentId) {
  if (savingPayment.value) return;
  const amountMinor = Math.round(parseFloat(paymentForm.amount) * 100);
  if (!amountMinor || amountMinor <= 0 || !paymentForm.period.trim()) {
    showToast(t('admin.payments.missingFields'));
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
    await loadStudentDetailData(studentId);
  } catch (e) {
    showToast(e, 'savePayment');
  } finally {
    savingPayment.value = false;
  }
}

function deletePayment(paymentId, studentId) {
  // Optimistic remove from the list + undo window.
  const idx = studentPayments.value.findIndex((p) => p.id === paymentId);
  if (idx === -1) return;
  const [removed] = studentPayments.value.splice(idx, 1);
  // Deduct from totals immediately so the running total reflects reality.
  if (removed && studentPaymentTotals.value[removed.currency] != null) {
    studentPaymentTotals.value[removed.currency] -= removed.amount;
  }

  queueUndoable({
    label: t('admin.deletePaymentDone'),
    undoLabel: t('admin.undo'),
    action: async () => {
      try {
        await api.delete(`/api/admin/payments/${paymentId}`);
        await loadStudentDetailData(studentId);
      } catch (e) {
        showToast(e, 'deletePayment');
        // Re-insert so the UI matches backend reality.
        studentPayments.value.splice(idx, 0, removed);
        if (removed && studentPaymentTotals.value[removed.currency] != null) {
          studentPaymentTotals.value[removed.currency] += removed.amount;
        }
      }
    },
    onUndo: () => {
      studentPayments.value.splice(idx, 0, removed);
      if (removed && studentPaymentTotals.value[removed.currency] != null) {
        studentPaymentTotals.value[removed.currency] += removed.amount;
      }
    },
  });
}

async function clearUpcomingClasses(studentId) {
  if (clearingUpcoming.value) return;
  const upcomingCount = studentClasses.value.filter(
    (a) => new Date(a.classSession.startTime) > new Date() && !a.classSession.cancelled
  ).length;
  const ok = await confirmDialog({
    title: t('admin.clearUpcomingTitle'),
    message: t('admin.clearUpcomingConfirm').replace('{count}', upcomingCount),
    confirmLabel: t('admin.clearUpcoming'),
    cancelLabel: t('admin.cancel'),
    danger: true,
  });
  if (!ok) return;
  clearingUpcoming.value = true;
  try {
    const data = await api.delete(`/api/admin/students/${studentId}/future-assignments`);
    showToast(t('admin.clearUpcomingDone').replace('{count}', data.removed));
    await loadClasses();
    // Refresh the student detail so the classes list updates in place.
    await viewStudent(studentId);
  } catch (e) {
    showToast(e, 'clearUpcoming');
  } finally {
    clearingUpcoming.value = false;
  }
}

function formatMoney(minor, currency) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function downloadStudentCsv(studentId) {
  // The endpoint requires auth cookie, so just hit it as a link.
  window.open(`/api/admin/students/${studentId}/export.csv`, '_blank');
}
function downloadAllPaymentsCsv() {
  window.open('/api/admin/export/payments.csv', '_blank');
}
function downloadAllClassLogsCsv() {
  window.open('/api/admin/export/class-logs.csv', '_blank');
}

watch(activeTab, (tab) => {
  if (tab === 'enrollments') loadEnrollments();
  if (tab === 'students') loadStudents();
  if (tab === 'scheduling') { loadClasses(); loadSettings(); }
});

watch(studentSearch, () => { loadStudents(); });
watch(showScheduleForm, (v) => { if (v && !students.value.length) loadStudents(); });

// Escape key closes the topmost open modal. The ConfirmDialog component
// handles its own escape — so we don't touch it here.
function handleGlobalKeydown(e) {
  if (e.key !== 'Escape') return;
  if (showScheduleForm.value) { closeScheduleForm(); return; }
  if (showRescheduleModal.value) { showRescheduleModal.value = false; return; }
  if (showPaymentForm.value) { showPaymentForm.value = false; return; }
  if (selectedStudent.value) { selectedStudent.value = null; return; }
  if (selectedClass.value) { selectedClass.value = null; return; }
}

onMounted(() => {
  loadStats();
  loadEnrollments();
  loadClasses();
  loadSettings();
  window.addEventListener('keydown', handleGlobalKeydown);
});

onBeforeUnmount(() => {
  clearInterval(nowTick);
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
