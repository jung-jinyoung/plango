// 월간 경고 배너 문구를 실제 데이터 상태에 맞춰 만든다. features/reflect는
// goal·task를 참조할 수 있는 유일한 예외다(CLAUDE.md 6절).
//
// 경고 조건(product-spec 6-4절, CLAUDE.md 15절): monthlyCurrentHours가
// baselineHours를 넘었거나, projectedExtraWeeks가 1.5주 이상일 때.
// 문구는 목업 원문을 그대로 쓰지 않는다 — 실제로 이미 넘었는지(baseline 초과)와
// 페이스가 빠듯한지(extraWeeks)는 서로 다른 신호라 따로 문장을 만들고,
// 해당하는 것만 이어붙인다. CLAUDE.md 8절: 해요체, 실패 언어 금지.

import { formatMinutesAsHours } from '../../../shared/lib/time'
import type { MonthlyGoal } from '../../../entities/types'

export interface MonthlyWarning {
  monthlyGoalId: string
  title: string
  body: string
  overBudget: boolean
  extraWeeks: number | null
}

export function buildMonthlyWarning(
  monthlyGoal: MonthlyGoal,
  currentHours: number,
  extraWeeks: number | null,
): MonthlyWarning | null {
  const overHours = currentHours - monthlyGoal.baselineHours
  const overBudget = overHours > 0
  const paceTight = (extraWeeks ?? 0) >= 1.5

  if (!overBudget && !paceTight) return null

  const sentences: string[] = []
  if (overBudget) {
    sentences.push(
      `${monthlyGoal.title}에 이미 예상보다 ${formatMinutesAsHours(Math.round(overHours * 60))} 더 썼어요.`,
    )
  }
  if (paceTight && extraWeeks !== null) {
    sentences.push(`지금 페이스면 완료까지 ${extraWeeks}주가 더 걸려요.`)
  }
  sentences.push('범위를 줄이거나 목표를 다시 잡으면 여유가 생겨요.')

  return {
    monthlyGoalId: monthlyGoal.id,
    title: overBudget ? '예상보다 많이 썼어요' : '지금 페이스면 빠듯해요',
    body: sentences.join(' '),
    overBudget,
    extraWeeks,
  }
}
