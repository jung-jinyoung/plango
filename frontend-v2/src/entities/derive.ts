// 파생 함수 — 저장하지 않는다 (CLAUDE.md 4절)

import { minutesBetween } from '../shared/lib/time'
import type { Category, CategoryColor, MonthlyGoal, Task, WeeklyGoal } from './types'

/** Dot/Chip 등에 색을 넘길 때 이 함수를 거친다 — 컴포넌트마다 `?? 'gray'`를 반복하지 않는다 */
export function categoryColorOf(category: Category | null): CategoryColor {
  return category?.color ?? 'gray'
}

/**
 * 목표 체인(주간 목표 → 월간 목표 → 카테고리)을 먼저 따라가고,
 * 체인이 없으면(= 약속) task.categoryId를 그대로 쓴다.
 */
export function resolveCategory(
  task: Task,
  weeklyGoals: Map<string, WeeklyGoal>,
  monthlyGoals: Map<string, MonthlyGoal>,
  categories: Map<string, Category>,
): Category | null {
  if (task.weeklyGoalId) {
    const weeklyGoal = weeklyGoals.get(task.weeklyGoalId)
    const monthlyGoal = weeklyGoal?.monthlyGoalId
      ? monthlyGoals.get(weeklyGoal.monthlyGoalId)
      : undefined
    if (monthlyGoal) return categories.get(monthlyGoal.categoryId) ?? null
  }
  return task.categoryId ? (categories.get(task.categoryId) ?? null) : null
}

/** actualBlock에서 계산한 실제 소요 분. 기록 전이면 0 */
export function actualMin(task: Task): number {
  if (!task.actualBlock) return 0
  return minutesBetween(task.actualBlock.start, task.actualBlock.end)
}

/**
 * 주간 목표 진도 (0~100+, %). tasks는 호출부에서 이 goal에 속한 것만 걸러서 넘긴다.
 * estimatedHours가 0 이하면 나눌 수 없으니 0을 반환한다.
 */
export function weeklyProgress(goal: WeeklyGoal, tasks: Task[]): number {
  const estimatedMin = goal.estimatedHours * 60
  if (estimatedMin <= 0) return 0
  const totalActualMin = tasks.reduce((sum, task) => sum + actualMin(task), 0)
  return (totalActualMin / estimatedMin) * 100
}

/**
 * 월간 목표의 현재 소요 시간(시간 단위) = 완료된 주간 목표의 실측 합
 * + 진행 중(active/carried) 주간 목표의 재추정(estimatedHours) 합.
 * dropped 주간 목표는 포함하지 않는다.
 */
export function monthlyCurrentHours(
  monthlyGoal: MonthlyGoal,
  weeklyEntries: { goal: WeeklyGoal; tasks: Task[] }[],
): number {
  let totalMin = 0
  for (const { goal, tasks } of weeklyEntries) {
    if (goal.monthlyGoalId !== monthlyGoal.id) continue
    if (goal.status === 'achieved') {
      totalMin += tasks.reduce((sum, task) => sum + actualMin(task), 0)
    } else if (goal.status === 'active' || goal.status === 'carried') {
      totalMin += goal.estimatedHours * 60
    }
  }
  return totalMin / 60
}

/**
 * 예상 정확도 = Σ실제 / Σ예상. 값이 클수록 예상보다 오래 걸렸다는 뜻.
 * 예상 합이 0 이하면 판정할 수 없으니 0을 반환한다.
 */
export function accuracyRatio(tasks: Task[]): number {
  const totalEstimatedMin = tasks.reduce((sum, task) => sum + task.estimatedMin, 0)
  if (totalEstimatedMin <= 0) return 0
  const totalActualMin = tasks.reduce((sum, task) => sum + actualMin(task), 0)
  return totalActualMin / totalEstimatedMin
}
