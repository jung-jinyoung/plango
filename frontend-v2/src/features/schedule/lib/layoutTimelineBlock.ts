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
