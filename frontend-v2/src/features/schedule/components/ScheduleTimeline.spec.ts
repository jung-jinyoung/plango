import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../../../entities/types'
import ScheduleTimeline, { type TimelineTaskInput } from './ScheduleTimeline.vue'

// 드래그가 R2·R3를 지키는지 검증한다: 확정 전 미래 블록은 plannedBlock,
// 확정 후 미래 블록은 취소(emit 없음), 과거 블록은 확정 여부와 무관하게
// 항상 actualBlock. 15분 스냅도 함께 확인한다.

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 't-default',
    title: '할 일',
    weeklyGoalId: null,
    categoryId: null,
    estimatedMin: 60,
    plannedBlock: { start: '2026-07-29T15:00:00+09:00', end: '2026-07-29T16:00:00+09:00' },
    actualBlock: null,
    status: 'todo',
    confirmed: false,
    ...overrides,
  }
}

function mountTimeline(task: Task) {
  const input: TimelineTaskInput = { task, color: 'blue' }
  return mount(ScheduleTimeline, {
    props: { tasks: [input], startHour: 8, endHour: 21, pxPerHour: 64 },
  })
}

// 08:00 시작·64px/h 기준 15:00 블록의 top = (15-8)*64 = 448px
async function drag(wrapper: ReturnType<typeof mountTimeline>, deltaPx: number) {
  const block = wrapper.find('.block')
  await block.trigger('pointerdown', { clientY: 0, pointerId: 1 })
  await block.trigger('pointermove', { clientY: deltaPx, pointerId: 1 })
  await block.trigger('pointerup', { clientY: deltaPx, pointerId: 1 })
}

describe('ScheduleTimeline 드래그', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // KST 10:00 — nowIso()가 UTC+9h를 UTC getter로 읽으므로 UTC 01:00을 준다.
    vi.setSystemTime(new Date('2026-07-29T01:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('확정 전 + 미래 위치로 드래그하면 plannedBlock 수정으로 emit한다', async () => {
    const task = makeTask({ confirmed: false })
    const wrapper = mountTimeline(task)

    await drag(wrapper, 64) // 15:00 → 16:00 (1시간 아래로, 미래, now=10:00)

    const events = wrapper.emitted('drag-block')
    expect(events).toHaveLength(1)
    expect(events![0]).toEqual([
      task.id,
      'plannedBlock',
      { start: '2026-07-29T16:00:00+09:00', end: '2026-07-29T17:00:00+09:00' },
    ])
  })

  it('확정 후 + 미래 위치로 드래그하면 취소된다(emit 없음, R2)', async () => {
    const task = makeTask({ confirmed: true })
    const wrapper = mountTimeline(task)

    await drag(wrapper, 64)

    expect(wrapper.emitted('drag-block')).toBeUndefined()
  })

  it('과거 위치로 드래그하면 확정 여부와 무관하게 actualBlock으로 emit한다(R3)', async () => {
    const task = makeTask({ confirmed: true }) // 확정됐어도
    const wrapper = mountTimeline(task)

    // 15:00 블록을 위로 6시간 옮겨 09:00으로 — now(10:00)보다 이전
    await drag(wrapper, -6 * 64)

    const events = wrapper.emitted('drag-block')
    expect(events).toHaveLength(1)
    expect(events![0]).toEqual([
      task.id,
      'actualBlock',
      { start: '2026-07-29T09:00:00+09:00', end: '2026-07-29T10:00:00+09:00' },
    ])
  })

  it('15분 단위로 스냅한다', async () => {
    const task = makeTask({ confirmed: false })
    const wrapper = mountTimeline(task)

    // 10px ≈ 9.4분 → 15분으로 스냅되어 15:15 결과가 나와야 한다(10px는
    // 64px/h 기준 9.375분, round(9.375/15)*15 = 15)
    await drag(wrapper, 10)

    const events = wrapper.emitted('drag-block')
    expect(events).toHaveLength(1)
    expect(events![0]![2]).toEqual({
      start: '2026-07-29T15:15:00+09:00',
      end: '2026-07-29T16:15:00+09:00',
    })
  })

  it('pointerId가 다른 pointermove/pointerup은 무시한다', async () => {
    const task = makeTask({ confirmed: false })
    const wrapper = mountTimeline(task)
    const block = wrapper.find('.block')

    await block.trigger('pointerdown', { clientY: 0, pointerId: 1 })
    await block.trigger('pointermove', { clientY: 64, pointerId: 2 }) // 다른 포인터 — 무시돼야 함
    await block.trigger('pointerup', { clientY: 64, pointerId: 2 }) // 다른 포인터 — 무시돼야 함

    expect(wrapper.emitted('drag-block')).toBeUndefined()
  })
})
