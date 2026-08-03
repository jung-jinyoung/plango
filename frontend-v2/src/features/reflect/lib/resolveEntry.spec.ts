import { describe, expect, it } from 'vitest'
import type { MonthlyGoal, Task, WeeklyGoal } from '../../../entities/types'
import {
  hasLongActivityGap,
  hasNoMonthlyGoal,
  hasNotReflectedTodayAfterEvening,
  hasNoTodayPlanBeforeEvening,
  isNewWeekUnreflected,
  resolveEntry,
  type ResolveEntryInput,
} from './resolveEntry'

function makeMonthlyGoal(overrides: Partial<MonthlyGoal>): MonthlyGoal {
  return {
    id: 'mg1',
    title: '논문 초고 완성',
    month: '2026-07',
    categoryId: 'cat1',
    baselineHours: 40,
    status: 'active',
    ...overrides,
  }
}

function makeWeeklyGoal(overrides: Partial<WeeklyGoal>): WeeklyGoal {
  return {
    id: 'wg1',
    title: '결과 파트 작성',
    weekOf: '2026-07-27',
    monthlyGoalId: 'mg1',
    estimatedHours: 10,
    carryCount: 0,
    status: 'active',
    ...overrides,
  }
}

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't1',
    title: '할 일',
    weeklyGoalId: null,
    categoryId: null,
    estimatedMin: 60,
    plannedBlock: null,
    actualBlock: null,
    status: 'todo',
    confirmed: false,
    ...overrides,
  }
}

describe('hasNoMonthlyGoal', () => {
  it('월간 목표가 없으면 true', () => {
    expect(hasNoMonthlyGoal([])).toBe(true)
  })

  it('월간 목표가 하나라도 있으면 false', () => {
    expect(hasNoMonthlyGoal([makeMonthlyGoal({})])).toBe(false)
  })
})

describe('isNewWeekUnreflected', () => {
  it('이번 주에 해당하는 주간 목표가 없으면 true(회고 미완)', () => {
    const goals = [makeWeeklyGoal({ weekOf: '2026-07-20' })]
    expect(isNewWeekUnreflected(goals, '2026-07-27')).toBe(true)
  })

  it('이번 주에 해당하는 주간 목표가 있으면 false', () => {
    const goals = [makeWeeklyGoal({ weekOf: '2026-07-27' })]
    expect(isNewWeekUnreflected(goals, '2026-07-27')).toBe(false)
  })

  it('주간 목표가 하나도 없으면 true', () => {
    expect(isNewWeekUnreflected([], '2026-07-27')).toBe(true)
  })
})

describe('hasLongActivityGap', () => {
  it('마지막 활동이 thresholdDays(기본 3일) 이상 전이면 true', () => {
    expect(hasLongActivityGap('2026-07-26', '2026-07-29')).toBe(true)
  })

  it('thresholdDays 미만이면 false', () => {
    expect(hasLongActivityGap('2026-07-27', '2026-07-29')).toBe(false)
  })

  it('lastActive가 null(활동 기록 없음)이면 판정 불가라 false', () => {
    expect(hasLongActivityGap(null, '2026-07-29')).toBe(false)
  })

  it('thresholdDays를 커스텀할 수 있다', () => {
    expect(hasLongActivityGap('2026-07-27', '2026-07-29', 2)).toBe(true)
  })
})

describe('hasNotReflectedTodayAfterEvening', () => {
  it('마감 안 했고 18시 이후면 true', () => {
    expect(hasNotReflectedTodayAfterEvening(false, '2026-07-29T19:00:00+09:00')).toBe(true)
  })

  it('마감했으면 18시 이후여도 false', () => {
    expect(hasNotReflectedTodayAfterEvening(true, '2026-07-29T19:00:00+09:00')).toBe(false)
  })

  it('마감 안 했어도 18시 이전이면 false', () => {
    expect(hasNotReflectedTodayAfterEvening(false, '2026-07-29T10:00:00+09:00')).toBe(false)
  })
})

describe('hasNoTodayPlanBeforeEvening', () => {
  it('오늘 계획이 없고 18시 이전이면 true', () => {
    const tasks = [
      makeTask({ plannedBlock: { start: '2026-07-28T09:00:00+09:00', end: '2026-07-28T10:00:00+09:00' } }),
    ]
    expect(hasNoTodayPlanBeforeEvening(tasks, '2026-07-29', '2026-07-29T10:00:00+09:00')).toBe(true)
  })

  it('오늘 계획이 있으면 false(시간대 무관)', () => {
    const tasks = [
      makeTask({ plannedBlock: { start: '2026-07-29T09:00:00+09:00', end: '2026-07-29T10:00:00+09:00' } }),
    ]
    expect(hasNoTodayPlanBeforeEvening(tasks, '2026-07-29', '2026-07-29T10:00:00+09:00')).toBe(false)
  })

  it('오늘 계획이 없어도 18시 이후면 false', () => {
    expect(hasNoTodayPlanBeforeEvening([], '2026-07-29', '2026-07-29T19:00:00+09:00')).toBe(false)
  })

  it('task가 하나도 없으면 오늘 계획도 없는 것이다', () => {
    expect(hasNoTodayPlanBeforeEvening([], '2026-07-29', '2026-07-29T10:00:00+09:00')).toBe(true)
  })
})

describe('resolveEntry', () => {
  const TODAY = '2026-07-29'
  const CURRENT_MONDAY = '2026-07-27'

  // 아무 조건도 안 걸리는 "정상" 입력 — 오늘 계획도 있고, 최근에도 썼고,
  // 마감도 했고, 아직 저녁 전이다. 이걸 베이스로 각 테스트가 조건 하나씩만 바꾼다.
  function baseInput(overrides: Partial<ResolveEntryInput> = {}): ResolveEntryInput {
    return {
      monthlyGoals: [makeMonthlyGoal({})],
      weeklyGoals: [makeWeeklyGoal({ weekOf: CURRENT_MONDAY })],
      tasks: [
        makeTask({
          plannedBlock: { start: `${TODAY}T09:00:00+09:00`, end: `${TODAY}T10:00:00+09:00` },
        }),
      ],
      currentMonday: CURRENT_MONDAY,
      today: TODAY,
      nowIso: `${TODAY}T10:00:00+09:00`,
      isTodayReflected: true,
      ...overrides,
    }
  }

  it('아무 조건도 안 걸리면 today(조건 6, 그 외)', () => {
    expect(resolveEntry(baseInput())).toBe('today')
  })

  it('조건 1이 다른 조건보다 우선한다 — 월간 목표 없음 + 이번 주 목표도 없음 → onboarding', () => {
    const input = baseInput({ monthlyGoals: [], weeklyGoals: [] })
    expect(resolveEntry(input)).toBe('onboarding')
  })

  it('조건 2가 조건 4보다 우선한다 — 이번 주 목표 없음 + 저녁(마감도 안 함) → reflect-week', () => {
    const input = baseInput({
      weeklyGoals: [],
      nowIso: `${TODAY}T19:00:00+09:00`,
      isTodayReflected: false,
    })
    expect(resolveEntry(input)).toBe('reflect-week')
  })

  it('조건 2가 조건 3보다 우선한다 — 이번 주 목표 없음 + 활동 공백 3일 이상 → reflect-week', () => {
    const input = baseInput({
      weeklyGoals: [],
      tasks: [
        makeTask({
          plannedBlock: { start: '2026-07-25T09:00:00+09:00', end: '2026-07-25T10:00:00+09:00' },
        }),
      ],
    })
    expect(resolveEntry(input)).toBe('reflect-week')
  })

  it('조건 3이 조건 4보다 우선한다 — 활동 공백 3일 이상 + 저녁(마감도 안 함) → today(복귀 리셋, reflect-day 아님)', () => {
    const input = baseInput({
      tasks: [
        makeTask({
          plannedBlock: { start: '2026-07-25T09:00:00+09:00', end: '2026-07-25T10:00:00+09:00' },
        }),
      ],
      nowIso: `${TODAY}T19:00:00+09:00`,
      isTodayReflected: false,
    })
    expect(resolveEntry(input)).toBe('today')
  })

  it('조건 4 — 마감 안 했고 저녁이면 reflect-day', () => {
    const input = baseInput({ nowIso: `${TODAY}T19:00:00+09:00`, isTodayReflected: false })
    expect(resolveEntry(input)).toBe('reflect-day')
  })

  it('조건 5 — 오늘 계획이 없고 저녁 전이면 today(계획 모드)', () => {
    const input = baseInput({ tasks: [] })
    expect(resolveEntry(input)).toBe('today')
  })
})
