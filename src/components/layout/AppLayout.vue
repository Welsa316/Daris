<template>
  <div class="min-h-screen flex flex-col bg-cream text-slate-900">
    <Navbar />
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
</script>
