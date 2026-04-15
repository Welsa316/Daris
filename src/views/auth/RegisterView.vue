<template>
  <div class="min-h-screen bg-cream flex items-center justify-center px-4 pt-24 pb-12">
    <div class="w-full max-w-lg">
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img src="/images/daris-icon.png" alt="Daris" class="h-14 mx-auto mb-4" />
        </RouterLink>
        <h1 class="text-2xl font-display font-bold text-primary">{{ $t('auth.registerTitle') }}</h1>
        <p class="text-slate-500 mt-1">{{ $t('auth.registerSubtitle') }}</p>
        <div class="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>

      <form v-if="!success" @submit.prevent="handleRegister" novalidate class="bg-white rounded-2xl shadow-card p-8 space-y-5">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.firstName') }}</label>
            <input id="firstName" v-model="form.firstName" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.lastName') }}</label>
            <input id="lastName" v-model="form.lastName" type="text" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          </div>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.email') }}</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.password') }}</label>
          <input id="password" v-model="form.password" type="password" autocomplete="new-password" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
          <PasswordStrength :password="form.password" />
        </div>

        <div>
          <label for="country" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.country') }}</label>
          <select id="country" v-model="form.country" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition bg-white">
            <option value="">{{ $t('auth.selectCountry') }}</option>
            <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label for="phone" class="block text-sm font-medium text-slate-700 mb-1">{{ $t('auth.phone') }}</label>
          <input id="phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" :placeholder="$t('auth.phonePlaceholder')" class="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
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
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          :class="emailSent ? 'bg-green-100' : 'bg-amber-100'"
        >
          <svg v-if="emailSent" class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          <svg v-else class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
        </div>
        <h2 class="text-xl font-bold text-primary mb-2">{{ $t('auth.registerSuccessTitle') }}</h2>
        <p class="text-slate-500">{{ emailSent ? $t('auth.registerSuccessText') : (warning || $t('auth.emailDeliveryFailed')) }}</p>

        <div v-if="!emailSent" class="mt-6 space-y-3">
          <button
            @click="handleResend"
            :disabled="resending || resendDone"
            class="w-full bg-primary text-cream font-semibold py-2.5 rounded-full hover:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ resending ? $t('auth.registering') : (resendDone ? $t('auth.resendSent') : $t('auth.resendFromLogin')) }}
          </button>
          <p v-if="resendError" class="text-sm text-red-600">{{ resendError }}</p>
          <RouterLink to="/login" class="block text-sm text-primary hover:text-primary-800 transition">
            {{ $t('auth.goToLogin') }}
          </RouterLink>
        </div>

        <RouterLink
          v-else
          to="/login"
          class="inline-block mt-6 bg-primary text-cream font-semibold px-8 py-2.5 rounded-full hover:bg-primary-800 transition"
        >
          {{ $t('auth.goToLogin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth.js';
import PasswordStrength from '@/components/auth/PasswordStrength.vue';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';

const { t } = useI18n();
const { register, resendVerification } = useAuth();

const form = reactive({
  firstName: '', lastName: '', email: '', password: '',
  country: '', phone: '',
  enrollmentMessage: '',
});

const error = ref('');
const success = ref(false);
const emailSent = ref(true);
const warning = ref('');
const submitting = ref(false);
const resending = ref(false);
const resendDone = ref(false);
const resendError = ref('');

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

function validateForm() {
  const missing = [];
  if (!form.firstName.trim()) missing.push(t('auth.firstName'));
  if (!form.lastName.trim()) missing.push(t('auth.lastName'));
  if (!form.email.trim()) missing.push(t('auth.email'));
  if (!form.password) missing.push(t('auth.password'));
  if (!form.country) missing.push(t('auth.country'));
  if (!form.phone.trim()) missing.push(t('auth.phone'));

  if (missing.length > 0) {
    return t('auth.missingFields', { fields: missing.join('، ') });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return t('auth.invalidEmail');
  }

  // Backend only requires 8+ chars; strength is the user's responsibility.
  if (form.password.length < 8) {
    return t('auth.passwordTooShort');
  }

  return null;
}

async function handleRegister() {
  error.value = '';

  const validationError = validateForm();
  if (validationError) {
    error.value = validationError;
    return;
  }

  submitting.value = true;

  try {
    const data = await register(form);
    emailSent.value = data?.emailSent !== false;
    warning.value = data?.warning || '';
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

async function handleResend() {
  resendError.value = '';
  resending.value = true;
  try {
    await resendVerification(form.email);
    resendDone.value = true;
  } catch (err) {
    resendError.value = err.data?.error || err.message || t('auth.emailDeliveryFailed');
  } finally {
    resending.value = false;
  }
}
</script>
