import { describe, expect, it } from 'vitest'
import type { WeeklyGoal } from '../../../entities/types'
import { parseTaskInput } from './parse'

function makeGoal(id: string, title: string): WeeklyGoal {
  return {
    id,
    title,
    weekOf: '2026-07-27',
    monthlyGoalId: null,
    estimatedHours: 1,
    carryCount: 0,
    status: 'active',
  }
}

const candidateGoals: WeeklyGoal[] = [
  makeGoal('wg-1', '결과 파트 작성'),
  makeGoal('wg-2', '운동 습관 잡기'),
  makeGoal('wg-3', '선행연구 정리 완료'),
  makeGoal('wg-4', '책상 정리'), // '정리' 토큰이 wg-3과도 겹치게 만드는 모호성 유발용
]

describe('parseTaskInput', () => {
  it('시간·목표·제목을 다 파싱한다 (분 표기)', () => {
    const result = parseTaskInput('헬스장 운동 45분 #운동', candidateGoals)
    expect(result).toEqual({
      title: '헬스장 운동',
      estimatedMin: 45,
      weeklyGoalId: 'wg-2',
      matchedGoalTitle: '운동 습관 잡기',
    })
  })

  it('토큰 순서가 달라도 동일하게 파싱한다', () => {
    const result = parseTaskInput('#운동 45m 헬스장 운동', candidateGoals)
    expect(result).toEqual({
      title: '헬스장 운동',
      estimatedMin: 45,
      weeklyGoalId: 'wg-2',
      matchedGoalTitle: '운동 습관 잡기',
    })
  })

  it('시간을 15분 단위로 반올림한다 (43분 → 45분)', () => {
    const result = parseTaskInput('산책 43분', candidateGoals)
    expect(result.estimatedMin).toBe(45)
  })

  it('#가 없으면 약속(weeklyGoalId=null)이다', () => {
    const result = parseTaskInput('저녁 약속 90분', candidateGoals)
    expect(result.weeklyGoalId).toBeNull()
    expect(result.matchedGoalTitle).toBeNull()
    expect(result.title).toBe('저녁 약속')
    expect(result.estimatedMin).toBe(90)
  })

  it('시간 토큰이 없으면 estimatedMin은 0이 아니라 null이다', () => {
    const result = parseTaskInput('그냥 할 일 #결과', candidateGoals)
    expect(result.estimatedMin).toBeNull()
  })

  it('시간·목표 토큰이 둘 다 없어도 title은 그대로 파싱된다(부분 입력 허용)', () => {
    const result = parseTaskInput('그냥 할 일', candidateGoals)
    expect(result).toEqual({
      title: '그냥 할 일',
      estimatedMin: null,
      weeklyGoalId: null,
      matchedGoalTitle: null,
    })
  })

  it('#토큰이 어떤 후보와도 매칭되지 않으면 title에 원문이 그대로 남는다', () => {
    const result = parseTaskInput('장보기 #없는목표', candidateGoals)
    expect(result.weeklyGoalId).toBeNull()
    expect(result.matchedGoalTitle).toBeNull()
    expect(result.title).toBe('장보기 #없는목표')
  })

  it('#토큰이 후보 2개 이상과 겹치면(모호함) weeklyGoalId는 null이고 title에 원문이 남는다', () => {
    const result = parseTaskInput('#정리 하기', candidateGoals)
    expect(result.weeklyGoalId).toBeNull()
    expect(result.matchedGoalTitle).toBeNull()
    expect(result.title).toBe('#정리 하기')
  })
})
