// 진입 라우팅(CLAUDE.md 12절) 판정. features/reflect는 goal·task를 참조할
// 수 있는 유일한 예외다(CLAUDE.md 6절) — 여기서 6가지 조건을 위에서부터
// 순서대로 확인해 첫 일치를 route name으로 돌려준다(resolveEntry).

import { lastActiveDate } from '../../../entities/derive'
import { daysSince, isAfter18 } from '../../../shared/lib/time'
import type { MonthlyGoal, Task, WeeklyGoal } from '../../../entities/types'

/** 조건 1: 월간 목표가 하나도 없다 → onboarding */
export function hasNoMonthlyGoal(monthlyGoals: MonthlyGoal[]): boolean {
  return monthlyGoals.length === 0
}

/**
 * 조건 2: 이번 주(currentMonday)에 해당하는 주간 목표가 하나도 없다 → reflect-week.
 * 주간 목표는 온보딩(4주치 한 번에) 또는 주간 회고의 "다음 주 목표로
 * 확정하기"(일괄 확정, 부분 확정 없음)로만 생성되므로, 이번 주 항목이
 * 하나도 없다는 건 그 주로 넘어오는 회고를 아직 안 끝냈다는 뜻과 같다 —
 * "회고 완료" 여부를 담을 별도 필드 없이 기존 데이터로 판정한다.
 */
export function isNewWeekUnreflected(weeklyGoals: WeeklyGoal[], currentMonday: string): boolean {
  return !weeklyGoals.some((g) => g.weekOf === currentMonday)
}

/**
 * 조건 3: 마지막 활동(lastActiveDate)으로부터 thresholdDays(기본 3일) 이상
 * 지났다 → 복귀 리셋(today로 보내되 "조용히 아카이브" — filterStaleCarried로
 * 오래된 carried task를 화면에서만 걸러낸다. status는 안 건드린다, R4).
 * lastActive가 null(활동 기록이 전혀 없어 판정 불가)이면 false.
 */
export function hasLongActivityGap(
  lastActive: string | null,
  today: string,
  thresholdDays = 3,
): boolean {
  if (lastActive === null) return false
  return daysSince(lastActive, today) >= thresholdDays
}

/**
 * 조건 4: 오늘 마감(reflectionStore.isDayReflected)을 안 했고 18시 이후다
 * → reflect-day. "오늘 마감"은 Task 단위가 아니라 하루 단위 사실이라
 * reflectionStore(day-level 상태)에서 이미 판정된 boolean을 그대로 받는다 —
 * 이 함수는 그 값과 시각만 조합한다.
 */
export function hasNotReflectedTodayAfterEvening(isTodayReflected: boolean, nowIso: string): boolean {
  return !isTodayReflected && isAfter18(nowIso)
}

/** 조건 5: 오늘 계획된(plannedBlock 있는) task가 없고, 아직 18시 이전이다 → today(계획 모드) */
export function hasNoTodayPlanBeforeEvening(tasks: Task[], today: string, nowIso: string): boolean {
  const hasTodayPlan = tasks.some((t) => t.plannedBlock?.start.startsWith(today))
  return !hasTodayPlan && !isAfter18(nowIso)
}

export type EntryRouteName = 'onboarding' | 'reflect-week' | 'reflect-day' | 'today'

export interface ResolveEntryInput {
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  tasks: Task[]
  currentMonday: string
  today: string
  nowIso: string
  isTodayReflected: boolean
}

/**
 * 진입 라우팅(CLAUDE.md 12절) 6가지 조건을 위에서부터 순서대로 확인해
 * 첫 일치를 route name으로 돌려준다. 강제 이동이 아니라 "기본 도착지"일
 * 뿐이다 — 호출부(router beforeEach)가 사용자의 명시적 네비게이션까지
 * 가로채지 않도록 처리한다(여기선 순수하게 판정만 한다).
 *
 * 조건 3(복귀 리셋)의 "조용히 아카이브"는 이 함수의 반환값과 무관하다 —
 * TodayPage.vue가 filterStaleCarried로 항상 적용하는 화면 표시 필터라서,
 * 여기선 그냥 'today'를 돌려주면 된다(별도 route가 아님, CLAUDE.md 12절).
 */
export function resolveEntry(input: ResolveEntryInput): EntryRouteName {
  if (hasNoMonthlyGoal(input.monthlyGoals)) return 'onboarding'
  if (isNewWeekUnreflected(input.weeklyGoals, input.currentMonday)) return 'reflect-week'
  if (hasLongActivityGap(lastActiveDate(input.tasks, input.today), input.today)) return 'today'
  if (hasNotReflectedTodayAfterEvening(input.isTodayReflected, input.nowIso)) return 'reflect-day'
  if (hasNoTodayPlanBeforeEvening(input.tasks, input.today, input.nowIso)) return 'today'
  return 'today'
}
