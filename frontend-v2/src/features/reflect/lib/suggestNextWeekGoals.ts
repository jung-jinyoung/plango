// 다음 주 목표 제안 3종을 규칙 기반으로 만든다 — AI 연동(decomposeMonthlyGoal 등)은
// 아직 없어서(features/ai/ 빈 폴더) 최소한의 규칙으로 대체한다. features/reflect는
// goal·task를 참조할 수 있는 유일한 예외다(CLAUDE.md 6절).
//
// R6(제안 → 사용자 수락 → 변경): 이 함수는 순수 함수라 호출해도 스토어가 바뀌지
// 않는다 — 실제 WeeklyGoal 생성은 호출부(페이지)가 사용자 확정 후에만 한다.

import { monthlyCurrentHours } from '../../../entities/derive'
import type { Category, CategoryColor, MonthlyGoal, Task, WeeklyGoal } from '../../../entities/types'

export interface NextWeekSuggestion {
  key: string
  title: string
  subtitle: string
  hours: number
  monthlyGoalId: string | null
  color: CategoryColor
}

function colorOfMonthlyGoal(
  monthlyGoalId: string | null,
  monthlyGoalsById: Map<string, MonthlyGoal>,
  categories: Map<string, Category>,
): CategoryColor {
  if (!monthlyGoalId) return 'gray'
  const monthlyGoal = monthlyGoalsById.get(monthlyGoalId)
  if (!monthlyGoal) return 'gray'
  return categories.get(monthlyGoal.categoryId)?.color ?? 'gray'
}

/**
 * @param lastMonday 지난주 월요일(weekOf) — "지난주에 잘 지켰어요" 후보 판정 기준
 * @param availableHours 이번에 다음 주에 쓸 수 있는 시간(주간 가용 시간, 6-5절) —
 *   이월·습관 후보를 뺀 나머지를 "월간 목표 다음 항목" 후보의 상한으로 쓴다.
 */
export function suggestNextWeekGoals(
  weeklyGoals: WeeklyGoal[],
  monthlyGoals: MonthlyGoal[],
  categories: Map<string, Category>,
  tasks: Task[],
  lastMonday: string,
  availableHours: number,
): NextWeekSuggestion[] {
  const monthlyGoalsById = new Map(monthlyGoals.map((m) => [m.id, m]))
  const suggestions: NextWeekSuggestion[] = []

  // 1) 이월 이어짐 — carryCount>0인 active 목표를 그대로(재추정된 estimatedHours로) 이어간다.
  const carrying = weeklyGoals.find((g) => g.status === 'active' && g.carryCount > 0)
  if (carrying) {
    suggestions.push({
      key: `carry-${carrying.id}`,
      title: carrying.title,
      subtitle: '지난주에서 이어져요',
      hours: carrying.estimatedHours,
      monthlyGoalId: carrying.monthlyGoalId,
      color: colorOfMonthlyGoal(carrying.monthlyGoalId, monthlyGoalsById, categories),
    })
  }

  // 2) 습관 유지 — 지난주 achieved 목표 중 이월 후보와는 다른 월간 목표 소속인 것.
  const habit = weeklyGoals.find(
    (g) =>
      g.status === 'achieved' &&
      g.weekOf === lastMonday &&
      g.monthlyGoalId !== carrying?.monthlyGoalId,
  )
  if (habit) {
    suggestions.push({
      key: `habit-${habit.id}`,
      title: habit.title,
      subtitle: '지난주에 잘 지켰어요',
      hours: habit.estimatedHours,
      monthlyGoalId: habit.monthlyGoalId,
      color: colorOfMonthlyGoal(habit.monthlyGoalId, monthlyGoalsById, categories),
    })
  }

  // 3) 월간 목표 다음 항목 — remaining(=baseline-현재 소요)이 남은 월간 목표 중
  // 이월 후보로 이미 대표된 것은 제외한다. baseline을 이미 넘긴 목표는 후보를
  // 만들지 않는다(범위 초과는 별도 월간 경고가 다룰 일). 남은 가용 시간을 넘지
  // 않도록 캡을 씌운다.
  const usedHours = suggestions.reduce((sum, s) => sum + s.hours, 0)
  const remainingBudget = Math.max(0, availableHours - usedHours)
  if (remainingBudget > 0) {
    const weeklyEntries = weeklyGoals.map((goal) => ({
      goal,
      tasks: tasks.filter((t) => t.weeklyGoalId === goal.id),
    }))
    for (const monthlyGoal of monthlyGoals) {
      if (monthlyGoal.status !== 'active') continue
      if (monthlyGoal.id === carrying?.monthlyGoalId) continue
      const remaining = monthlyGoal.baselineHours - monthlyCurrentHours(monthlyGoal, weeklyEntries)
      if (remaining <= 0) continue
      suggestions.push({
        key: `monthly-${monthlyGoal.id}`,
        title: monthlyGoal.title,
        subtitle: '이번 달 목표에서 이어져요',
        hours: Math.min(remaining, remainingBudget),
        monthlyGoalId: monthlyGoal.id,
        color: colorOfMonthlyGoal(monthlyGoal.id, monthlyGoalsById, categories),
      })
      break // 한 번에 하나만 — 여러 월간 목표를 동시에 얹으면 과부하로 이어진다
    }
  }

  return suggestions
}
