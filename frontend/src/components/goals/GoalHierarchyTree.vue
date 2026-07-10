<template>
  <div class="tree-wrap">
    <nav class="breadcrumb" aria-label="목표 계층 경로">
      <span :class="{ current: !activeMonthly }">목표 관리</span>
      <template v-if="activeMonthly">
        <span class="sep">›</span>
        <span :class="{ current: !activeWeekly }">{{ activeMonthly.title }}</span>
      </template>
      <template v-if="activeWeekly">
        <span class="sep">›</span>
        <span class="current">{{ activeWeekly.title }}</span>
      </template>
    </nav>

    <p v-if="goalStore.loading && goalStore.monthlyGoals.length === 0" class="empty">불러오는 중…</p>
    <p v-else-if="goalStore.error" class="empty">목표를 불러오지 못했어요.</p>
    <div v-else class="accordion-list">
      <BaseAccordion
        v-for="monthly in goalStore.monthlyGoals"
        :key="monthly.id"
        :model-value="!!expandedMonthly[monthly.id]"
        @update:model-value="toggleMonthly(monthly, $event)"
      >
        <template #header>
          <GoalHeaderRow :goal="monthly" />
        </template>

        <div class="weekly-list">
          <BaseAccordion
            v-for="weekly in weeklyChildrenOf(monthly.id)"
            :key="weekly.id"
            :model-value="!!expandedWeekly[weekly.id]"
            @update:model-value="toggleWeekly(weekly, $event)"
          >
            <template #header>
              <GoalHeaderRow :goal="weekly" />
            </template>

            <div class="todo-list">
              <TodoItem
                v-for="todo in todosOf(weekly.id)"
                :key="todo.id"
                :todo="todo"
                :draggable="false"
                :deletable="false"
                @toggle="todoStore.toggleTodo(todo.dateISO, todo.id)"
              />
              <p v-if="todosOf(weekly.id).length === 0" class="empty">태그된 할 일이 없어요.</p>
            </div>
          </BaseAccordion>
          <p v-if="weeklyChildrenOf(monthly.id).length === 0" class="empty">연결된 주간 목표가 없어요.</p>
        </div>
      </BaseAccordion>

      <p v-if="goalStore.monthlyGoals.length === 0" class="empty">아직 등록된 목표가 없어요.</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, watchEffect } from 'vue'
import BaseAccordion from '@/components/ui/BaseAccordion.vue'
import TodoItem from '@/components/daily-plan/TodoItem.vue'
import GoalHeaderRow from './GoalHeaderRow.vue'
import { useGoalStore } from '@/stores/goals'
import { useTodoStore } from '@/stores/todos'

const props = defineProps({
  initialMonthlyId: { type: String, default: null },
  initialWeeklyId: { type: String, default: null },
})

const goalStore = useGoalStore()
const todoStore = useTodoStore()

onMounted(() => goalStore.load())

const expandedMonthly = reactive({})
const expandedWeekly = reactive({})

watchEffect(() => {
  if (props.initialMonthlyId) expandedMonthly[props.initialMonthlyId] = true
  if (props.initialWeeklyId) {
    expandedWeekly[props.initialWeeklyId] = true
    const weekly = goalStore.weeklyGoals.find((w) => w.id === props.initialWeeklyId)
    if (weekly?.monthlyGoalId) expandedMonthly[weekly.monthlyGoalId] = true
  }
})

const activeMonthly = computed(
  () => goalStore.monthlyGoals.find((g) => expandedMonthly[g.id]) ?? null,
)
const activeWeekly = computed(() => goalStore.weeklyGoals.find((g) => expandedWeekly[g.id]) ?? null)

function toggleMonthly(goal, value) {
  expandedMonthly[goal.id] = value
}
function toggleWeekly(goal, value) {
  expandedWeekly[goal.id] = value
}

function weeklyChildrenOf(monthlyId) {
  return goalStore.weeklyGoals.filter((w) => w.monthlyGoalId === monthlyId)
}

function todosOf(weeklyId) {
  const result = []
  for (const [dateISO, todos] of Object.entries(todoStore.todosByDate)) {
    for (const todo of todos) {
      if (todo.goalId === weeklyId) result.push({ ...todo, dateISO })
    }
  }
  return result
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--p-ink-faint);
  margin-bottom: 20px;
}
.breadcrumb .current {
  color: var(--p-ink);
  font-weight: 600;
}
.sep {
  color: var(--p-ink-faint);
}
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.weekly-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.todo-list {
  display: flex;
  flex-direction: column;
}
.todo-list > :deep(.todo-item) + :deep(.todo-item) {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 6%, transparent);
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
  padding: 4px 0;
}
</style>
