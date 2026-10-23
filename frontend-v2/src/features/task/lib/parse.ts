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

// ---------- # 자동완성 (CLAUDE.md 9절 "이번 주 목표 중 자동완성") ----------

/** 입력 끝에서 쓰고 있는 #토큰의 검색어. 끝이 #토큰이 아니면 null — "#"만 친 상태는 '' */
export function activeGoalQuery(text: string): string | null {
  const match = text.match(/#(\S*)$/)
  return match ? match[1]! : null
}

/**
 * 자동완성에서 고른 목표를 # 뒤에 넣을 단어. parseTaskInput은 # 뒤를 공백 없는 한 단어로
 * 읽고, 후보 2개 이상과 겹치면 연결하지 않으므로 — 제목 단어 중 이 목표에만 매칭되는
 * 가장 짧은 단어를 고른다. 그런 단어가 없으면 첫 단어.
 */
export function goalKeyword(goal: WeeklyGoal, candidateGoals: WeeklyGoal[]): string {
  const words = goal.title.split(/\s+/).filter(Boolean)
  const unique = [...words]
    .sort((a, b) => a.length - b.length)
    .find(
      (w) =>
        candidateGoals.filter((g) => g.title.toLowerCase().includes(w.toLowerCase())).length === 1,
    )
  return unique ?? words[0] ?? goal.title
}
