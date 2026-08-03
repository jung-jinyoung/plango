// AI 역산 — CLAUDE.md 10절 "decomposeMonthlyGoal | 목표 + 마감 + 카테고리 | 4주 균등 분배".
//
// 실제 Gemini 호출은 아직 없다 — Supabase Edge Function 연동 전(CLAUDE.md 17절,
// 5단계 완료 시점에 했어야 했지만 지금 6단계가 끝난 시점에서야 진행). 지금은
// 폴백(4주 균등 분배)만 실행한다. 호출부(OnboardingPage.vue)는 이 함수가
// Promise<WeeklyGoalDraft[]>를 반환한다는 것만 알면 되고, 나중에 이 함수
// 내부가 (Gemini 호출 → zod 검증 → 실패 시 decomposeMonthlyGoalFallback)으로
// 바뀌어도 호출부는 다시 안 건드린다.

import { addDays } from '../../../shared/lib/time'
import type { WeeklyGoalDraft } from '../../../entities/types'

export interface DecomposeMonthlyGoalInput {
  title: string
  baselineHours: number
  /** 4주 중 첫 주의 월요일 — "오늘"을 이 함수가 직접 알면 안 된다(CLAUDE.md 5절) */
  startWeekOf: string
}

const WEEKS = 4

export async function decomposeMonthlyGoal(input: DecomposeMonthlyGoalInput): Promise<WeeklyGoalDraft[]> {
  // TODO(CLAUDE.md 17절): 여기에 Supabase Edge Function 호출 + zod 검증을 넣는다.
  // 실패하거나 아직 연동 전이면 폴백으로 떨어진다 — 지금은 언제나 폴백.
  return decomposeMonthlyGoalFallback(input)
}

/**
 * 규칙 기반 폴백: 예상 총 시간을 4주로 균등 분배한다. 목표를 의미적으로 이해해서
 * 단계를 나누는 게 아니라 기계적으로 쪼개는 것이라, 제목을 "산출물 형태"(3절)로
 * 강제하지 못한다 — 이건 실제 AI가 붙어야 해결되는 한계로 남겨둔다.
 */
export function decomposeMonthlyGoalFallback(input: DecomposeMonthlyGoalInput): WeeklyGoalDraft[] {
  const perWeekHours = input.baselineHours / WEEKS
  return Array.from({ length: WEEKS }, (_, i) => ({
    title: `${input.title} ${i + 1}주차 진행`,
    weekOf: addDays(input.startWeekOf, i * 7),
    estimatedHours: perWeekHours,
  }))
}
