<template>
  <div class="goal-panel">
    <div class="panel-head">
      <h2>{{ title }}</h2>
      <button type="button" class="add-btn" @click="$emit('add')">+ 목표 추가</button>
    </div>
    <div class="list">
      <p v-if="loading && goals.length === 0" class="empty">불러오는 중…</p>
      <p v-else-if="error" class="empty is-error">목표를 불러오지 못했어요.</p>
      <template v-else>
        <template v-if="groups">
          <div v-for="(group, i) in groups" :key="group.parent?.id ?? `unassigned-${i}`" class="goal-group">
            <h3 v-if="group.parent" class="group-header">
              <span class="group-dot" :class="`is-${group.parent.color}`" />
              {{ group.parent.title }}
            </h3>
            <p v-else class="group-header is-unassigned">미분류</p>
            <GoalCard
              v-for="goal in group.weeklyGoals"
              :key="goal.id"
              :goal="goal"
              :selected="goal.id === selectedGoalId"
              @select="$emit('select', goal.id)"
              @details="$emit('details', goal.id)"
            />
          </div>
        </template>
        <template v-else>
          <GoalCard
            v-for="goal in goals"
            :key="goal.id"
            :goal="goal"
            :selected="goal.id === selectedGoalId"
            @select="$emit('select', goal.id)"
            @details="$emit('details', goal.id)"
          />
        </template>
        <p v-if="goals.length === 0" class="empty">아직 등록된 목표가 없어요.</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GoalCard from './GoalCard.vue'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  title: { type: String, required: true },
  goals: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: Object, default: null },
  selectedGoalId: { type: [String, Number], default: null },
})
defineEmits(['select', 'add', 'details'])

const goalStore = useGoalStore()

// 주간 목표 목록일 때만 상위 월간목표별로 묶는다 (월간 목표 목록은 상위가 없어 그룹핑 대상이 아님)
const isWeeklyList = computed(() => props.goals.length > 0 && 'monthlyGoalId' in props.goals[0])

const groups = computed(() => {
  if (!isWeeklyList.value) return null
  const byMonthly = new Map()
  const orphans = []
  for (const g of props.goals) {
    if (!g.monthlyGoalId) {
      orphans.push(g)
      continue
    }
    if (!byMonthly.has(g.monthlyGoalId)) byMonthly.set(g.monthlyGoalId, [])
    byMonthly.get(g.monthlyGoalId).push(g)
  }
  const result = [...byMonthly.values()].map((weeklyGoals) => ({
    parent: goalStore.parentOf(weeklyGoals[0]),
    weeklyGoals,
  }))
  if (orphans.length) result.push({ parent: null, weeklyGoals: orphans })
  return result
})
</script>

<style scoped>
.goal-panel {
  width: 100%;
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
h2 {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0;
}
.add-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.82rem;
  font-weight: 600;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
}
.empty.is-error {
  color: var(--p-rose-ink);
}
.goal-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0;
}
.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.group-dot.is-rose {
  background: var(--p-rose);
}
.group-dot.is-blue {
  background: var(--p-blue);
}
.group-dot.is-green {
  background: var(--p-green);
}
.group-dot.is-lavender {
  background: var(--p-lavender);
}
.group-dot.is-amber {
  background: var(--p-amber);
}
.group-dot.is-teal {
  background: var(--p-teal);
}
.group-dot.is-plum {
  background: var(--p-plum);
}
.group-dot.is-slate {
  background: var(--p-slate);
}
.group-header.is-unassigned {
  color: var(--p-ink-faint);
  font-weight: 600;
  font-size: 0.8rem;
}
</style>
