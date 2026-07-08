import { minutesToLabel } from '@/utils/date'

/*
 * 실제 AI 연동 지점. 지금은 마감 임박도·예상 소요시간 기준의 규칙 기반 목업이며,
 * 나중에 이 함수 내부만 실제 API 호출로 교체하면 됩니다. 시그니처(입력/출력 shape)는 유지하세요.
 *
 * @param {{ todos: Array<{id:string,title:string,estimatedMinutes:number|null,deadlineMinutes:number|null}>,
 *           existingSchedules: Array<{startMinutes:number,durationMinutes:number}>,
 *           dateISO: string }} input
 * @returns {Promise<{ recommendations: Array<{todoId:string,title:string,startMinutes:number,durationMinutes:number,categoryColor:string,reason:string}>, summary: string }>}
 */
export function recommendDailyPlan({ todos, existingSchedules }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildRecommendations(todos, existingSchedules))
    }, 900)
  })
}

const WORK_START = 9 * 60
const WORK_END = 21 * 60
const LUNCH = [12 * 60, 13 * 60]
const GAP = 10
const COLORS = ['rose', 'blue', 'green', 'lavender']

function buildRecommendations(todos, existingSchedules) {
  const sorted = [...todos].sort(compareTodos)
  const blocked = [LUNCH, ...existingSchedules.map((s) => [s.startMinutes, s.startMinutes + s.durationMinutes])]

  const recommendations = []
  let cursor = WORK_START
  let urgentTitle = null

  for (const [i, todo] of sorted.entries()) {
    const duration = todo.estimatedMinutes || 30
    const start = findFreeStart(cursor, duration, blocked)
    blocked.push([start, start + duration])
    cursor = start + duration + GAP

    if (todo.deadlineMinutes != null && !urgentTitle) urgentTitle = todo.title

    recommendations.push({
      todoId: todo.id,
      title: todo.title,
      startMinutes: start,
      durationMinutes: duration,
      categoryColor: COLORS[i % COLORS.length],
      reason: reasonFor(todo, duration),
    })
  }

  const summary =
    recommendations.length === 0
      ? '추천할 할 일이 없어요.'
      : urgentTitle
        ? `할 일 ${recommendations.length}개를 정리했어요. "${urgentTitle}"는 마감이 임박해 가장 먼저 배치했어요.`
        : `할 일 ${recommendations.length}개를 소요시간 기준으로 정리했어요.`

  return { recommendations, summary }
}

function compareTodos(a, b) {
  const aHasDeadline = a.deadlineMinutes != null
  const bHasDeadline = b.deadlineMinutes != null
  if (aHasDeadline !== bHasDeadline) return aHasDeadline ? -1 : 1
  if (aHasDeadline && bHasDeadline) return a.deadlineMinutes - b.deadlineMinutes
  return (a.estimatedMinutes || 30) - (b.estimatedMinutes || 30)
}

function findFreeStart(from, duration, blocked) {
  let start = from
  if (start + duration > WORK_END) start = WORK_START // 근무 시간을 넘기면 다음날 오전부터로 되돌림(데모 단순화)

  while (true) {
    const overlapping = blocked.find(([bs, be]) => start < be && start + duration > bs)
    if (!overlapping) return start
    start = overlapping[1] + GAP
  }
}

function reasonFor(todo, duration) {
  if (todo.deadlineMinutes != null) {
    return `마감(${minutesToLabel(todo.deadlineMinutes)}) 전에 끝낼 수 있도록 먼저 배치했어요`
  }
  if (duration <= 30) return '소요시간이 짧아 먼저 처리하기 좋아요'
  return '여유 시간대에 배치했어요'
}
