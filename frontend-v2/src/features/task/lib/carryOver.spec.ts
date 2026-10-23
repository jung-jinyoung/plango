import { describe, expect, it } from 'vitest'
import type { Task } from '../../../entities/types'
import { carriedCopyId, carryIntoToday, pendingCarried } from './carryOver'

const carried: Task = {
  id: 'yesterday-1',
  title: '그래프 초안',
  weeklyGoalId: 'wg-current',
  categoryId: null,
  estimatedMin: 45,
  plannedBlock: { start: '2026-07-28T10:00:00+09:00', end: '2026-07-28T10:45:00+09:00' },
  actualBlock: null,
  status: 'carried',
  confirmed: true,
}

describe('carryIntoToday', () => {
  it('원래 task는 건드리지 않고(R4) 오늘 인박스에 들어갈 새 task를 만든다', () => {
    const [copy] = carryIntoToday([carried], '2026-07-29')
    expect(copy).toEqual({
      id: 'yesterday-1-carry-2026-07-29',
      title: '그래프 초안',
      weeklyGoalId: 'wg-current',
      categoryId: null,
      estimatedMin: 45,
      plannedBlock: null,
      actualBlock: null,
      status: 'todo',
      confirmed: false,
    })
    expect(carried.status).toBe('carried')
  })
})

describe('pendingCarried', () => {
  it('이미 오늘로 옮긴 task는 빼서 두 번 옮기지 않는다', () => {
    const done = new Set([carriedCopyId('yesterday-1', '2026-07-29')])
    expect(pendingCarried([carried], '2026-07-29', done)).toEqual([])
    expect(pendingCarried([carried], '2026-07-29', new Set())).toEqual([carried])
  })
})
