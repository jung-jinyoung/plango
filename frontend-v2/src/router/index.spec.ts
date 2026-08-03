import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReflectionStore } from '../features/reflect/stores/reflectionStore'
import router from './index'

// 진입 라우팅(CLAUDE.md 12절) 가드 — 시드 데이터로 실제 진입 시나리오를
// 재현하고, "강제 이동이 아니다"(사용자의 명시적 네비게이션은 안 막는다)를
// 확인한다. 개별 조건 판정 로직 자체는 resolveEntry.spec.ts에서 이미
// 다뤘으니, 여기선 router에 실제로 연결됐는지만 검증한다.

describe('router 진입 라우팅 가드', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('시드 기본 상태 + 저녁 전(18시 이전)이면 today로 보낸다', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T01:00:00.000Z')) // KST 10:00
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('today')
  })

  it('시드 기본 상태 + 18시 이후 + 오늘 마감 안 했으면 reflect-day로 보낸다', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00.000Z')) // KST 19:00
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('reflect-day')
  })

  it('오늘 마감을 이미 했으면 18시 이후여도 reflect-day가 아니라 today로 보낸다', async () => {
    const reflectionStore = useReflectionStore()
    reflectionStore.markDayReflected('2026-07-29')

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T10:00:00.000Z')) // KST 19:00
    await router.push('/')
    expect(router.currentRoute.value.name).toBe('today')
  })

  it('강제 이동이 아니다 — today에서 reflect-week로 명시적으로 이동해도 가드가 되돌리지 않는다', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T01:00:00.000Z')) // KST 10:00, '/'로 가면 today가 될 시각

    await router.push('/today')
    expect(router.currentRoute.value.name).toBe('today')

    await router.push({ name: 'reflect-week' })
    expect(router.currentRoute.value.name).toBe('reflect-week')
  })

  it('강제 이동이 아니다 — /reflect/day로 직접 이동해도 가드가 되돌리지 않는다(현재 시각이 today를 가리켜도)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T01:00:00.000Z')) // '/'로 가면 today가 될 시각

    await router.push({ name: 'reflect-day' })
    expect(router.currentRoute.value.name).toBe('reflect-day')
  })
})
