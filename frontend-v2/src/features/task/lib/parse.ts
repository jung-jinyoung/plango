// 입력 파서 — 토큰의 생김새로 판정한다. 순서 자유 (CLAUDE.md 9절).
// 번호 참조(`/1` 같은 형태)는 구현하지 않는다. 토큰 종류는 시간·목표·제목 3개뿐.

import type { WeeklyGoal } from '../../../entities/types'

export interface ParsedTaskInput {
  title: string
  estimatedMin: number | null // 시간 토큰 없으면 null (0 아님)
  weeklyGoalId: string | null // #토큰 없거나 매칭 실패/모호하면 null
  matchedGoalTitle: string | null // 매칭 성공했을 때만 채움 (미리보기 칩 표시용)
}

// \b(단어 경계)는 아스키 \w 기준이라 '분' 뒤에서는 성립하지 않는다 — 'm' 쪽에만 적용한다.
const TIME_TOKEN = /(\d+)\s*(?:분|m\b)/i
const GOAL_TOKEN = /#(\S+)/

export function parseTaskInput(text: string, candidateGoals: WeeklyGoal[]): ParsedTaskInput {
  let working = text

  let estimatedMin: number | null = null
  const timeMatch = working.match(TIME_TOKEN)
  if (timeMatch) {
    const rawMinutes = Number(timeMatch[1])
    estimatedMin = Math.round(rawMinutes / 15) * 15
    working = working.replace(TIME_TOKEN, ' ')
  }

  let weeklyGoalId: string | null = null
  let matchedGoalTitle: string | null = null
  const goalMatch = working.match(GOAL_TOKEN)
  if (goalMatch) {
    const token = goalMatch[1]!.toLowerCase()
    const matches = candidateGoals.filter((g) => g.title.toLowerCase().includes(token))
    if (matches.length === 1) {
      weeklyGoalId = matches[0]!.id
      matchedGoalTitle = matches[0]!.title
      working = working.replace(GOAL_TOKEN, ' ')
    }
    // 매칭 0개(못 찾음) 또는 2개 이상(모호함)이면 제거하지 않는다 —
    // 사용자가 뭘 쳤는지 title에 그대로 남겨서 보여준다.
  }

  const title = working.replace(/\s+/g, ' ').trim()

  return { title, estimatedMin, weeklyGoalId, matchedGoalTitle }
}
