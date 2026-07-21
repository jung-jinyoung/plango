<template>
  <div
    class="goal-card neu-raised neu-interactive"
    :class="[`is-${goal.color}`, { 'is-selected': selected }]"
    role="button"
    tabindex="0"
    @click="$emit('select', goal.id)"
    @keydown.enter="$emit('select', goal.id)"
  >
    <button
      type="button"
      class="details-btn"
      aria-label="목표 상세"
      @click.stop="$emit('details', goal.id)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
      </svg>
    </button>
    <span class="tag">{{ goal.taskCount }}개 태스크</span>
    <h3>{{ goal.title }}</h3>
    <p v-if="parentLabel" class="parent">{{ parentLabel }}</p>
    <ProgressBar :value="goal.progress" :color="goal.color" show-label />
    <p class="meta">{{ goal.doneCount }}/{{ goal.taskCount }} 완료</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  // { id, title, progress, color, taskCount, doneCount, monthlyGoalId? } — monthlyGoalId만 있으면 주간 목표
  goal: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['select', 'details'])

const goalStore = useGoalStore()
const parentLabel = computed(() => {
  if (!('monthlyGoalId' in props.goal)) return null
  if (!props.goal.monthlyGoalId) return '미분류'
  const parent = goalStore.monthlyGoals.find((g) => g.id === props.goal.monthlyGoalId)
  return parent ? `상위: ${parent.title}` : '미분류'
})
</script>

<style scoped>
.goal-card {
  position: relative;
  padding: 16px;
  display: block;
  width: 100%;
  border: none;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}
.details-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.details-btn:hover {
  color: var(--p-ink);
  background: var(--p-bg);
}
.tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  margin-bottom: 10px;
  color: var(--tag-ink, var(--p-rose-ink));
  background: color-mix(in srgb, var(--tag-color, var(--p-rose)) 16%, var(--p-surface));
}
.goal-card.is-rose {
  --tag-color: var(--p-rose);
  --tag-ink: var(--p-rose-ink);
}
.goal-card.is-blue {
  --tag-color: var(--p-blue);
  --tag-ink: var(--p-blue-ink);
}
.goal-card.is-green {
  --tag-color: var(--p-green);
  --tag-ink: var(--p-green-ink);
}
.goal-card.is-lavender {
  --tag-color: var(--p-lavender);
  --tag-ink: var(--p-lavender-ink);
}
.goal-card.is-amber {
  --tag-color: var(--p-amber);
  --tag-ink: var(--p-amber-ink);
}
.goal-card.is-teal {
  --tag-color: var(--p-teal);
  --tag-ink: var(--p-teal-ink);
}
.goal-card.is-plum {
  --tag-color: var(--p-plum);
  --tag-ink: var(--p-plum-ink);
}
.goal-card.is-slate {
  --tag-color: var(--p-slate);
  --tag-ink: var(--p-slate-ink);
}
.goal-card.is-selected {
  box-shadow:
    0 0 0 2.5px var(--tag-color, var(--p-rose)),
    var(--p-shadow-raised-sm);
}
h3 {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0 0 12px;
}
.parent {
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  margin: -8px 0 12px;
}
.meta {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  margin: 6px 0 0;
}
</style>
