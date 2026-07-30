import { describe, expect, it } from 'vitest'
import { getSeedCategories, getSeedMonthlyGoals, getSeedWeeklyGoals } from './goalRepository'

describe('goalRepository', () => {
  it('카테고리·월간 목표·주간 목표를 읽어온다', () => {
    expect(getSeedCategories().length).toBeGreaterThan(0)
    expect(getSeedMonthlyGoals().length).toBeGreaterThan(0)
    expect(getSeedWeeklyGoals().length).toBeGreaterThan(0)
  })
})
