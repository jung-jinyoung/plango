import { describe, expect, it } from 'vitest'
import { minutesBetween } from './time'

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
