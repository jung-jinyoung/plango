// 파생 함수 — 저장하지 않는다 (CLAUDE.md 4절)

import { daysSince, minutesBetween, minutesOfDay } from '../shared/lib/time'
import type { Category, CategoryColor, MonthlyGoal, Task, TimeBlock, WeeklyGoal } from './types'

/** Dot/Chip 등에 색을 넘길 때 이 함수를 거친다 — 컴포넌트마다 `?? 'gray'`를 반복하지 않는다 */
export function categoryColorOf(category: Category | null): CategoryColor {
  return category?.color ?? 'gray'
}

/**
 * 목표 체인(주간 목표 → 월간 목표 → 카테고리)을 먼저 따라가고,
 * 체인이 없으면(= 약속) task.categoryId를 그대로 쓴다.
 */
export function resolveCategory(
  task: Task,
  weeklyGoals: Map<string, WeeklyGoal>,
  monthlyGoals: Map<string, MonthlyGoal>,
  categories: Map<string, Category>,
): Category | null {
  if (task.weeklyGoalId) {
    const weeklyGoal = weeklyGoals.get(task.weeklyGoalId)
    const monthlyGoal = weeklyGoal?.monthlyGoalId
      ? monthlyGoals.get(weeklyGoal.monthlyGoalId)
      : undefined
    if (monthlyGoal) return categories.get(monthlyGoal.categoryId) ?? null
  }
  return task.categoryId ? (categories.get(task.categoryId) ?? null) : null
}

/** 월간 목표의 카테고리를 찾는다 */
export function resolveCategoryForMonthlyGoal(
  goal: MonthlyGoal,
  categories: Map<string, Category>,
): Category | null {
  return categories.get(goal.categoryId) ?? null
}

/** 주간 목표의 카테고리를 찾는다 — 주간 목표 자체엔 카테고리가 없어서 월간 목표를 거친다 */
export function resolveCategoryForWeeklyGoal(
  goal: WeeklyGoal,
  monthlyGoals: Map<string, MonthlyGoal>,
  categories: Map<string, Category>,
): Category | null {
  if (!goal.monthlyGoalId) return null
  const monthlyGoal = monthlyGoals.get(goal.monthlyGoalId)
  if (!monthlyGoal) return null
  return categories.get(monthlyGoal.categoryId) ?? null
}

/** actualBlock에서 계산한 실제 소요 분. 기록 전이면 0 */
export function actualMin(task: Task): number {
  if (!task.actualBlock) return 0
  return minutesBetween(task.actualBlock.start, task.actualBlock.end)
}

/**
 * 주간 목표 진도 (0~100+, %). tasks는 호출부에서 이 goal에 속한 것만 걸러서 넘긴다.
 * estimatedHours가 0 이하면 나눌 수 없으니 0을 반환한다.
 */
export function weeklyProgress(goal: WeeklyGoal, tasks: Task[]): number {
  const estimatedMin = goal.estimatedHours * 60
  if (estimatedMin <= 0) return 0
  const totalActualMin = tasks.reduce((sum, task) => sum + actualMin(task), 0)
  return (totalActualMin / estimatedMin) * 100
}

/**
 * 월간 목표의 현재 소요 시간(시간 단위) = 완료된 주간 목표의 실측 합
 * + 진행 중(active/carried) 주간 목표의 재추정(estimatedHours) 합.
 * dropped 주간 목표는 포함하지 않는다.
 */
export function monthlyCurrentHours(
  monthlyGoal: MonthlyGoal,
  weeklyEntries: { goal: WeeklyGoal; tasks: Task[] }[],
): number {
  let totalMin = 0
  for (const { goal, tasks } of weeklyEntries) {
    if (goal.monthlyGoalId !== monthlyGoal.id) continue
    if (goal.status === 'achieved') {
      totalMin += tasks.reduce((sum, task) => sum + actualMin(task), 0)
    } else if (goal.status === 'active' || goal.status === 'carried') {
      totalMin += goal.estimatedHours * 60
    }
  }
  return totalMin / 60
}

/**
 * 예상 정확도 = Σ실제 / Σ예상. 값이 클수록 예상보다 오래 걸렸다는 뜻.
 * 예상 합이 0 이하면 판정할 수 없으니 0을 반환한다.
 */
export function accuracyRatio(tasks: Task[]): number {
  const totalEstimatedMin = tasks.reduce((sum, task) => sum + task.estimatedMin, 0)
  if (totalEstimatedMin <= 0) return 0
  const totalActualMin = tasks.reduce((sum, task) => sum + actualMin(task), 0)
  return totalActualMin / totalEstimatedMin
}

/**
 * 지난 N주(기본 4)의 "주간 총 실제 투입 시간" 중앙값(시간 단위) — product-spec
 * 6-5절 "주간 가용 시간 = 지난 4주 실제 투입 중앙값 − 이미 잡힌 약속"의 분자.
 *
 * 목표 종류(연구/습관 등)를 가리지 않는다 — 개별 목표의 accuracyRatio(예상
 * 대비 배율)와는 다른 값으로, 그 주 목표-연결 할 일(weeklyGoalId 있는 Task)에
 * 실제로 쓴 시간의 총합을 weekOf 단위로 모아서 중앙값을 낸다. 약속
 * (weeklyGoalId === null)은 포함하지 않는다 — 약속은 공식 반대편(이미 잡힌
 * 약속)에서 별도로 빠지기 때문이다.
 *
 * beforeWeekOf 그 이전 주만 센다 — 진행 중인 주는 아직 끝나지 않아
 * 실적으로 볼 수 없다.
 */
export function weeklyMedianActualHours(
  weeklyGoals: WeeklyGoal[],
  tasks: Task[],
  beforeWeekOf: string,
  weeks = 4,
): number {
  const pastWeeks = [...new Set(weeklyGoals.map((g) => g.weekOf))]
    .filter((weekOf) => weekOf < beforeWeekOf)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, weeks)

  const hoursByWeek = pastWeeks.map((weekOf) => {
    const goalIds = new Set(weeklyGoals.filter((g) => g.weekOf === weekOf).map((g) => g.id))
    const totalMin = tasks
      .filter((t) => t.weeklyGoalId !== null && goalIds.has(t.weeklyGoalId))
      .reduce((sum, t) => sum + actualMin(t), 0)
    return totalMin / 60
  })

  if (hoursByWeek.length === 0) return 0
  const sorted = [...hoursByWeek].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!
}

/**
 * 지금 페이스대로면 이 월간 목표를 끝내는 데 몇 주가 더 걸릴지(반올림) —
 * 월간 경고 배너의 두 조건 중 하나(product-spec 6-4절, CLAUDE.md 15절).
 *
 * remainingHours = 이 월간 목표에 연결된 주간 목표 중 achieved·dropped가
 * 아닌 것들(active·carried)의 estimatedHours 합 — "아직 안 끝난 만큼".
 * 페이스는 weeklyMedianActualHours(목표 종류를 안 가리는 전체 실측 중앙값)를
 * 그대로 재사용한다. 페이스가 0이면 나눌 수 없으니 null.
 */
export function projectedExtraWeeks(
  monthlyGoal: MonthlyGoal,
  weeklyGoals: WeeklyGoal[],
  tasks: Task[],
  currentMonday: string,
): number | null {
  const remainingHours = weeklyGoals
    .filter(
      (g) => g.monthlyGoalId === monthlyGoal.id && g.status !== 'achieved' && g.status !== 'dropped',
    )
    .reduce((sum, g) => sum + g.estimatedHours, 0)

  const pace = weeklyMedianActualHours(weeklyGoals, tasks, currentMonday)
  if (pace <= 0) return null

  return Math.round(remainingHours / pace)
}

/**
 * 계획과 실제 길이 차이가 15분 이상이면 계획 고스트를 병기해야 한다는 뜻으로
 * true (CLAUDE.md 5절 "차이가 15분 이상일 때만 계획 고스트를 병기"). 이 판정을
 * 타임라인 컴포넌트에서 다시 구현하지 않는다 — 여기 한 곳에만 둔다.
 * 계획이나 실제 중 하나라도 없으면 비교할 게 없으니 false.
 */
export function shouldShowGhost(task: Task): boolean {
  if (!task.plannedBlock || !task.actualBlock) return false
  const plannedMin = minutesBetween(task.plannedBlock.start, task.plannedBlock.end)
  return Math.abs(actualMin(task) - plannedMin) >= 15
}

/**
 * "지금 하는 일"(8단계, 모바일 실행 뷰) — plannedBlock이 현재 시각을 걸치고
 * 있는 todo 할 일. 새 상태를 저장하지 않는다(TimeBlock.end가 필수라 "진행
 * 중"을 별도로 저장할 수 없다, CLAUDE.md 5-4절 "자동 포착"은 완료 시점에만
 * 일어난다) — 매번 이렇게 파생시킨다.
 *
 * 날짜가 아니라 시각(시:분)만 비교한다 — CurrentTimeBar가 useNow()의
 * 실제 현재 시각을 시드 데이터의 고정 날짜 타임라인 위에 투영하는 것과
 * 같은 방식(layoutTimelineBlock도 minutesOfDay만 본다).
 */
/**
 * "다 했어요"(완료 체크) 자동 포착의 시작 시각 초안(product-spec.md 5-4절
 * "자동 포착" — 부정확해도 되는 초안, 9단계 일괄 확인에서 고친다).
 *
 * 오늘 이미 완료된 할 일 중 가장 늦은 actualBlock.end가 이 할 일의
 * plannedBlock.start보다 늦으면(직전 작업이 밀려서 이 작업도 늦게
 * 시작했을 가능성) 그 시각을 시작으로 쓰고, 아니면 plannedBlock.start를
 * 그대로 쓴다 — 직전 작업이 일찍 끝났다고 이 작업도 일찍 시작했다고
 * 가정하지 않는다.
 *
 * ISO 문자열끼리 그대로 비교한다 — 같은 날짜·같은 오프셋 형식이라
 * 사전식 비교가 시간 순서와 일치한다(minutesOfDay와 같은 전제).
 */
export function captureActualStart(plannedStart: string, todayTasks: Task[]): string {
  const previousEnds = todayTasks
    .filter((t) => t.status === 'done' && t.actualBlock)
    .map((t) => t.actualBlock!.end)
  if (previousEnds.length === 0) return plannedStart
  const latestPreviousEnd = previousEnds.reduce((max, end) => (end > max ? end : max))
  return latestPreviousEnd > plannedStart ? latestPreviousEnd : plannedStart
}

/**
 * 오늘 뷰 타임라인 드래그가 어느 필드를 바꿔야 하는지 판정한다(R2·R3).
 * dropStartIso는 드래그를 놓은 위치의 새 시작 시각.
 *
 * - 놓은 위치가 현재 시각 이전(과거)이면 확정 여부와 무관하게 항상
 *   actualBlock(실제 기록)이다 — R2는 plannedBlock만 보호하지 actualBlock
 *   교정을 막지 않는다.
 * - 놓은 위치가 현재 시각 이후(미래)면, 아직 확정 전이면 plannedBlock(계획
 *   수정)이고, 이미 확정됐으면 null — 이 드래그는 취소해야 한다(R2).
 *
 * ISO 문자열끼리 그대로 비교한다 — findCurrentTask/captureActualStart와
 * 같은 전제(같은 날짜·오프셋 형식이면 사전식 비교가 시간 순서와 일치).
 */
export function resolveDragTarget(
  task: Task,
  dropStartIso: string,
  nowIso: string,
): 'plannedBlock' | 'actualBlock' | null {
  if (dropStartIso <= nowIso) return 'actualBlock'
  return task.confirmed ? null : 'plannedBlock'
}

/** 두 TimeBlock이 겹치는지. 경계가 맞닿기만 하는 건(한쪽 end === 다른쪽 start) 겹침이 아니다 — 뒤이어 붙는 일정은 정상이다. */
function blocksOverlap(a: TimeBlock, b: TimeBlock): boolean {
  return a.start < b.end && b.start < a.end
}

/**
 * 드래그로 놓은 새 블록이 같은 taskId를 제외한 다른 task의 plannedBlock과
 * 시간이 겹치는지 판정한다. 드롭 대상 필드(plannedBlock/actualBlock)와
 * 무관하게 항상 plannedBlock을 기준으로 비교한다 — plannedBlock이 "지금
 * 스케줄된 하루"를 나타내므로, 실제 기록을 놓든 계획을 옮기든 이미 다른
 * 일이 잡힌 시간대와 겹치면 안 된다.
 *
 * ISO 문자열이 날짜까지 포함하므로 별도로 "같은 날짜"를 걸러낼 필요가
 * 없다 — 다른 날짜 블록은 애초에 시간 구간이 겹칠 수 없다.
 */
export function hasScheduleConflict(newBlock: TimeBlock, taskId: string, tasks: Task[]): boolean {
  return tasks.some((t) => t.id !== taskId && t.plannedBlock && blocksOverlap(newBlock, t.plannedBlock))
}

export function findCurrentTask(tasks: Task[], nowIso: string): Task | null {
  const nowMin = minutesOfDay(nowIso)
  return (
    tasks.find((task) => {
      if (task.status !== 'todo' || !task.plannedBlock) return false
      const startMin = minutesOfDay(task.plannedBlock.start)
      const endMin = minutesOfDay(task.plannedBlock.end)
      return nowMin >= startMin && nowMin < endMin
    }) ?? null
  )
}

/**
 * "마지막 활동 날짜"('YYYY-MM-DD') — 진입 라우팅(CLAUDE.md 12절) "마지막 활동
 * 3일 이상 전" 판정의 근거. plannedBlock은 "매일 아침" JIT로만 생성되므로
 * (CLAUDE.md 11절) 그 존재 자체가 실제 사용 신호다 — plannedBlock이 있는
 * task 중 today 이하(오늘 포함, 과거)인 것만 골라 가장 최근 날짜를 쓴다.
 * today보다 미래인 plannedBlock(예: 다음 주 약속 placeholder)은 아직 벌어지지
 * 않은 일이라 "활동"이 아니므로 제외한다 — 안 걸러내면 미래 일정이 있다는
 * 이유만으로 공백이 없는 것처럼 잘못 판정된다. task가 하나도 없으면(=판정
 * 불가) null.
 */
export function lastActiveDate(tasks: Task[], today: string): string | null {
  const dateKeys = tasks
    .filter((t) => t.plannedBlock && t.plannedBlock.start.slice(0, 10) <= today)
    .map((t) => t.plannedBlock!.start.slice(0, 10))
  if (dateKeys.length === 0) return null
  return dateKeys.reduce((max, d) => (d > max ? d : max))
}

/**
 * carried task 중 staleDays(기본 3일) 이상 지난 것을 걸러낸다 — 오늘 화면의
 * 이월 배너/리스트에 "보여줄 것"만 추리는 화면 표시 필터다. status는 건드리지
 * 않는다(R4) — "조용히 아카이브"는 데이터 변경이 아니라 필터일 뿐이다
 * (진입 라우팅 12절 "복귀 리셋").
 */
export function filterStaleCarried(tasks: Task[], today: string, staleDays = 3): Task[] {
  return tasks.filter((t) => {
    if (t.status !== 'carried' || !t.plannedBlock) return false
    return daysSince(t.plannedBlock.start.slice(0, 10), today) < staleDays
  })
}
