// 도메인 타입 + 규칙. CLAUDE.md 4절이 단일 출처 — 정의를 바꾸려면 먼저 CLAUDE.md부터 고친다.

export type CategoryColor =
  | 'blue' | 'mint' | 'amber' | 'purple' | 'green' | 'gray'

export interface Category {
  id: string
  name: string
  color: CategoryColor // 6색 고정. 자유 색상 불가
}

export interface MonthlyGoal {
  id: string
  title: string
  month: string // 'YYYY-MM'
  categoryId: string
  baselineHours: number // 초기 추정. 생성 후 변경 금지
  status: 'active' | 'achieved' | 'dropped'
}

export interface WeeklyGoal {
  id: string
  title: string // 산출물 형태. "~ 완료", "~ 작성"
  weekOf: string // 해당 주 월요일 'YYYY-MM-DD'
  monthlyGoalId: string | null
  estimatedHours: number // 이월 시 재추정된 값
  carryCount: number // 연속 이월 횟수
  status: 'active' | 'achieved' | 'carried' | 'dropped'
}

export interface TimeBlock {
  start: string // ISO 8601, 로컬 오프셋 포함
  end: string
}

export interface Task {
  id: string
  title: string
  weeklyGoalId: string | null // null = 약속
  categoryId: string | null // weeklyGoalId 있으면 사용하지 않음
  estimatedMin: number // 15의 배수
  plannedBlock: TimeBlock | null
  actualBlock: TimeBlock | null
  status: 'todo' | 'done' | 'carried' | 'dropped'
}

// 파생값 — 저장하지 않는다 (CLAUDE.md 4절). 구현은 features/*, 순수 함수로.
//   resolveCategory(task)        // 목표 체인 → 없으면 task.categoryId
//   actualMin(task)              // actualBlock에서 계산
//   weeklyProgress(goal, tasks)  // 하위 할 일 actualMin 합 / estimatedHours
//   monthlyCurrentHours(goal)    // 완료 실적 + 남은 주간 재추정 합
//   accuracyRatio(tasks)         // Σ actualMin / Σ estimatedMin
