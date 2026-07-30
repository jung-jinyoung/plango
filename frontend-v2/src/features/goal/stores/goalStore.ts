// 카테고리·월간 목표·주간 목표 스토어. 데이터는 goalRepository를 통해서만 읽는다.
// weeklyGoalsById/monthlyGoalsById/categoriesById는 Map 기반 캐싱 getter —
// entities/derive.ts의 resolveCategory 등에 넘길 때 매번 find()로 순회하거나
// new Map(...)을 새로 만들지 않기 위해서다 (CLAUDE.md 16절 가드레일).

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { getSeedCategories, getSeedMonthlyGoals, getSeedWeeklyGoals } from '../lib/goalRepository'

export const useGoalStore = defineStore('goal', () => {
  const categories = getSeedCategories()
  const monthlyGoals = getSeedMonthlyGoals()
  const weeklyGoals = getSeedWeeklyGoals()

  const categoriesById = computed(() => new Map(categories.map((c) => [c.id, c])))
  const monthlyGoalsById = computed(() => new Map(monthlyGoals.map((g) => [g.id, g])))
  const weeklyGoalsById = computed(() => new Map(weeklyGoals.map((g) => [g.id, g])))

  return {
    categories,
    monthlyGoals,
    weeklyGoals,
    categoriesById,
    monthlyGoalsById,
    weeklyGoalsById,
  }
})
