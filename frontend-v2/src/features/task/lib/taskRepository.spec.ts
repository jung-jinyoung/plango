import { describe, expect, it } from 'vitest'
import { accuracyRatio, monthlyCurrentHours } from '../../../entities/derive'
import {
  getSeedCategories,
  getSeedMonthlyGoals,
  getSeedTasks,
  getSeedWeeklyGoals,
} from './taskRepository'

// CLAUDE.md 14절 "시드 데이터 규격"을 실제로 만족하는지 검증한다.
// seed-data.json이 없거나 형식이 깨지면 이 테스트가 먼저 실패한다.

describe('taskRepository — 시드 규격 검증', () => {
  const categories = getSeedCategories()
  const monthlyGoals = getSeedMonthlyGoals()
  const weeklyGoals = getSeedWeeklyGoals()
  const tasks = getSeedTasks()

  it('카테고리·월간 목표·주간 목표를 읽어온다', () => {
    expect(categories.length).toBeGreaterThan(0)
    expect(monthlyGoals).toHaveLength(1)
    expect(weeklyGoals).toHaveLength(4)
  })

  it('3주 완료(achieved) + 1주 진행 중(active)', () => {
    const achieved = weeklyGoals.filter((g) => g.status === 'achieved')
    const active = weeklyGoals.filter((g) => g.status === 'active')
    expect(achieved).toHaveLength(3)
    expect(active).toHaveLength(1)
  })

  it('완료된 3주의 accuracyRatio가 1.8 → 1.6 → 1.4로 개선된다', () => {
    const achievedInOrder = weeklyGoals
      .filter((g) => g.status === 'achieved')
      .sort((a, b) => a.weekOf.localeCompare(b.weekOf))

    const ratios = achievedInOrder.map((goal) => {
      const goalTasks = tasks.filter((t) => t.weeklyGoalId === goal.id)
      return accuracyRatio(goalTasks)
    })

    expect(ratios).toEqual([1.8, 1.6, 1.4])
  })

  it('carryCount=2인 주간 목표가 정확히 1개 있다(3주째 경고 직전)', () => {
    const nearWarning = weeklyGoals.filter((g) => g.carryCount === 2)
    expect(nearWarning).toHaveLength(1)
    expect(nearWarning[0]?.status).toBe('active')
  })

  it('월간 목표 현재 소요 시간이 baselineHours를 초과한다(경고 배너 재현용)', () => {
    const monthlyGoal = monthlyGoals[0]!
    const weeklyEntries = weeklyGoals.map((goal) => ({
      goal,
      tasks: tasks.filter((t) => t.weeklyGoalId === goal.id),
    }))
    const current = monthlyCurrentHours(monthlyGoal, weeklyEntries)
    expect(current).toBeGreaterThan(monthlyGoal.baselineHours)
  })

  it('약속(weeklyGoalId 없음)이 날짜별로 하루 2~3개씩 섞여 있다', () => {
    const appointments = tasks.filter((t) => t.weeklyGoalId === null)
    expect(appointments.length).toBeGreaterThan(0)

    const countsByDate = new Map<string, number>()
    for (const appt of appointments) {
      const date = appt.plannedBlock!.start.slice(0, 10)
      countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1)
    }

    expect(countsByDate.size).toBe(28) // 4주 × 7일
    for (const count of countsByDate.values()) {
      expect(count === 2 || count === 3).toBe(true)
    }
  })
})
