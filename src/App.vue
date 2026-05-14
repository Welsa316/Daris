<template>
  <AppLayout>
    <router-view />
  </AppLayout>
  <ConfirmDialog />
  <UndoToast />
  <!-- Floating chat widget. Self-hides on marketing + auth routes and
       when no user is logged in. Mounted at the root so it persists
       across navigation (a teacher pinging a student from the schedule
       page should keep that thread open if they jump to the Notebook). -->
  <MessageWidget />
</template>

<script setup>
import AppLayout from './components/layout/AppLayout.vue';
import ConfirmDialog from './components/common/ConfirmDialog.vue';
import UndoToast from './components/common/UndoToast.vue';
import MessageWidget from './components/dashboard/MessageWidget.vue';
</script>
