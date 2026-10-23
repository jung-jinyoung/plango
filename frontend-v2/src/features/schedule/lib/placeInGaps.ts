// "비어 있는 시간에 놓기" — 규칙 기반 자동 배치. 기획서 7-6절: 약속(과 이미 놓인
// 블록)을 먼저 고정하고 그 틈에만 넣는다. 결과는 plannedBlock에 쓰이지만 "오늘 확정"
// 전까지는 드래그로 바꿀 수 있는 제안 상태다.
//
// CLAUDE.md 10절 suggestDayLayout(AI)의 폴백에 해당한다. 17절은 폴백을 Edge Function
// 안에 두라고 하지만 백엔드가 아직 없어 여기 순수 함수로 둔다 — Supabase 도입 시
// Edge Function으로 옮기고 클라이언트 쪽은 지운다.

import type { Task, TimeBlock } from '../../../entities/types'
import { ceilTo15Min, isoAt, minutesOfDay } from '../../../shared/lib/time'

export interface Placement {
  taskId: string
  block: TimeBlock
}

/**
 * unplaced를 주어진 순서대로 fromMin 이후 가장 이른 빈틈에 넣는다.
 * 들어갈 틈이 없는 항목은 결과에서 빠진다(뒤의 짧은 항목은 계속 시도한다).
 * @param occupied 오늘 이미 잡힌 블록(약속 포함) — 겹치지 않게 피한다
 * @param fromMin  배치를 시작할 수 있는 가장 이른 분(보통 현재 시각) — 15분 경계로 올린다
 * @param dayEndMin 이 분을 넘겨서 끝나는 배치는 하지 않는다
 */
export function placeInGaps(
  unplaced: Task[],
  occupied: TimeBlock[],
  dateKey: string,
  fromMin: number,
  dayEndMin: number,
): Placement[] {
  const taken = occupied
    .map((b) => ({ start: minutesOfDay(b.start), end: minutesOfDay(b.end) }))
    .sort((a, b) => a.start - b.start)
  const placements: Placement[] = []

  for (const task of unplaced) {
    let start = ceilTo15Min(fromMin)
    for (const slot of taken) {
      if (start + task.estimatedMin <= slot.start) break
      if (start < slot.end) start = ceilTo15Min(slot.end)
    }
    const end = start + task.estimatedMin
    if (end > dayEndMin) continue

    placements.push({ taskId: task.id, block: { start: isoAt(dateKey, start), end: isoAt(dateKey, end) } })
    taken.push({ start, end })
    taken.sort((a, b) => a.start - b.start)
  }
  return placements
}
