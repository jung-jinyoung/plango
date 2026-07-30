import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
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
})
