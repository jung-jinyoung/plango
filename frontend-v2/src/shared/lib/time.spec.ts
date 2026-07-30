import { describe, expect, it } from 'vitest'
import { addDays, minutesBetween, startOfWeek } from './time'

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
