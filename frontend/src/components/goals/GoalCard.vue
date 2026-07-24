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
    <span v-if="categoryLabel" class="color-chip">{{ categoryLabel }}</span>
    <h3>{{ goal.title }}</h3>
    <ProgressBar :value="goal.progress" :color="goal.color" show-label />
    <p class="meta">{{ goal.doneCount }}/{{ goal.taskCount }} 완료</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useCategoryStore } from '@/stores/categories'

const props = defineProps({
  // { id, title, progress, color, taskCount, doneCount, monthlyGoalId? } — monthlyGoalId만 있으면 주간 목표
  goal: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})
defineEmits(['select', 'details'])

const categoryStore = useCategoryStore()
const isWeekly = computed(() => 'monthlyGoalId' in props.goal)
// 월간 목표는 상위가 없으니, 대신 자신에게 지정된 카테고리 이름을 칩으로 보여준다
// (주간 목표의 상위 월간목표 참조는 이제 GoalPanel의 섹션 헤더가 담당한다)
const categoryLabel = computed(() =>
  isWeekly.value ? null : (categoryStore.categories.find((c) => c.color === props.goal.color)?.name ?? null),
)
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
.color-chip {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  margin: 0 0 10px;
  color: var(--tag-ink, var(--p-rose-ink));
  background: color-mix(in srgb, var(--tag-color, var(--p-rose)) 16%, var(--p-surface));
}
.meta {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  margin: 6px 0 0;
}
</style>
