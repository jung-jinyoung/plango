import { describe, expect, it } from 'vitest'
import { getSeedCategories, getSeedMonthlyGoals, getSeedWeeklyGoals } from '../../goal/lib/goalRepository'
import { getSeedTasks } from '../../task/lib/taskRepository'
import { suggestNextWeekGoals } from './suggestNextWeekGoals'

describe('suggestNextWeekGoals', () => {
  const weeklyGoals = getSeedWeeklyGoals()
  const monthlyGoals = getSeedMonthlyGoals()
  const categories = new Map(getSeedCategories().map((c) => [c.id, c]))
  const tasks = getSeedTasks()
  const LAST_MONDAY = '2026-07-20'

  it('golden: 시드 기준 이월(8h) + 습관(3h) + 월간 다음 항목(캡 2.5h) = 13.5h', () => {
    const suggestions = suggestNextWeekGoals(weeklyGoals, monthlyGoals, categories, tasks, LAST_MONDAY, 13.5)

    expect(suggestions).toHaveLength(3)

    const carry = suggestions.find((s) => s.key.startsWith('carry-'))!
    expect(carry.title).toBe('실험 데이터 분석 마무리')
    expect(carry.subtitle).toBe('지난주에서 이어져요')
    expect(carry.hours).toBe(8)

    const habit = suggestions.find((s) => s.key.startsWith('habit-'))!
    expect(habit.title).toBe('운동 습관 잡기')
    expect(habit.subtitle).toBe('지난주에 잘 지켰어요')
    expect(habit.hours).toBe(3)

    const monthly = suggestions.find((s) => s.key.startsWith('monthly-'))!
    expect(monthly.title).toBe('운동 습관 만들기')
    expect(monthly.subtitle).toBe('이번 달 목표에서 이어져요')
    expect(monthly.hours).toBe(2.5) // remaining(13.83h)이 availableHours 캡(2.5h)에 걸림

    const total = suggestions.reduce((sum, s) => sum + s.hours, 0)
    expect(total).toBe(13.5)
  })

  it('가용 시간이 이월+습관보다 작으면 월간 후보는 안 만든다(범위를 넘기지 않는다)', () => {
    const suggestions = suggestNextWeekGoals(weeklyGoals, monthlyGoals, categories, tasks, LAST_MONDAY, 10)
    expect(suggestions).toHaveLength(2)
    expect(suggestions.some((s) => s.key.startsWith('monthly-'))).toBe(false)
  })

  it('이월 중인 목표가 없으면 이월 후보를 안 만든다', () => {
    const withoutCarrying = weeklyGoals.filter((g) => g.id !== 'wg-carrying')
    const suggestions = suggestNextWeekGoals(withoutCarrying, monthlyGoals, categories, tasks, LAST_MONDAY, 13.5)
    expect(suggestions.some((s) => s.key.startsWith('carry-'))).toBe(false)
  })

  it('baseline을 이미 넘긴 월간 목표는 다음 항목 후보를 안 만든다(mg-thesis)', () => {
    // mg-thesis는 이월 후보(wg-carrying)로 이미 제외 대상이라 이 케이스 자체가
    // 자연스럽게 성립한다 — mg-thesis 후보가 suggestions에 없는지 확인.
    const suggestions = suggestNextWeekGoals(weeklyGoals, monthlyGoals, categories, tasks, LAST_MONDAY, 100)
    expect(suggestions.some((s) => s.monthlyGoalId === 'mg-thesis' && s.key.startsWith('monthly-'))).toBe(
      false,
    )
  })
})
