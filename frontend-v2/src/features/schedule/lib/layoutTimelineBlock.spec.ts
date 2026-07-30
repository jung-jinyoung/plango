import { describe, expect, it } from 'vitest'
import { layoutTimelineBlock } from './layoutTimelineBlock'

describe('layoutTimelineBlock', () => {
  it('9시~10시 블록을 8시 시작·64px/h 기준으로 좌표 변환한다', () => {
    const result = layoutTimelineBlock(
      { start: '2026-07-29T09:00:00+09:00', end: '2026-07-29T10:00:00+09:00' },
      8,
      64,
    )
    expect(result).toEqual({ top: 64, height: 64 })
  })

  it('30분짜리 블록의 높이를 절반으로 계산한다', () => {
    const result = layoutTimelineBlock(
      { start: '2026-07-29T13:00:00+09:00', end: '2026-07-29T13:30:00+09:00' },
      8,
      64,
    )
    expect(result).toEqual({ top: 320, height: 32 })
  })

  it('타임라인 시작 시각 이전 블록은 top이 음수로 나온다', () => {
    const result = layoutTimelineBlock(
      { start: '2026-07-29T07:00:00+09:00', end: '2026-07-29T07:30:00+09:00' },
      8,
      64,
    )
    expect(result.top).toBe(-64)
  })
})
