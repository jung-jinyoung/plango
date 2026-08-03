// 카테고리·월간 목표·주간 목표 스토어. 데이터는 goalRepository를 통해서만 읽고 쓴다.
// weeklyGoalsById/monthlyGoalsById/categoriesById는 Map 기반 캐싱 getter —
// entities/derive.ts의 resolveCategory 등에 넘길 때 매번 find()로 순회하거나
// new Map(...)을 새로 만들지 않기 위해서다 (CLAUDE.md 16절 가드레일).

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addMonthlyGoal as addMonthlyGoalInRepository,
  addWeeklyGoal as addWeeklyGoalInRepository,
  getSeedCategories,
  getSeedMonthlyGoals,
  getSeedWeeklyGoals,
  updateWeeklyGoal as updateWeeklyGoalInRepository,
} from '../lib/goalRepository'
import type { MonthlyGoal, WeeklyGoal } from '../../../entities/types'

export const useGoalStore = defineStore('goal', () => {
  const categories = getSeedCategories()
  // weeklyGoals와 같은 이유로 얕은 복사해서 스토어 자신만의 반응형 상태로 둔다.
  const monthlyGoals = ref<MonthlyGoal[]>([...getSeedMonthlyGoals()])
  const weeklyGoals = ref<WeeklyGoal[]>([...getSeedWeeklyGoals()])

  const categoriesById = computed(() => new Map(categories.map((c) => [c.id, c])))
  const monthlyGoalsById = computed(() => new Map(monthlyGoals.value.map((g) => [g.id, g])))
  const weeklyGoalsById = computed(() => new Map(weeklyGoals.value.map((g) => [g.id, g])))

  function updateWeeklyGoal(id: string, patch: Partial<WeeklyGoal>) {
    const index = weeklyGoals.value.findIndex((g) => g.id === id)
    if (index === -1) return
    weeklyGoals.value[index] = { ...weeklyGoals.value[index], ...patch }
    updateWeeklyGoalInRepository(id, patch)
  }

  // "다음 주 목표 제안" 확정 시 호출 — CLAUDE.md 6-3절(이월은 새 항목 생성).
  // 같은 id가 이미 있으면(중복 확정 등) 아무 것도 안 한다.
  function addWeeklyGoal(goal: WeeklyGoal) {
    if (weeklyGoalsById.value.has(goal.id)) return
    weeklyGoals.value.push(goal)
    addWeeklyGoalInRepository(goal)
  }

  // 온보딩 "이대로 시작하기" 확정 시 호출. addWeeklyGoal과 같은 이유로 중복 id는 무시한다.
  function addMonthlyGoal(goal: MonthlyGoal) {
    if (monthlyGoalsById.value.has(goal.id)) return
    monthlyGoals.value.push(goal)
    addMonthlyGoalInRepository(goal)
  }

  return {
    categories,
    monthlyGoals,
    weeklyGoals,
    categoriesById,
    monthlyGoalsById,
    weeklyGoalsById,
    updateWeeklyGoal,
    addWeeklyGoal,
    addMonthlyGoal,
  }
})
