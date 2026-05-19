<template>
  <!-- No expected monthly amount set -> render nothing. -->
  <span
    v-if="student.expectedMonthlyAmount"
    class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full tabular-nums"
    :class="pillClass"
    :title="tooltip"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  student: { type: Object, required: true },
});

const { t } = useI18n();

const state = computed(() => {
  const expected = props.student.expectedMonthlyAmount || 0;
  const currency = props.student.expectedMonthlyCurrency || 'EGP';
  const paid = props.student.paidThisMonth?.[currency] || 0;
  if (expected <= 0) return { kind: 'none', paid: 0, currency, diff: 0 };
  if (paid >= expected) return { kind: 'paid', paid, currency, diff: 0 };
  if (paid > 0) return { kind: 'partial', paid, currency, diff: expected - paid };
  return { kind: 'due', paid: 0, currency, diff: expected };
});

const pillClass = computed(() => ({
  'bg-green-50 text-green-700': state.value.kind === 'paid',
  'bg-amber-50 text-amber-700': state.value.kind === 'partial',
  'bg-red-50 text-red-700': state.value.kind === 'due',
  'bg-slate-50 text-slate-500': state.value.kind === 'none',
}));

const dotClass = computed(() => ({
  'bg-green-500': state.value.kind === 'paid',
  'bg-amber-500': state.value.kind === 'partial',
  'bg-red-500': state.value.kind === 'due',
  'bg-slate-400': state.value.kind === 'none',
}));

function money(minor, cur) {
  return `${(minor / 100).toFixed(2)} ${cur}`;
}

const label = computed(() => {
  if (state.value.kind === 'paid') return t('admin.balance.paid');
  if (state.value.kind === 'partial') {
    return t('admin.balance.due').replace('{amount}', money(state.value.diff, state.value.currency));
  }
  if (state.value.kind === 'due') {
    return t('admin.balance.due').replace('{amount}', money(state.value.diff, state.value.currency));
  }
  return '';
});

const tooltip = computed(() => {
  const expected = props.student.expectedMonthlyAmount || 0;
  const currency = props.student.expectedMonthlyCurrency || 'EGP';
  return t('admin.balance.tooltip')
    .replace('{paid}', money(state.value.paid, currency))
    .replace('{expected}', money(expected, currency));
});
</script>
