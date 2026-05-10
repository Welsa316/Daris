<template>
  <div class="min-h-screen flex flex-col bg-cream text-slate-900">
    <Navbar v-if="isPublicRoute" />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter v-if="isPublicRoute" />
    <WhatsAppFloat v-if="isPublicRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './Navbar.vue';
import SiteFooter from './SiteFooter.vue';
import WhatsAppFloat from '@/components/common/WhatsAppFloat.vue';

const route = useRoute();

// Authenticated app surfaces have their own header / language switcher inside
// the dashboard shell. Admin (and teacher) live at /admin; students at
// /dashboard. Both should hide the public-site navbar, footer, and the
// floating WhatsApp pill — those are for prospective students reaching the
// marketing site, not for users who are already logged in and working.
const isAppRoute = computed(() =>
  route.path === '/admin' ||
  route.path.startsWith('/admin/') ||
  route.path === '/dashboard' ||
  route.path.startsWith('/dashboard/')
);

// Auth pages (login, register, password reset, email verification, etc) have
// their own centered language switcher inside the form card. A transparent
// navbar would leave a floating English/Arabic pill on the cream background
// and the WhatsApp widget overlapping the form CTA — both unwanted.
const AUTH_ROUTES = new Set([
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
  'enrollment-status',
  'change-password',
]);
const isAuthRoute = computed(() => AUTH_ROUTES.has(route.name));

// Public routes = the marketing site (home, about, programs, faq, contact,
// articles). The Navbar, SiteFooter, and WhatsApp float only render here —
// dashboards and auth pages stay clean.
const isPublicRoute = computed(() => !isAppRoute.value && !isAuthRoute.value);
</script>
