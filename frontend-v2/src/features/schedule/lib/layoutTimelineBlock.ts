// 시간 → 타임라인 px 좌표 변환. 색 해석 등 다른 판단은 여기서 하지 않는다 —
// 순수하게 좌표 계산만. resolveCategory/shouldShowGhost는 호출부(페이지 레벨)와
// entities/derive.ts가 각자 담당한다.

import { minutesOfDay } from '../../../shared/lib/time'
import type { TimeBlock } from '../../../entities/types'

export interface TimelineLayout {
  top: number
  height: number
}

/** TimeBlock을 타임라인 px 좌표로 변환한다. startHour는 타임라인이 시작하는 시각(예: 8시) */
export function layoutTimelineBlock(
  block: TimeBlock,
  startHour: number,
  pxPerHour: number,
): TimelineLayout {
  const startMin = minutesOfDay(block.start) - startHour * 60
  const endMin = minutesOfDay(block.end) - startHour * 60
  return {
    top: (startMin / 60) * pxPerHour,
    height: ((endMin - startMin) / 60) * pxPerHour,
  }
}

/**
 * layoutTimelineBlock의 역함수 — 타임라인 위 px 위치를 자정 기준 분(minute)으로
 * 되돌린다. 드래그 중인 블록의 새 위치를 시각으로 해석할 때 쓴다(15분 스냅은
 * 호출부 책임 — 여기선 순수 좌표 변환만 한다).
 */
export function pxToMinutesOfDay(px: number, startHour: number, pxPerHour: number): number {
  return Math.round((px / pxPerHour) * 60) + startHour * 60
}
