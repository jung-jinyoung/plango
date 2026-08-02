import { describe, expect, it } from 'vitest'
import type { MonthlyGoal } from '../../../entities/types'
import { buildMonthlyWarning } from './buildMonthlyWarning'

const monthlyGoal: MonthlyGoal = {
  id: 'mg1',
  title: '논문 초고 완성',
  month: '2026-07',
  categoryId: 'cat1',
  baselineHours: 60,
  status: 'active',
}

describe('buildMonthlyWarning', () => {
  it('baseline만 초과하고 extraWeeks<1.5면 "이미 예상보다" 문장만 붙는다', () => {
    const warning = buildMonthlyWarning(monthlyGoal, 75.8333, 1)
    expect(warning).not.toBeNull()
    expect(warning!.title).toBe('예상보다 많이 썼어요')
    expect(warning!.body).toBe('논문 초고 완성에 이미 예상보다 15h 50m 더 썼어요. 범위를 줄이거나 목표를 다시 잡으면 여유가 생겨요.')
    expect(warning!.overBudget).toBe(true)
  })

  it('baseline은 안 넘었지만 extraWeeks>=1.5면 "완료까지" 문장만 붙는다', () => {
    const warning = buildMonthlyWarning(monthlyGoal, 50, 2)
    expect(warning).not.toBeNull()
    expect(warning!.title).toBe('지금 페이스면 빠듯해요')
    expect(warning!.body).toBe('지금 페이스면 완료까지 2주가 더 걸려요. 범위를 줄이거나 목표를 다시 잡으면 여유가 생겨요.')
    expect(warning!.overBudget).toBe(false)
  })

  it('둘 다 해당하면 두 문장 다 붙는다', () => {
    const warning = buildMonthlyWarning(monthlyGoal, 75.8333, 2)
    expect(warning!.body).toBe(
      '논문 초고 완성에 이미 예상보다 15h 50m 더 썼어요. 지금 페이스면 완료까지 2주가 더 걸려요. 범위를 줄이거나 목표를 다시 잡으면 여유가 생겨요.',
    )
  })

  it('baseline도 안 넘고 extraWeeks도 빠듯하지 않으면 null(배너 없음)', () => {
    expect(buildMonthlyWarning(monthlyGoal, 40, 1)).toBeNull()
    expect(buildMonthlyWarning(monthlyGoal, 40, null)).toBeNull()
  })

  it('실패 언어("실패","미완료","초과")를 쓰지 않는다', () => {
    const warning = buildMonthlyWarning(monthlyGoal, 75.8333, 2)!
    expect(warning.title).not.toMatch(/실패|미완료/)
    expect(warning.body).not.toMatch(/실패|미완료/)
  })
})
