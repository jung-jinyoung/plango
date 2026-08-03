import { describe, expect, it } from 'vitest'
import { decomposeMonthlyGoal, decomposeMonthlyGoalFallback } from './decomposeMonthlyGoal'

describe('decomposeMonthlyGoalFallback', () => {
  it('4주로 균등 분배하고, 합이 baselineHours와 정확히 같다', () => {
    const drafts = decomposeMonthlyGoalFallback({
      title: '논문 초고 완성',
      baselineHours: 20,
      startWeekOf: '2026-08-03',
    })
    expect(drafts).toHaveLength(4)
    expect(drafts.every((d) => d.estimatedHours === 5)).toBe(true)
    expect(drafts.reduce((sum, d) => sum + d.estimatedHours, 0)).toBe(20)
  })

  it('weekOf가 startWeekOf부터 7일 간격으로 이어진다', () => {
    const drafts = decomposeMonthlyGoalFallback({
      title: '목표',
      baselineHours: 8,
      startWeekOf: '2026-08-03',
    })
    expect(drafts.map((d) => d.weekOf)).toEqual(['2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24'])
  })

  it('baselineHours가 4로 안 나눠떨어져도 합은 정확히 유지된다', () => {
    const drafts = decomposeMonthlyGoalFallback({
      title: '목표',
      baselineHours: 10,
      startWeekOf: '2026-08-03',
    })
    expect(drafts.reduce((sum, d) => sum + d.estimatedHours, 0)).toBe(10)
  })
})

describe('decomposeMonthlyGoal', () => {
  it('지금은 항상 폴백과 동일한 결과를 반환한다(Promise)', async () => {
    const input = { title: '목표', baselineHours: 12, startWeekOf: '2026-08-03' }
    const result = await decomposeMonthlyGoal(input)
    expect(result).toEqual(decomposeMonthlyGoalFallback(input))
  })
})
