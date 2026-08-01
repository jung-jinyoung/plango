import { describe, expect, it } from 'vitest'
import { getSeedWeeklyGoals } from '../../goal/lib/goalRepository'
import { getSeedTasks } from '../../task/lib/taskRepository'
import { computeWeeklyAccuracy } from './computeWeeklyAccuracy'

describe('computeWeeklyAccuracy', () => {
  it('achieved 4주의 예상 정확도가 2.0 → 1.8 → 1.6 → 1.4로 나온다', () => {
    const weeklyGoals = getSeedWeeklyGoals()
    const tasks = getSeedTasks()
    const results = computeWeeklyAccuracy(weeklyGoals, tasks)

    const achievedInOrder = weeklyGoals
      .filter((g) => g.status === 'achieved')
      .sort((a, b) => a.weekOf.localeCompare(b.weekOf))

    const ratios = achievedInOrder.map(
      (goal) => results.find((r) => r.weeklyGoalId === goal.id)!.ratio,
    )

    expect(ratios).toEqual([2.0, 1.8, 1.6, 1.4])
  })
})
