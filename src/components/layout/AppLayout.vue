<template>
  <div class="min-h-screen flex flex-col bg-cream text-slate-900">
    <Navbar />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppFloat />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
import SiteFooter from './SiteFooter.vue';
import WhatsAppFloat from '@/components/common/WhatsAppFloat.vue';
</script>
