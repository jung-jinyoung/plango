import { describe, expect, it } from 'vitest'
import {
  accuracyRatio,
  actualMin,
  categoryColorOf,
  monthlyCurrentHours,
  resolveCategory,
  resolveCategoryForMonthlyGoal,
  resolveCategoryForWeeklyGoal,
  shouldShowGhost,
  weeklyProgress,
} from './derive'
import type { Category, MonthlyGoal, Task, WeeklyGoal } from './types'

const catBlue: Category = { id: 'cat-blue', name: '연구', color: 'blue' }
const catGray: Category = { id: 'cat-gray', name: '기타', color: 'gray' }
const categories = new Map([
  [catBlue.id, catBlue],
  [catGray.id, catGray],
])

const monthlyGoal: MonthlyGoal = {
  id: 'mg1',
  title: '논문 초고 완성',
  month: '2026-08',
  categoryId: catBlue.id,
  baselineHours: 40,
  status: 'active',
}
const monthlyGoals = new Map([[monthlyGoal.id, monthlyGoal]])

const weeklyGoalActive: WeeklyGoal = {
  id: 'wg1',
  title: '결과 파트 작성',
  weekOf: '2026-08-18',
  monthlyGoalId: monthlyGoal.id,
  estimatedHours: 10,
  carryCount: 0,
  status: 'active',
}
const weeklyGoalAchieved: WeeklyGoal = {
  id: 'wg0',
  title: '선행연구 정리',
  weekOf: '2026-08-04',
  monthlyGoalId: monthlyGoal.id,
  estimatedHours: 6,
  carryCount: 0,
  status: 'achieved',
}
const weeklyGoalDropped: WeeklyGoal = {
  id: 'wg-dropped',
  title: '중단된 목표',
  weekOf: '2026-08-11',
  monthlyGoalId: monthlyGoal.id,
  estimatedHours: 4,
  carryCount: 1,
  status: 'dropped',
}
const weeklyGoals = new Map([
  [weeklyGoalActive.id, weeklyGoalActive],
  [weeklyGoalAchieved.id, weeklyGoalAchieved],
  [weeklyGoalDropped.id, weeklyGoalDropped],
])

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't-default',
    title: '할 일',
    weeklyGoalId: null,
    categoryId: null,
    estimatedMin: 60,
    plannedBlock: null,
    actualBlock: null,
    status: 'todo',
    ...overrides,
  }
}

describe('categoryColorOf', () => {
  it('카테고리가 있으면 그 색을 반환한다', () => {
    expect(categoryColorOf(catBlue)).toBe('blue')
  })

  it('카테고리가 없으면 gray를 반환한다', () => {
    expect(categoryColorOf(null)).toBe('gray')
  })
})

describe('resolveCategory', () => {
  it('weeklyGoalId가 있으면 목표 체인을 따라 카테고리를 찾는다', () => {
    const task = makeTask({ weeklyGoalId: weeklyGoalActive.id })
    expect(resolveCategory(task, weeklyGoals, monthlyGoals, categories)).toEqual(catBlue)
  })

  it('weeklyGoalId가 없으면(약속) task.categoryId를 그대로 쓴다', () => {
    const task = makeTask({ weeklyGoalId: null, categoryId: catGray.id })
    expect(resolveCategory(task, weeklyGoals, monthlyGoals, categories)).toEqual(catGray)
  })

  it('체인이 끊기고 categoryId도 없으면 null', () => {
    const task = makeTask({ weeklyGoalId: 'no-such-goal', categoryId: null })
    expect(resolveCategory(task, weeklyGoals, monthlyGoals, categories)).toBeNull()
  })
})

describe('actualMin', () => {
  it('actualBlock이 있으면 분 단위로 계산한다', () => {
    const task = makeTask({
      actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:30:00+09:00' },
    })
    expect(actualMin(task)).toBe(90)
  })

  it('actualBlock이 없으면 0', () => {
    expect(actualMin(makeTask({ actualBlock: null }))).toBe(0)
  })
})

describe('weeklyProgress', () => {
  it('하위 할 일 actualMin 합을 estimatedHours로 나눈 퍼센트를 반환한다', () => {
    const tasks = [
      makeTask({
        weeklyGoalId: weeklyGoalActive.id,
        actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T12:00:00+09:00' },
      }),
    ]
    // 3시간 실측 / 10시간 예상 = 30%
    expect(weeklyProgress(weeklyGoalActive, tasks)).toBe(30)
  })

  it('estimatedHours가 0이면 0을 반환한다(0으로 나누지 않는다)', () => {
    const zeroGoal: WeeklyGoal = { ...weeklyGoalActive, estimatedHours: 0 }
    expect(weeklyProgress(zeroGoal, [])).toBe(0)
  })
})

describe('monthlyCurrentHours', () => {
  it('완료된 주는 실측, 진행 중인 주는 재추정, dropped는 제외해서 합산한다', () => {
    const achievedTasks = [
      makeTask({
        weeklyGoalId: weeklyGoalAchieved.id,
        actualBlock: { start: '2026-08-04T09:00:00+09:00', end: '2026-08-04T15:00:00+09:00' },
      }),
    ] // 6시간 실측
    const entries = [
      { goal: weeklyGoalAchieved, tasks: achievedTasks },
      { goal: weeklyGoalActive, tasks: [] }, // active → estimatedHours(10) 그대로
      { goal: weeklyGoalDropped, tasks: [] }, // dropped → 제외
    ]
    // 6(achieved 실측) + 10(active 재추정) = 16, dropped(4)는 미포함
    expect(monthlyCurrentHours(monthlyGoal, entries)).toBe(16)
  })

  it('다른 월간 목표에 속한 주간 목표는 무시한다', () => {
    const otherMonthly: MonthlyGoal = { ...monthlyGoal, id: 'mg-other' }
    const entries = [{ goal: weeklyGoalActive, tasks: [] }]
    expect(monthlyCurrentHours(otherMonthly, entries)).toBe(0)
  })
})

describe('accuracyRatio', () => {
  it('Σ실제 / Σ예상을 반환한다', () => {
    const tasks = [
      makeTask({
        estimatedMin: 60,
        actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:30:00+09:00' },
      }), // 90분 실제
      makeTask({
        estimatedMin: 30,
        actualBlock: { start: '2026-08-18T11:00:00+09:00', end: '2026-08-18T11:30:00+09:00' },
      }), // 30분 실제
    ]
    // 실제 120 / 예상 90 = 1.333...
    expect(accuracyRatio(tasks)).toBeCloseTo(1.3333, 4)
  })

  it('예상 합이 0이면 0을 반환한다', () => {
    expect(accuracyRatio([])).toBe(0)
  })
})

describe('resolveCategoryForMonthlyGoal', () => {
  it('categoryId로 카테고리를 찾는다', () => {
    expect(resolveCategoryForMonthlyGoal(monthlyGoal, categories)).toEqual(catBlue)
  })
})

describe('resolveCategoryForWeeklyGoal', () => {
  it('월간 목표를 거쳐 카테고리를 찾는다', () => {
    expect(resolveCategoryForWeeklyGoal(weeklyGoalActive, monthlyGoals, categories)).toEqual(catBlue)
  })

  it('monthlyGoalId가 없으면 null', () => {
    const orphan: WeeklyGoal = { ...weeklyGoalActive, monthlyGoalId: null }
    expect(resolveCategoryForWeeklyGoal(orphan, monthlyGoals, categories)).toBeNull()
  })
})

describe('shouldShowGhost', () => {
  it('계획·실제 길이 차이가 15분 미만이면 false(병합)', () => {
    const task = makeTask({
      plannedBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:00:00+09:00' }, // 60분
      actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:10:00+09:00' }, // 70분, 차이 10분
    })
    expect(shouldShowGhost(task)).toBe(false)
  })

  it('계획·실제 길이 차이가 15분 이상이면 true(고스트 병기)', () => {
    const task = makeTask({
      plannedBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:00:00+09:00' }, // 60분
      actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:45:00+09:00' }, // 105분, 차이 45분
    })
    expect(shouldShowGhost(task)).toBe(true)
  })

  it('actualBlock이 없으면 false', () => {
    const task = makeTask({
      plannedBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:00:00+09:00' },
      actualBlock: null,
    })
    expect(shouldShowGhost(task)).toBe(false)
  })

  it('plannedBlock이 없으면 false', () => {
    const task = makeTask({
      plannedBlock: null,
      actualBlock: { start: '2026-08-18T09:00:00+09:00', end: '2026-08-18T10:00:00+09:00' },
    })
    expect(shouldShowGhost(task)).toBe(false)
  })
})
