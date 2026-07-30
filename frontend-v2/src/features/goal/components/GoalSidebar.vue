<template>
  <BaseCard>
    <div v-if="monthly" class="monthly">
      <div class="label">이번 달 목표</div>
      <div class="title">{{ monthly.goal.title }}</div>
      <ProgressBar :percent="monthlyPercent" :color="monthly.color" />
      <div class="meta">
        <span>{{ monthly.currentHours.toFixed(0) }}시간 썼어요</span>
        <span>{{ monthly.goal.baselineHours }}시간 예상</span>
      </div>
    </div>

    <div class="label" :class="{ 'with-margin': monthly }">이번 주 목표</div>
    <div v-for="entry in weeklyEntries" :key="entry.goal.id" class="weekly" :class="{ done: entry.goal.status === 'achieved' }">
      <div class="row">
        <Dot :color="entry.color" />
        <span class="name">{{ entry.goal.title }}</span>
        <span class="num">{{ entry.actualHours.toFixed(0) }} / {{ entry.goal.estimatedHours }}h</span>
      </div>
      <ProgressBar :percent="entry.percent" :color="entry.color" :muted="entry.goal.status === 'achieved'" />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  categoryColorOf,
  monthlyCurrentHours,
  resolveCategoryForMonthlyGoal,
  resolveCategoryForWeeklyGoal,
  weeklyProgress,
} from '../../../entities/derive'
import type { Category, MonthlyGoal, Task, WeeklyGoal } from '../../../entities/types'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import Dot from '../../../shared/ui/Dot.vue'
import ProgressBar from '../../../shared/ui/ProgressBar.vue'

const props = defineProps<{
  monthlyGoal: MonthlyGoal | null
  weeklyGoals: WeeklyGoal[]
  tasks: Task[]
  monthlyGoalsById: Map<string, MonthlyGoal>
  categoriesById: Map<string, Category>
}>()

const monthly = computed(() => {
  if (!props.monthlyGoal) return null
  const goal = props.monthlyGoal
  const weeklyEntries = props.weeklyGoals
    .filter((g) => g.monthlyGoalId === goal.id)
    .map((g) => ({ goal: g, tasks: props.tasks.filter((t) => t.weeklyGoalId === g.id) }))
  return {
    goal,
    color: categoryColorOf(resolveCategoryForMonthlyGoal(goal, props.categoriesById)),
    currentHours: monthlyCurrentHours(goal, weeklyEntries),
  }
})

const monthlyPercent = computed(() => {
  if (!monthly.value || monthly.value.goal.baselineHours <= 0) return 0
  return (monthly.value.currentHours / monthly.value.goal.baselineHours) * 100
})

const weeklyEntries = computed(() =>
  props.weeklyGoals.map((goal) => {
    const goalTasks = props.tasks.filter((t) => t.weeklyGoalId === goal.id)
    const percent = weeklyProgress(goal, goalTasks)
    return {
      goal,
      color: categoryColorOf(resolveCategoryForWeeklyGoal(goal, props.monthlyGoalsById, props.categoriesById)),
      percent,
      actualHours: (percent / 100) * goal.estimatedHours,
    }
  }),
)
</script>

<style scoped>
.monthly {
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 18px;
}
.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.label.with-margin {
  margin-top: 4px;
}
.title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 10px;
}
.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.weekly {
  margin-bottom: 16px;
}
.weekly:last-child {
  margin-bottom: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
}
.name {
  font-weight: 500;
  font-size: 13.5px;
  flex: 1;
}
.num {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.weekly.done .name {
  color: var(--text-muted);
}
</style>
