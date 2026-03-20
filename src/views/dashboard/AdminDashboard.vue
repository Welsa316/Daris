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
      <div v-if="activeTab === 'scheduling'" class="space-y-4">
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
              <button @click="showCreateClass = true" class="bg-primary text-cream px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition">
                {{ $t('admin.createClass') }}
              </button>
            </div>
          </div>

          <!-- Calendar View -->
          <div v-if="calendarView">
            <!-- Week navigation -->
            <div class="flex items-center justify-between mb-4">
              <button @click="prevWeek" class="text-slate-500 hover:text-primary text-sm font-medium">&larr; {{ $t('admin.prevWeek') }}</button>
              <span class="text-sm font-medium text-primary">
                {{ calendarWeekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                &ndash;
                {{ new Date(calendarWeekStart.getTime() + 6 * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }}
              </span>
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
                  class="mb-1 rounded-lg p-2 text-xs cursor-default"
                  :class="cls.cancelled ? 'bg-slate-100 text-slate-400 line-through' : 'bg-primary/10 text-primary'">
                  <p class="font-medium truncate">{{ isAr && cls.titleAr ? cls.titleAr : cls.title }}</p>
                  <p class="text-[10px] opacity-70">{{ new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div v-if="!(classesByDay[day.toISOString().split('T')[0]] || []).length" class="text-[10px] text-slate-300 text-center pt-4">—</div>
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

      <!-- Availability -->
      <div v-if="activeTab === 'availability'" class="space-y-6">
        <!-- Weekly Slots -->
        <div class="bg-white rounded-2xl shadow-card p-6">
          <h2 class="text-lg font-bold text-primary mb-1">{{ $t('admin.weeklyAvailability') }}</h2>
          <p class="text-sm text-slate-400 mb-4">{{ $t('admin.availabilityDesc') }}</p>

          <div v-if="availLoading" class="text-slate-400 text-sm py-8 text-center">Loading...</div>
          <div v-else class="space-y-3">
            <div v-for="day in 7" :key="day - 1" class="border border-slate-100 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-primary text-sm">{{ $t('admin.' + FULL_DAY_KEYS[day - 1]) }}</span>
                <button type="button" @click="addSlotToDay(day - 1)" class="text-xs text-primary hover:text-primary-800 font-medium">+ {{ $t('admin.addSlot') }}</button>
              </div>
              <div v-if="!slotsByDay[day - 1].length" class="text-xs text-slate-400">{{ $t('admin.dayOff') }}</div>
              <div v-else class="space-y-2">
                <div v-for="(slot, idx) in slotsByDay[day - 1]" :key="idx" class="flex items-center gap-2">
                  <input type="time" :value="padTime(slot.startHour, slot.startMin)" @change="updateSlot(day - 1, idx, 'start', $event.target.value)"
                    class="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
                  <span class="text-slate-400 text-xs">{{ $t('admin.to') }}</span>
                  <input type="time" :value="padTime(slot.endHour, slot.endMin)" @change="updateSlot(day - 1, idx, 'end', $event.target.value)"
                    class="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
                  <button type="button" @click="removeSlotFromDay(day - 1, idx)" class="text-red-400 hover:text-red-600 text-sm">&times;</button>
                </div>
              </div>
            </div>

            <!-- Save button -->
            <div class="flex justify-end pt-2">
              <button @click="saveAvailabilitySlots" :disabled="availSaving"
                class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                {{ availSaving ? $t('admin.saving') : (availSaved ? $t('admin.saved') : $t('admin.save')) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Date Overrides -->
        <div class="bg-white rounded-2xl shadow-card p-6">
          <h2 class="text-lg font-bold text-primary mb-1">{{ $t('admin.overrides') }}</h2>
          <p class="text-sm text-slate-400 mb-4">{{ $t('admin.overridesDesc') }}</p>

          <!-- Existing overrides list -->
          <div v-if="!availabilityOverrides.length" class="text-slate-400 text-sm py-4 text-center">{{ $t('admin.noOverrides') }}</div>
          <div v-else class="space-y-2 mb-4">
            <div v-for="ov in availabilityOverrides" :key="ov.id" class="flex items-center justify-between border border-slate-100 rounded-lg p-3">
              <div>
                <span class="font-medium text-sm text-primary">{{ new Date(ov.date).toLocaleDateString() }}</span>
                <span v-if="!ov.available" class="ltr:ml-2 rtl:mr-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{ $t('admin.offDay') }}</span>
                <span v-else class="ltr:ml-2 rtl:mr-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{{ $t('admin.extraAvailability') }}: {{ padTime(ov.startHour, ov.startMin) }}-{{ padTime(ov.endHour, ov.endMin) }}</span>
                <span v-if="ov.reason" class="ltr:ml-2 rtl:mr-2 text-xs text-slate-400">{{ ov.reason }}</span>
              </div>
              <button @click="deleteOverride(ov.id)" class="text-red-400 hover:text-red-600 text-xs font-medium">{{ $t('admin.delete') }}</button>
            </div>
          </div>

          <!-- Add override form -->
          <div class="border border-dashed border-slate-200 rounded-xl p-4">
            <h3 class="text-sm font-medium text-primary mb-3">{{ $t('admin.addOverride') }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.overrideDate') }}</label>
                <input v-model="overrideForm.date" type="date" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label class="block text-xs text-slate-500 mb-1">{{ $t('admin.reason') }}</label>
                <input v-model="overrideForm.reason" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
              </div>
            </div>
            <div class="mt-3 flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="overrideForm.available" type="checkbox" class="rounded border-slate-300" />
                {{ $t('admin.extraAvailability') }}
              </label>
            </div>
            <div v-if="overrideForm.available" class="mt-3 flex items-center gap-2">
              <input v-model="overrideForm.startTime" type="time" class="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
              <span class="text-slate-400 text-xs">{{ $t('admin.to') }}</span>
              <input v-model="overrideForm.endTime" type="time" class="px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:border-primary outline-none" />
            </div>
            <div class="mt-3 flex justify-end">
              <button @click="addOverride" :disabled="!overrideForm.date"
                class="bg-primary text-cream px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                {{ $t('admin.addOverride') }}
              </button>
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

      <!-- Create Class Modal -->
      <div v-if="showCreateClass" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showCreateClass = false">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
          <h2 class="text-lg font-bold text-primary mb-4">{{ $t('admin.createClass') }}</h2>
          <form @submit.prevent="createClass" class="space-y-4">
            <input v-model="classForm.title" type="text" required :placeholder="$t('admin.classTitle')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <input v-model="classForm.titleAr" type="text" :placeholder="$t('admin.classTitleAr')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <textarea v-model="classForm.description" rows="2" :placeholder="$t('admin.classDescription')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none"></textarea>
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.startTime') }}</label>
              <input v-model="classForm.startTime" type="datetime-local" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.duration') }}</label>
              <select v-model="classForm.duration" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="30">30 {{ $t('admin.minutes') }}</option>
                <option value="45">45 {{ $t('admin.minutes') }}</option>
                <option value="60">1 {{ $t('admin.hour') }}</option>
                <option value="90">1.5 {{ $t('admin.hours') }}</option>
                <option value="120">2 {{ $t('admin.hours') }}</option>
                <option value="custom">{{ $t('admin.customEndTime') }}</option>
              </select>
            </div>
            <div v-if="classForm.duration === 'custom'">
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.endTime') }}</label>
              <input v-model="classForm.endTime" type="datetime-local" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none text-sm" />
            </div>
            <input v-model="classForm.meetingLink" type="url" :placeholder="$t('admin.meetingLink')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none" />
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.recurrence') }}</label>
              <select v-model="classForm.recurrence" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="">{{ $t('admin.oneOff') }}</option>
                <option value="weekly">{{ $t('admin.weekly') }}</option>
                <option value="biweekly">{{ $t('admin.biweekly') }}</option>
              </select>
            </div>
            <div v-if="classForm.recurrence">
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.repeatUntil') }}</label>
              <select v-model="classForm.repeatWeeks" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="4">4 {{ $t('admin.weeks') }}</option>
                <option value="8">8 {{ $t('admin.weeks') }}</option>
                <option value="12">12 {{ $t('admin.weeks') }}</option>
                <option value="16">16 {{ $t('admin.weeks') }}</option>
                <option value="24">24 {{ $t('admin.weeks') }}</option>
                <option value="52">52 {{ $t('admin.weeks') }} (1 {{ $t('admin.year') }})</option>
              </select>
              <p class="text-xs text-slate-400 mt-1">{{ recurringClassCount }} {{ $t('admin.classesWillBeCreated') }}</p>
            </div>
            <!-- Assign to students -->
            <div>
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.assignTo') }}</label>
              <select v-model="classForm.assignTo" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary outline-none bg-white text-sm">
                <option value="all">{{ $t('admin.allStudents') }}</option>
                <option value="specific">{{ $t('admin.specificStudent') }}</option>
              </select>
            </div>
            <div v-if="classForm.assignTo === 'specific'">
              <label class="block text-sm text-slate-500 mb-1">{{ $t('admin.selectStudent') }}</label>
              <div class="border border-slate-200 rounded-lg max-h-40 overflow-y-auto p-2 space-y-1">
                <label v-for="s in students" :key="s.id" class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm">
                  <input type="checkbox" :value="s.id" v-model="classForm.selectedStudentIds" class="rounded border-slate-300" />
                  {{ s.firstName }} {{ s.lastName }}
                  <span class="text-xs text-slate-400">{{ s.email }}</span>
                </label>
                <p v-if="!students.length" class="text-xs text-slate-400 text-center py-2">{{ $t('admin.noStudents') }}</p>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button type="button" @click="showCreateClass = false" class="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">{{ $t('admin.cancel') }}</button>
              <button type="submit" :disabled="creatingClass" class="bg-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:bg-primary-800 transition disabled:opacity-50">
                {{ creatingClass ? $t('admin.creating') : $t('admin.create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/config/api.js';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';

const { locale } = useI18n();
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
const showCreateClass = ref(false);
const creatingClass = ref(false);

// Availability state
const availabilitySlots = ref([]);
const availabilityOverrides = ref([]);
const availLoading = ref(false);
const availSaving = ref(false);
const availSaved = ref(false);
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const FULL_DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// Build a per-day structure: { 0: [{startHour,startMin,endHour,endMin}], ... }
const slotsByDay = computed(() => {
  const map = {};
  for (let d = 0; d < 7; d++) map[d] = [];
  for (const s of availabilitySlots.value) {
    if (!map[s.dayOfWeek]) map[s.dayOfWeek] = [];
    map[s.dayOfWeek].push({ startHour: s.startHour, startMin: s.startMin || 0, endHour: s.endHour, endMin: s.endMin || 0 });
  }
  return map;
});

const overrideForm = reactive({ date: '', available: false, startTime: '09:00', endTime: '17:00', reason: '' });

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

const classForm = reactive({
  title: '', titleAr: '', description: '', startTime: '', endTime: '',
  meetingLink: '', recurrence: '', duration: '60', repeatWeeks: '12',
  assignTo: 'all', selectedStudentIds: [],
});

const studentClasses = computed(() => {
  if (!selectedStudent.value?.classAssignments) return [];
  return selectedStudent.value.classAssignments;
});

const recurringClassCount = computed(() => {
  if (!classForm.recurrence) return 0;
  const weeks = parseInt(classForm.repeatWeeks) || 12;
  const interval = classForm.recurrence === 'biweekly' ? 2 : 1;
  return Math.floor(weeks / interval);
});

const tabs = [
  { key: 'enrollments', label: 'admin.enrollments' },
  { key: 'students', label: 'admin.students' },
  { key: 'scheduling', label: 'admin.scheduling' },
  { key: 'availability', label: 'admin.availability' },
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

function padTime(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

function addSlotToDay(dayOfWeek) {
  availabilitySlots.value = [...availabilitySlots.value, { dayOfWeek, startHour: 9, startMin: 0, endHour: 17, endMin: 0 }];
  availSaved.value = false;
}

function removeSlotFromDay(dayOfWeek, idx) {
  // Find the idx-th slot for this day and remove it
  let count = -1;
  availabilitySlots.value = availabilitySlots.value.filter((s) => {
    if (s.dayOfWeek === dayOfWeek) {
      count++;
      return count !== idx;
    }
    return true;
  });
  availSaved.value = false;
}

function updateSlot(dayOfWeek, idx, which, timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  let count = -1;
  for (const s of availabilitySlots.value) {
    if (s.dayOfWeek === dayOfWeek) {
      count++;
      if (count === idx) {
        if (which === 'start') { s.startHour = h; s.startMin = m; }
        else { s.endHour = h; s.endMin = m; }
        break;
      }
    }
  }
  availSaved.value = false;
}

async function loadAvailability() {
  availLoading.value = true;
  try {
    const data = await api.get('/api/admin/availability');
    availabilitySlots.value = data.slots;
    availabilityOverrides.value = data.overrides;
  } catch {} finally {
    availLoading.value = false;
  }
}

async function addOverride() {
  if (!overrideForm.date) return;
  try {
    const [sh, sm] = overrideForm.startTime.split(':').map(Number);
    const [eh, em] = overrideForm.endTime.split(':').map(Number);
    const body = {
      date: overrideForm.date,
      available: overrideForm.available,
      reason: overrideForm.reason || undefined,
      ...(overrideForm.available ? { startHour: sh, startMin: sm, endHour: eh, endMin: em } : {}),
    };
    const data = await api.post('/api/admin/availability/overrides', body);
    // Replace if same date, else append
    const existing = availabilityOverrides.value.findIndex((o) => new Date(o.date).toISOString().split('T')[0] === overrideForm.date);
    if (existing >= 0) availabilityOverrides.value[existing] = data.override;
    else availabilityOverrides.value.push(data.override);
    Object.assign(overrideForm, { date: '', available: false, startTime: '09:00', endTime: '17:00', reason: '' });
  } catch {}
}

async function deleteOverride(id) {
  try {
    await api.delete(`/api/admin/availability/overrides/${id}`);
    availabilityOverrides.value = availabilityOverrides.value.filter((o) => o.id !== id);
  } catch {}
}

async function saveAvailabilitySlots() {
  availSaving.value = true;
  try {
    const slots = availabilitySlots.value.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startHour: s.startHour,
      startMin: s.startMin || 0,
      endHour: s.endHour,
      endMin: s.endMin || 0,
    }));
    const data = await api.put('/api/admin/availability/slots', { slots });
    availabilitySlots.value = data.slots;
    availSaved.value = true;
    setTimeout(() => { availSaved.value = false; }, 2000);
  } catch {} finally {
    availSaving.value = false;
  }
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
  if (creatingClass.value) return;
  creatingClass.value = true;
  try {
    const start = new Date(classForm.startTime);
    let end;
    if (classForm.duration === 'custom') {
      end = new Date(classForm.endTime);
    } else {
      end = new Date(start.getTime() + parseInt(classForm.duration) * 60000);
    }

    // Generate all sessions for recurring classes
    const sessions = [];
    if (classForm.recurrence) {
      const weeks = parseInt(classForm.repeatWeeks) || 12;
      const intervalDays = classForm.recurrence === 'biweekly' ? 14 : 7;
      const durationMs = end.getTime() - start.getTime();
      for (let i = 0; i < weeks; i += (intervalDays / 7)) {
        const sessionStart = new Date(start.getTime() + (i * 7 * 86400000));
        const sessionEnd = new Date(sessionStart.getTime() + durationMs);
        sessions.push({ start: sessionStart, end: sessionEnd });
      }
    } else {
      sessions.push({ start, end });
    }

    // Create all sessions
    for (const session of sessions) {
      const data = {
        title: classForm.title,
        titleAr: classForm.titleAr || undefined,
        description: classForm.description || undefined,
        startTime: session.start.toISOString(),
        endTime: session.end.toISOString(),
        meetingLink: classForm.meetingLink || undefined,
        recurrence: classForm.recurrence || null,
        ...(classForm.assignTo === 'specific' && classForm.selectedStudentIds.length ? { studentIds: classForm.selectedStudentIds } : {}),
      };
      await api.post('/api/admin/classes', data);
    }

    showCreateClass.value = false;
    Object.assign(classForm, { title: '', titleAr: '', description: '', startTime: '', endTime: '', meetingLink: '', recurrence: '', duration: '60', repeatWeeks: '12', assignTo: 'all', selectedStudentIds: [] });
    loadClasses();
  } catch {} finally {
    creatingClass.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'enrollments') loadEnrollments();
  if (tab === 'students') loadStudents();
  if (tab === 'scheduling') loadClasses();
  if (tab === 'availability') loadAvailability();
});

watch(studentSearch, () => { loadStudents(); });
watch(showCreateClass, (v) => { if (v && !students.value.length) loadStudents(); });

onMounted(() => {
  loadStats();
  loadEnrollments();
});
</script>
