<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <ConfirmDialog />
</template>

<script setup>
import AppLayout from './components/layout/AppLayout.vue';
import ConfirmDialog from './components/common/ConfirmDialog.vue';
</script>
