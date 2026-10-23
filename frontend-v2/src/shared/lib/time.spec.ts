import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  addDays,
  addMinutes,
  ceilTo15Min,
  daysSince,
  formatHHMM,
  formatDateKo,
  formatElapsed,
  formatMinutesAsHours,
  formatMinutesKo,
  isAfter18,
  isoAt,
  minutesBetween,
  minutesOfDay,
  nowIso,
  setNowDateOverride,
  startOfWeek,
  timelineHourRange,
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

describe('formatDateKo', () => {
  it('월·일·요일을 표시한다', () => {
    expect(formatDateKo('2026-07-29')).toBe('7월 29일 수요일')
    expect(formatDateKo('2026-08-02')).toBe('8월 2일 일요일')
  })
})

describe('formatMinutesKo', () => {
  it('시간과 분을 같이 표시한다', () => {
    expect(formatMinutesKo(105)).toBe('1시간 45분')
  })

  it('1시간 미만이면 분만 표시한다', () => {
    expect(formatMinutesKo(40)).toBe('40분')
  })

  it('정각이면 분을 생략한다', () => {
    expect(formatMinutesKo(60)).toBe('1시간')
  })
})

describe('formatElapsed', () => {
  it('H:MM으로 표시하고 분은 두 자리로 채운다', () => {
    expect(formatElapsed(83)).toBe('1:23')
    expect(formatElapsed(5)).toBe('0:05')
  })
})

describe('setNowDateOverride', () => {
  afterEach(() => {
    setNowDateOverride(null)
    vi.useRealTimers()
  })

  it('날짜만 바꿔 끼우고 시각은 실제 값을 유지한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-31T04:30:15.000Z')) // KST 금 13:30:15
    setNowDateOverride('2026-07-29')
    expect(nowIso()).toBe('2026-07-29T13:30:15+09:00')
  })

  it('null이면 실제 날짜로 돌아간다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-31T04:30:15.000Z'))
    setNowDateOverride('2026-07-29')
    setNowDateOverride(null)
    expect(nowIso()).toBe('2026-07-31T13:30:15+09:00')
  })
})

describe('ceilTo15Min', () => {
  it('다음 15분 경계로 올리고, 이미 경계면 그대로 둔다', () => {
    expect(ceilTo15Min(13 * 60 + 31)).toBe(13 * 60 + 45)
    expect(ceilTo15Min(13 * 60 + 45)).toBe(13 * 60 + 45)
  })
})

describe('timelineHourRange', () => {
  const at = (hhmm: string) => `2026-07-29T${hhmm}:00+09:00`

  it('모든 시각이 기본 범위 안이면 기본 범위를 그대로 쓴다', () => {
    expect(timelineHourRange([at('09:00'), at('13:45'), at('20:30')], 8, 21)).toEqual({
      startHour: 8,
      endHour: 21,
    })
  })

  it('현재 시각이 끝보다 늦으면 그 시각을 덮는 정각까지 늘린다', () => {
    expect(timelineHourRange([at('22:49')], 8, 21)).toEqual({ startHour: 8, endHour: 23 })
  })

  it('현재 시각이 시작보다 이르면 그 시각의 정각부터 시작한다', () => {
    expect(timelineHourRange([at('06:30')], 8, 21)).toEqual({ startHour: 6, endHour: 21 })
  })

  it('하루 경계(0~24시)를 넘지 않는다', () => {
    expect(timelineHourRange([at('23:30'), at('00:10')], 8, 21)).toEqual({
      startHour: 0,
      endHour: 24,
    })
  })
})

describe('minutesOfDay', () => {
  it('시:분을 자정 기준 분으로 변환한다', () => {
    expect(minutesOfDay('2026-07-29T09:00:00+09:00')).toBe(540)
    expect(minutesOfDay('2026-07-29T14:33:00+09:00')).toBe(873)
  })
})

describe('formatHHMM', () => {
  it("ISO 문자열에서 'HH:MM'만 뽑는다", () => {
    expect(formatHHMM('2026-07-29T14:33:00+09:00')).toBe('14:33')
  })
})

describe('addMinutes', () => {
  it('분을 더한 새 ISO 문자열을 만든다', () => {
    expect(addMinutes('2026-07-29T09:00:00+09:00', 105)).toBe('2026-07-29T10:45:00+09:00')
  })

  it('음수로 시간을 되돌릴 수 있다', () => {
    expect(addMinutes('2026-07-29T10:45:00+09:00', -105)).toBe('2026-07-29T09:00:00+09:00')
  })

  it('자정을 넘어가면 날짜도 함께 바뀐다', () => {
    expect(addMinutes('2026-07-29T23:30:00+09:00', 45)).toBe('2026-07-30T00:15:00+09:00')
  })
})

describe('isoAt', () => {
  it('날짜 키와 분(minute)을 ISO 문자열로 합친다', () => {
    expect(isoAt('2026-07-29', 873)).toBe('2026-07-29T14:33:00+09:00') // 14*60+33
  })

  it('minutesOfDay와 왕복(round-trip)한다', () => {
    const original = '2026-07-29T09:15:00+09:00'
    expect(isoAt('2026-07-29', minutesOfDay(original))).toBe(original)
  })
})

describe('isAfter18', () => {
  it('18:00 이후면 true', () => {
    expect(isAfter18('2026-07-29T18:00:00+09:00')).toBe(true)
    expect(isAfter18('2026-07-29T21:30:00+09:00')).toBe(true)
  })

  it('18:00 이전이면 false', () => {
    expect(isAfter18('2026-07-29T17:59:00+09:00')).toBe(false)
  })
})

describe('daysSince', () => {
  it('과거 날짜면 양수 일수를 반환한다', () => {
    expect(daysSince('2026-07-26', '2026-07-29')).toBe(3)
  })

  it('같은 날이면 0', () => {
    expect(daysSince('2026-07-29', '2026-07-29')).toBe(0)
  })

  it('월 경계를 넘어도 정상 계산한다', () => {
    expect(daysSince('2026-07-30', '2026-08-02')).toBe(3)
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
