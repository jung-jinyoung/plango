<template>
  <button type="button" class="history-card neu-raised neu-interactive" @click="$emit('click')">
    <div class="head">
      <span class="period-tag">{{ report.periodType === 'week' ? '주간' : '월간' }}</span>
      <span class="label">{{ report.periodLabel }}</span>
    </div>
    <ProgressBar :value="report.completionRate" color="rose" show-label />
    <p class="summary">{{ report.summary }}</p>
  </button>
</template>

<script setup>
import ProgressBar from '@/components/ui/ProgressBar.vue'

defineProps({
  report: { type: Object, required: true },
})
defineEmits(['click'])
</script>

<style scoped>
.history-card {
  display: block;
  width: 100%;
  border: none;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  padding: 20px;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.period-tag {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  background: color-mix(in srgb, var(--p-rose) 16%, var(--p-surface));
  padding: 3px 9px;
  border-radius: 999px;
}
.label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--p-ink);
}
.summary {
  font-size: 0.85rem;
  color: var(--p-ink-muted);
  margin: 10px 0 0;
  line-height: 1.6;
}
</style>
