// 카테고리·월간 목표·주간 목표 스토어. 데이터는 goalRepository를 통해서만 읽고 쓴다.
// weeklyGoalsById/monthlyGoalsById/categoriesById는 Map 기반 캐싱 getter —
// entities/derive.ts의 resolveCategory 등에 넘길 때 매번 find()로 순회하거나
// new Map(...)을 새로 만들지 않기 위해서다 (CLAUDE.md 16절 가드레일).

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getSeedCategories,
  getSeedMonthlyGoals,
  getSeedWeeklyGoals,
  updateWeeklyGoal as updateWeeklyGoalInRepository,
} from '../lib/goalRepository'
import type { WeeklyGoal } from '../../../entities/types'

export const useGoalStore = defineStore('goal', () => {
  const categories = getSeedCategories()
  const monthlyGoals = getSeedMonthlyGoals()
  // taskStore.tasks와 같은 이유로 얕은 복사해서 스토어 자신만의 반응형 상태로 둔다.
  const weeklyGoals = ref<WeeklyGoal[]>([...getSeedWeeklyGoals()])

  const categoriesById = computed(() => new Map(categories.map((c) => [c.id, c])))
  const monthlyGoalsById = computed(() => new Map(monthlyGoals.map((g) => [g.id, g])))
  const weeklyGoalsById = computed(() => new Map(weeklyGoals.value.map((g) => [g.id, g])))

  function updateWeeklyGoal(id: string, patch: Partial<WeeklyGoal>) {
    const index = weeklyGoals.value.findIndex((g) => g.id === id)
    if (index === -1) return
    weeklyGoals.value[index] = { ...weeklyGoals.value[index], ...patch }
    updateWeeklyGoalInRepository(id, patch)
  }

  return {
    categories,
    monthlyGoals,
    weeklyGoals,
    categoriesById,
    monthlyGoalsById,
    weeklyGoalsById,
    updateWeeklyGoal,
  }
})
