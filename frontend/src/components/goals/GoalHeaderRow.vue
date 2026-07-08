<template>
  <div class="goal-header-row">
    <span class="dot" :class="`is-${goal.color}`" aria-hidden="true" />
    <span class="title">{{ goal.title }}</span>
    <span class="count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
    <div class="progress"><ProgressBar :value="goal.progress" :color="goal.color" /></div>
  </div>
</template>

<script setup>
import ProgressBar from '@/components/ui/ProgressBar.vue'

defineProps({
  goal: { type: Object, required: true },
})
</script>

<style scoped>
.goal-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--p-rose);
}
.dot.is-blue {
  background: var(--p-blue);
}
.dot.is-green {
  background: var(--p-green);
}
.dot.is-lavender {
  background: var(--p-lavender);
}
.title {
  font-weight: 700;
  font-size: 0.94rem;
  color: var(--p-ink);
  flex-shrink: 0;
}
.count {
  font-size: 0.78rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.progress {
  flex: 1;
  max-width: 200px;
}
</style>
