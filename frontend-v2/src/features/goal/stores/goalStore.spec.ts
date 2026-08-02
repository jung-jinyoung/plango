import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { getSeedWeeklyGoals } from '../lib/goalRepository'
import { useGoalStore } from './goalStore'

describe('useGoalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('categoriesById/monthlyGoalsById/weeklyGoalsById가 Map으로 캐싱된다(매번 새로 안 만든다)', () => {
    const store = useGoalStore()

    // computed이므로 같은 참조를 반환해야 한다 — 호출부마다 new Map(...)을 새로 만드는 게 아니라는 뜻
    expect(store.weeklyGoalsById).toBe(store.weeklyGoalsById)
    expect(store.monthlyGoalsById).toBe(store.monthlyGoalsById)
    expect(store.categoriesById).toBe(store.categoriesById)

    expect(store.weeklyGoalsById.size).toBe(store.weeklyGoals.length)
    expect(store.weeklyGoalsById.get('wg-carrying')?.title).toBe('실험 데이터 분석 마무리')
  })

  it('updateWeeklyGoal이 로컬 상태를 patch로 갱신하고, 캐싱된 Map도 새 값으로 반영된다', () => {
    const store = useGoalStore()
    const before = store.weeklyGoalsById.get('wg-carrying')
    const originalEstimatedHours = before?.estimatedHours

    store.updateWeeklyGoal('wg-carrying', { estimatedHours: 12 })

    expect(store.weeklyGoalsById.get('wg-carrying')?.estimatedHours).toBe(12)
    // repository에서 다시 읽은 원본(별도 배열)은 영향을 받지 않아야 한다
    const fromRepository = getSeedWeeklyGoals().find((g) => g.id === 'wg-carrying')
    expect(fromRepository?.estimatedHours).toBe(originalEstimatedHours)
  })

  it('존재하지 않는 id면 아무 것도 바뀌지 않는다', () => {
    const store = useGoalStore()
    const before = [...store.weeklyGoals]

    store.updateWeeklyGoal('no-such-id', { estimatedHours: 99 })

    expect(store.weeklyGoals).toEqual(before)
  })

  it('addWeeklyGoal이 새 주간 목표를 추가한다', () => {
    const store = useGoalStore()
    const before = store.weeklyGoals.length

    store.addWeeklyGoal({
      id: 'wg-next-test',
      title: '테스트 목표',
      weekOf: '2026-08-03',
      monthlyGoalId: 'mg-thesis',
      estimatedHours: 5,
      carryCount: 0,
      status: 'active',
    })

    expect(store.weeklyGoals.length).toBe(before + 1)
    expect(store.weeklyGoalsById.get('wg-next-test')?.title).toBe('테스트 목표')
  })

  it('addWeeklyGoal은 이미 있는 id면 중복 추가하지 않는다', () => {
    const store = useGoalStore()
    const before = store.weeklyGoals.length

    store.addWeeklyGoal({
      id: 'wg-carrying', // 이미 존재
      title: '중복 시도',
      weekOf: '2026-08-03',
      monthlyGoalId: 'mg-thesis',
      estimatedHours: 5,
      carryCount: 0,
      status: 'active',
    })

    expect(store.weeklyGoals.length).toBe(before)
    expect(store.weeklyGoalsById.get('wg-carrying')?.title).toBe('실험 데이터 분석 마무리')
  })
})
