<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <ConfirmDialog />
  <UndoToast />
</template>

<script setup>
import AppLayout from './components/layout/AppLayout.vue';
import ConfirmDialog from './components/common/ConfirmDialog.vue';
import UndoToast from './components/common/UndoToast.vue';
</script>
