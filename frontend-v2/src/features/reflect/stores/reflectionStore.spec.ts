import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useReflectionStore } from './reflectionStore'

describe('useReflectionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('처음엔 어떤 날짜도 마감되지 않은 상태다', () => {
    const store = useReflectionStore()
    expect(store.isDayReflected('2026-07-29')).toBe(false)
  })

  it('markDayReflected를 부르면 그 날짜만 마감 처리된다', () => {
    const store = useReflectionStore()
    store.markDayReflected('2026-07-29')

    expect(store.isDayReflected('2026-07-29')).toBe(true)
    expect(store.isDayReflected('2026-07-28')).toBe(false)
  })

  it('같은 날짜를 여러 번 마감 처리해도 문제없다(멱등)', () => {
    const store = useReflectionStore()
    store.markDayReflected('2026-07-29')
    store.markDayReflected('2026-07-29')

    expect(store.reflectedDates.size).toBe(1)
  })
})
