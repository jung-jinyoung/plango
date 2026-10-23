// 이월 배너 "오늘로 옮기기" — R4: 지난 기록은 이동·수정하지 않는다. 이월은 새 항목 생성이다.
// 원래 task(status: carried)는 그대로 두고, 같은 내용의 새 task를 오늘 인박스(plannedBlock 없음)에 만든다.

import type { Task } from '../../../entities/types'

/** 옮겨 만든 task의 id — 원래 id와 날짜로 정해져서 같은 날 두 번 옮겨도 중복되지 않는다 */
export function carriedCopyId(taskId: string, today: string): string {
  return `${taskId}-carry-${today}`
}

/** 아직 오늘로 옮기지 않은 이월 task만 남긴다 */
export function pendingCarried(carried: Task[], today: string, existingIds: Set<string>): Task[] {
  return carried.filter((t) => !existingIds.has(carriedCopyId(t.id, today)))
}

/** 이월 task마다 오늘 인박스에 들어갈 새 task를 만든다 */
export function carryIntoToday(carried: Task[], today: string): Task[] {
  return carried.map((t) => ({
    id: carriedCopyId(t.id, today),
    title: t.title,
    weeklyGoalId: t.weeklyGoalId,
    categoryId: t.categoryId,
    estimatedMin: t.estimatedMin,
    plannedBlock: null,
    actualBlock: null,
    status: 'todo',
    confirmed: false,
  }))
}
