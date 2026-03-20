<template>
  <div v-if="password" class="mt-2 space-y-1">
    <div class="flex gap-1">
      <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-300" :class="i <= strength ? strengthColors[strength] : 'bg-slate-200'" />
    </div>
    <p class="text-xs" :class="strengthTextColors[strength]">{{ strengthLabel }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({ password: { type: String, default: '' } });
const { t } = useI18n();

const strength = computed(() => {
  const p = props.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const strengthColors = { 1: 'bg-red-400', 2: 'bg-amber-400', 3: 'bg-yellow-400', 4: 'bg-green-500' };
const strengthTextColors = { 0: 'text-slate-400', 1: 'text-red-500', 2: 'text-amber-500', 3: 'text-yellow-600', 4: 'text-green-600' };

const strengthLabel = computed(() => {
  const labels = [
    t('auth.passwordWeak'),
    t('auth.passwordWeak'),
    t('auth.passwordFair'),
    t('auth.passwordGood'),
    t('auth.passwordStrong'),
  ];
  return labels[strength.value];
});
</script>
