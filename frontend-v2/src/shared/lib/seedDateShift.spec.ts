import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ANCHOR_TODAY, getDemoToday, isDemoFreshEnabled, shiftSeedForDemo, type SeedData } from './seedDateShift'

const sampleData: SeedData = {
  categories: [{ id: 'cat-1', name: '분류', color: 'blue' }],
  monthlyGoals: [
    { id: 'mg-1', title: '목표', month: '2026-07', categoryId: 'cat-1', baselineHours: 10, status: 'active' },
  ],
  weeklyGoals: [
    {
      id: 'wg-1',
      title: '산출물',
      weekOf: '2026-07-27',
      monthlyGoalId: 'mg-1',
      estimatedHours: 5,
      carryCount: 0,
      status: 'active',
    },
  ],
  tasks: [
    {
      id: 't-1',
      title: '할 일',
      weeklyGoalId: 'wg-1',
      categoryId: null,
      estimatedMin: 60,
      plannedBlock: { start: '2026-07-29T09:00:00+09:00', end: '2026-07-29T10:00:00+09:00' },
      actualBlock: null,
      status: 'todo',
      confirmed: false,
    },
  ],
}

describe('seedDateShift — VITE_DEMO_FRESH 비활성(기본, 개발·테스트 환경)', () => {
  it('getDemoToday()가 ANCHOR_TODAY 그대로다', () => {
    expect(isDemoFreshEnabled()).toBe(false)
    expect(getDemoToday()).toBe(ANCHOR_TODAY)
  })

  it('shiftSeedForDemo가 no-op이다(입력을 그대로 반환)', () => {
    expect(shiftSeedForDemo(sampleData)).toBe(sampleData)
  })
})

describe('seedDateShift — VITE_DEMO_FRESH 활성', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_FRESH', 'true')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it('실제 오늘이 ANCHOR_TODAY와 같은 주면 이동량이 0이다', () => {
    vi.setSystemTime(new Date('2026-07-29T03:00:00.000Z')) // KST 정오 근방, 같은 날짜
    expect(getDemoToday()).toBe(ANCHOR_TODAY)
  })

  it('실제 오늘이 3주 뒤 같은 요일이면 정확히 21일 이동한다(요일 정렬 보존)', () => {
    vi.setSystemTime(new Date('2026-08-19T03:00:00.000Z')) // KST 2026-08-19(수), ANCHOR_TODAY+21일
    expect(getDemoToday()).toBe('2026-08-19')

    const shifted = shiftSeedForDemo(sampleData)
    expect(shifted).not.toBe(sampleData) // 원본 불변
    expect(shifted.weeklyGoals[0]?.weekOf).toBe('2026-08-17') // 월요일 정렬 유지
    expect(shifted.monthlyGoals[0]?.month).toBe('2026-08')
    expect(shifted.tasks[0]?.plannedBlock).toEqual({
      start: '2026-08-19T09:00:00+09:00',
      end: '2026-08-19T10:00:00+09:00',
    })
  })
})
