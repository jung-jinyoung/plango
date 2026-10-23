import { describe, expect, it } from 'vitest'
import type { Task } from '../../../entities/types'
import { placeInGaps } from './placeInGaps'

const DAY = '2026-07-29'
const at = (hhmm: string) => `${DAY}T${hhmm}:00+09:00`
const min = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

function task(id: string, estimatedMin: number): Task {
  return {
    id,
    title: id,
    weeklyGoalId: 'wg',
    categoryId: null,
    estimatedMin,
    plannedBlock: null,
    actualBlock: null,
    status: 'todo',
    confirmed: false,
  }
}

describe('placeInGaps', () => {
  it('현재 시각을 15분 경계로 올린 시점부터 가장 이른 빈틈에 넣는다', () => {
    const result = placeInGaps([task('a', 30)], [], DAY, min('13:31'), min('21:00'))
    expect(result).toEqual([{ taskId: 'a', block: { start: at('13:45'), end: at('14:15') } }])
  })

  it('약속·이미 놓인 블록과 겹치지 않게 그 뒤 틈으로 민다', () => {
    const occupied = [{ start: at('14:00'), end: at('15:00') }]
    const result = placeInGaps([task('a', 90)], occupied, DAY, min('13:30'), min('21:00'))
    // 13:30~14:00 틈은 30분뿐이라 90분이 안 들어간다 → 15:00부터
    expect(result[0]!.block).toEqual({ start: at('15:00'), end: at('16:30') })
  })

  it('먼저 놓은 항목도 다음 항목이 피해야 할 자리로 친다', () => {
    const result = placeInGaps([task('a', 60), task('b', 30)], [], DAY, min('09:00'), min('21:00'))
    expect(result.map((p) => p.block)).toEqual([
      { start: at('09:00'), end: at('10:00') },
      { start: at('10:00'), end: at('10:30') },
    ])
  })

  it('하루 끝을 넘기는 항목은 빼고, 뒤의 짧은 항목은 계속 시도한다', () => {
    const result = placeInGaps([task('long', 120), task('short', 30)], [], DAY, min('20:00'), min('21:00'))
    expect(result.map((p) => p.taskId)).toEqual(['short'])
  })
})
