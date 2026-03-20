<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img src="/images/daris-icon.png" alt="Daris" class="h-14 mx-auto mb-4" />
        </RouterLink>
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.registerTitle') }}</h1>
        <p class="text-slate-500 mt-1">{{ $t('auth.registerSubtitle') }}</p>
      </div>

      <form v-if="!success" @submit.prevent="handleRegister" class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.firstName') }}</label>
            <input id="firstName" v-model="form.firstName" type="text" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.lastName') }}</label>
            <input id="lastName" v-model="form.lastName" type="text" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.email') }}</label>
          <input id="email" v-model="form.email" type="email" required autocomplete="email" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.password') }}</label>
          <input id="password" v-model="form.password" type="password" required autocomplete="new-password" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          <PasswordStrength :password="form.password" />
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.country') }}</label>
          <select id="country" v-model="form.country" required class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white">
            <option value="">{{ $t('auth.selectCountry') }}</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.contactMethod') }}</label>
          <p class="text-xs text-slate-400 mb-2">{{ $t('auth.contactMethodHint') }}</p>
          <div class="space-y-3">
            <input v-model="form.phone" type="text" :placeholder="$t('auth.phonePlaceholder')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
            <input v-model="form.whatsapp" type="text" :placeholder="$t('auth.whatsappPlaceholder')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
            <input v-model="form.telegram" type="text" :placeholder="$t('auth.telegramPlaceholder')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          </div>
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.enrollmentMessage') }}</label>
          <textarea id="message" v-model="form.enrollmentMessage" maxlength="500" rows="3" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition resize-none" :placeholder="$t('auth.enrollmentMessagePlaceholder')"></textarea>
          <p class="text-xs text-slate-400 mt-1">{{ form.enrollmentMessage?.length || 0 }}/500</p>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? $t('auth.registering') : $t('auth.registerBtn') }}
        </button>

        <p class="text-center text-sm text-slate-500">
          {{ $t('auth.hasAccount') }}
          <RouterLink to="/login" class="text-primary font-medium hover:text-primary-800 transition">
            {{ $t('auth.loginLink') }}
          </RouterLink>
        </p>
      </form>

      <!-- Success state -->
      <div v-else class="bg-white rounded-2xl shadow-card p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.registerSuccessTitle') }}</h2>
        <p class="text-slate-500">{{ $t('auth.registerSuccessText') }}</p>
        <RouterLink to="/login" class="inline-block mt-6 bg-primary text-cream font-semibold px-8 py-2.5 rounded-full hover:bg-primary-800 transition">
          {{ $t('auth.goToLogin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';

const { register } = useAuth();

const form = reactive({
  firstName: '', lastName: '', email: '', password: '',
  country: '', phone: '', whatsapp: '', telegram: '',
  enrollmentMessage: '',
});

const error = ref('');
const success = ref(false);
const submitting = ref(false);

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bahrain',
  'Bangladesh', 'Belgium', 'Bosnia and Herzegovina', 'Brazil', 'Brunei', 'Canada',
  'China', 'Colombia', 'Comoros', 'Denmark', 'Djibouti', 'Egypt', 'Ethiopia',
  'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Guinea', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Lebanon', 'Libya', 'Malaysia', 'Maldives',
  'Mali', 'Mauritania', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Niger',
  'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Russia', 'Saudi Arabia', 'Senegal', 'Sierra Leone', 'Singapore',
  'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Tajikistan', 'Tanzania', 'Thailand', 'Trinidad and Tobago',
  'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uzbekistan', 'Yemen', 'Other',
];

async function handleRegister() {
  error.value = '';
  submitting.value = true;

  try {
    await register(form);
    success.value = true;
  } catch (err) {
    error.value = err.data?.error || err.message;
    if (err.data?.details) {
      error.value = err.data.details.map((d) => d.message).join('. ');
    }
  } finally {
    submitting.value = false;
  }
}
</script>
