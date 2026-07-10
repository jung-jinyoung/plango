/*
 * 실제 AI 연동 지점. 지금은 완료율·카테고리별 완료 패턴 집계 기반의 규칙 기반 목업이며,
 * 나중에 이 함수 내부만 실제 API 호출로 교체하면 됩니다. 시그니처(입력/출력 shape)는 유지하세요.
 *
 * @param {{ periodType: 'week'|'month', periodLabel: string, dates: string[],
 *           todosByDate: {[dateISO]: Array<{done:boolean}>},
 *           schedulesByDate: {[dateISO]: Array<{completed:boolean,categoryColor:string}>} }} input
 * @returns {Promise<{
 *   completionRate: number,
 *   categoryBreakdown: Array<{color:string,label:string,completed:number,total:number}>,
 *   weeklyBreakdown: Array<{label:string,value:number,color:string}>, // month에서만 채워짐
 *   summary: string,
 * }>}
 */
export function generateRetrospective(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(buildReport(input))
    }, 900)
  })
}

const COLORS = ['rose', 'blue', 'green', 'lavender']
const COLOR_LABELS = { rose: '운동', blue: '자기계발', green: '독서', lavender: '취미' }

function buildReport({ periodType, periodLabel, dates, todosByDate, schedulesByDate }) {
  const allTodos = dates.flatMap((d) => todosByDate[d] || [])
  const allSchedules = dates.flatMap((d) => schedulesByDate[d] || [])

  const completionRate = rateOf(allTodos.filter((t) => t.done).length, allTodos.length)

  const categoryBreakdown = COLORS.map((color) => {
    const inCategory = allSchedules.filter((s) => s.categoryColor === color)
    const completed = inCategory.filter((s) => s.completed).length
    return { color, label: COLOR_LABELS[color], completed, total: inCategory.length }
  })

  const weeklyBreakdown = periodType === 'month' ? buildWeeklyBreakdown(dates, todosByDate) : []

  const summary = buildSummary({ periodLabel, completionRate, categoryBreakdown, totalTodos: allTodos.length })

  return { completionRate, categoryBreakdown, weeklyBreakdown, summary }
}

function rateOf(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

function buildWeeklyBreakdown(dates, todosByDate) {
  const weeks = []
  for (let i = 0; i < dates.length; i += 7) {
    const chunk = dates.slice(i, i + 7)
    const todos = chunk.flatMap((d) => todosByDate[d] || [])
    weeks.push({
      label: `${weeks.length + 1}주차`,
      value: rateOf(todos.filter((t) => t.done).length, todos.length),
      color: COLORS[weeks.length % COLORS.length],
    })
  }
  return weeks
}

function buildSummary({ periodLabel, completionRate, categoryBreakdown, totalTodos }) {
  if (totalTodos === 0) {
    return `${periodLabel} 동안 기록된 할 일이 아직 없어요.`
  }

  const withData = categoryBreakdown.filter((c) => c.total > 0)
  const sorted = [...withData].sort((a, b) => b.completed / b.total - a.completed / a.total)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  let text = `${periodLabel} 완료율은 ${completionRate}%예요.`
  if (best) text += ` "${best.label}" 카테고리를 가장 꾸준히 완료했어요.`
  if (worst && worst !== best && worst.completed / worst.total < 0.5) {
    text += ` "${worst.label}" 카테고리는 상대적으로 미뤄지는 편이었어요.`
  }
  return text
}
