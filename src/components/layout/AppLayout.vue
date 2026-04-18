<template>
  <div class="min-h-screen flex flex-col bg-cream text-slate-900">
    <Navbar v-if="!isAuthRoute" />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppFloat v-if="!isAdminRoute" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './Navbar.vue';
import SiteFooter from './SiteFooter.vue';
import WhatsAppFloat from '@/components/common/WhatsAppFloat.vue';

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/dashboard/admin'));

// Auth pages have their own centered language switcher inside the form card,
// and a transparent navbar leaves a floating English/Arabic pill on the cream
// background. hide the navbar entirely on these routes.
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
</script>
