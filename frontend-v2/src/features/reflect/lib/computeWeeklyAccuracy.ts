// weeklyGoals·tasks를 받아 목표별 예상 정확도를 구하는 얇은 조합 함수.
// entities/derive.ts의 accuracyRatio를 목표 단위로 묶어 호출할 뿐, 별도 로직은 없다.
// features/reflect는 goal·task를 참조할 수 있는 유일한 예외다(CLAUDE.md 6절) —
// 여기서만 두 feature의 데이터를 조합해도 된다. 반대 방향(goal·task가 reflect를
// 참조)은 여전히 금지.

import { accuracyRatio } from '../../../entities/derive'
import type { Task, WeeklyGoal } from '../../../entities/types'

export interface WeeklyAccuracy {
  weeklyGoalId: string
  ratio: number
}

export function computeWeeklyAccuracy(weeklyGoals: WeeklyGoal[], tasks: Task[]): WeeklyAccuracy[] {
  return weeklyGoals.map((goal) => ({
    weeklyGoalId: goal.id,
    ratio: accuracyRatio(tasks.filter((t) => t.weeklyGoalId === goal.id)),
  }))
}
