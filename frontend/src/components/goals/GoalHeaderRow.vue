<template>
  <div class="goal-header-row">
    <span class="dot" :class="`is-${goal.color}`" aria-hidden="true" />
    <span class="title">{{ goal.title }}</span>
    <span class="count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
    <div class="progress"><ProgressBar :value="goal.progress" :color="goal.color" /></div>
    <span class="row-actions">
      <button type="button" class="icon-btn" aria-label="목표 수정" @click.stop="$emit('edit', goal)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button type="button" class="icon-btn" aria-label="목표 삭제" @click.stop="$emit('delete', goal)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
        </svg>
      </button>
    </span>
  </div>
</template>

<script setup>
import ProgressBar from '@/components/ui/ProgressBar.vue'

defineProps({
  goal: { type: Object, required: true },
})
defineEmits(['edit', 'delete'])
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
.dot.is-amber {
  background: var(--p-amber);
}
.dot.is-teal {
  background: var(--p-teal);
}
.dot.is-plum {
  background: var(--p-plum);
}
.dot.is-slate {
  background: var(--p-slate);
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
.row-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.icon-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-btn:hover {
  color: var(--p-ink);
  background: var(--p-bg);
}
</style>
