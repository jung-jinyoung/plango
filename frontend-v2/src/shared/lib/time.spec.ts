import { describe, expect, it, vi } from 'vitest'
import {
  addDays,
  formatMinutesAsHours,
  minutesBetween,
  minutesOfDay,
  nowIso,
  startOfWeek,
  useNow,
} from './time'

describe('minutesBetween', () => {
  it('같은 시간대 내 차이를 분 단위로 계산한다', () => {
    expect(minutesBetween('2026-08-04T09:00:00+09:00', '2026-08-04T10:15:00+09:00')).toBe(75)
  })

  it('자정을 넘어가도 정상 계산한다', () => {
    expect(minutesBetween('2026-08-04T23:30:00+09:00', '2026-08-05T00:15:00+09:00')).toBe(45)
  })

  it('start와 end가 같으면 0을 반환한다', () => {
    expect(minutesBetween('2026-08-04T09:00:00+09:00', '2026-08-04T09:00:00+09:00')).toBe(0)
  })
})

describe('addDays', () => {
  it('일수를 더한다', () => {
    expect(addDays('2026-07-29', 1)).toBe('2026-07-30')
  })

  it('월 경계를 넘어도 정상 계산한다', () => {
    expect(addDays('2026-07-31', 1)).toBe('2026-08-01')
  })

  it('음수로 과거 날짜를 계산한다', () => {
    expect(addDays('2026-07-29', -2)).toBe('2026-07-27')
  })
})

describe('startOfWeek', () => {
  it('수요일이 속한 주의 월요일을 반환한다 (회귀 테스트: 로컬 타임존 자정 밀림 버그)', () => {
    // 2026-07-29는 수요일 — toISOString()의 로컬 오프셋 문제로 한때
    // 07-26(화 취급)이 나온 적이 있었다. 07-27이 맞다.
    expect(startOfWeek('2026-07-29')).toBe('2026-07-27')
  })

  it('월요일 자기 자신은 그대로 반환한다', () => {
    expect(startOfWeek('2026-07-27')).toBe('2026-07-27')
  })

  it('일요일은 그 전주 월요일을 반환한다', () => {
    expect(startOfWeek('2026-08-02')).toBe('2026-07-27')
  })
})

describe('formatMinutesAsHours', () => {
  it('정각이면 분을 생략한다', () => {
    expect(formatMinutesAsHours(360)).toBe('6h')
  })

  it('분이 남으면 같이 표시한다', () => {
    expect(formatMinutesAsHours(500)).toBe('8h 20m')
  })

  it('0분은 0h', () => {
    expect(formatMinutesAsHours(0)).toBe('0h')
  })
})

describe('minutesOfDay', () => {
  it('시:분을 자정 기준 분으로 변환한다', () => {
    expect(minutesOfDay('2026-07-29T09:00:00+09:00')).toBe(540)
    expect(minutesOfDay('2026-07-29T14:33:00+09:00')).toBe(873)
  })
})

describe('nowIso', () => {
  it('UTC 자정 근처에도 KST 기준(+9시간)으로 정확히 계산한다', () => {
    // UTC 2026-07-28T15:00:00Z = KST 2026-07-29T00:00:00+09:00 — 로컬 getter를
    // 썼다면(addDays 버그와 같은 종류) 날짜가 하루 어긋날 수 있는 경계값이다.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-28T15:00:00.000Z'))
    expect(nowIso()).toBe('2026-07-29T00:00:00+09:00')
    vi.useRealTimers()
  })
})

describe('useNow', () => {
  it('KST ISO 문자열을 반환하고, 1분마다 갱신되며, 여러 번 호출해도 같은 ref를 공유한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T00:00:00.000Z'))

    const a = useNow()
    expect(a.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/)
    const before = a.value

    const b = useNow()
    expect(b).toBe(a) // 같은 ref 인스턴스

    vi.advanceTimersByTime(60_000)
    expect(a.value).not.toBe(before)

    vi.useRealTimers()
  })
})
