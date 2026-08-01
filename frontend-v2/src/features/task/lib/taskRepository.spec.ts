import { describe, expect, it } from 'vitest'
import { accuracyRatio, actualMin, monthlyCurrentHours, weeklyProgress } from '../../../entities/derive'
import {
  getSeedCategories,
  getSeedMonthlyGoals,
  getSeedTasks,
  getSeedWeeklyGoals,
} from './taskRepository'

// CLAUDE.md 14절 "시드 데이터 규격" + docs/mockups/01-today.html·04-mobile-run.html의
// "오늘"(2026-07-29) 시나리오를 실제로 만족하는지 검증한다.
// seed-data.json이 없거나 형식이 깨지면 이 테스트가 먼저 실패한다.

const TODAY = '2026-07-29'

describe('taskRepository — 시드 규격 검증', () => {
  const categories = getSeedCategories()
  const monthlyGoals = getSeedMonthlyGoals()
  const weeklyGoals = getSeedWeeklyGoals()
  const tasks = getSeedTasks()

  it('카테고리·월간 목표·주간 목표를 읽어온다', () => {
    expect(categories.length).toBeGreaterThan(0)
    expect(monthlyGoals.length).toBeGreaterThan(0)
    expect(weeklyGoals.length).toBeGreaterThan(0)
  })

  it('3주 완료(achieved) + 진행 중(active) 주간 목표가 섞여 있다', () => {
    const achieved = weeklyGoals.filter((g) => g.status === 'achieved')
    const active = weeklyGoals.filter((g) => g.status === 'active')
    expect(achieved).toHaveLength(3)
    expect(active.length).toBeGreaterThan(0)
  })

  it('완료된 3주의 accuracyRatio가 1.8 → 1.6 → 1.4로 개선된다', () => {
    const achievedInOrder = weeklyGoals
      .filter((g) => g.status === 'achieved')
      .sort((a, b) => a.weekOf.localeCompare(b.weekOf))

    const ratios = achievedInOrder.map((goal) => {
      const goalTasks = tasks.filter((t) => t.weeklyGoalId === goal.id)
      return accuracyRatio(goalTasks)
    })

    expect(ratios).toEqual([1.8, 1.6, 1.4])
  })

  it('achieved 주간 목표 중 하나는 "선행연구 정리 완료"다', () => {
    const goal = weeklyGoals.find((g) => g.title === '선행연구 정리 완료')
    expect(goal?.status).toBe('achieved')
  })

  it('carryCount=2인 주간 목표는 "실험 데이터 분석 마무리"이고 active다(3주째 경고 직전)', () => {
    const nearWarning = weeklyGoals.filter((g) => g.carryCount === 2)
    expect(nearWarning).toHaveLength(1)
    expect(nearWarning[0]?.title).toBe('실험 데이터 분석 마무리')
    expect(nearWarning[0]?.status).toBe('active')
  })

  it('같은 제목이 서로 다른 상태로 겹치지 않는다', () => {
    const titles = weeklyGoals.map((g) => g.title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('월간 목표(논문 초고 완성) 현재 소요 시간이 baselineHours를 초과한다(경고 배너 재현용)', () => {
    const thesisGoal = monthlyGoals.find((m) => m.title === '논문 초고 완성')!
    const weeklyEntries = weeklyGoals.map((goal) => ({
      goal,
      tasks: tasks.filter((t) => t.weeklyGoalId === goal.id),
    }))
    const current = monthlyCurrentHours(thesisGoal, weeklyEntries)
    expect(current).toBeGreaterThan(thesisGoal.baselineHours)
  })

  it('약속(weeklyGoalId 없음)이 날짜별로 하루 2~3개씩, 28일 전체에 섞여 있다', () => {
    // 시간 미배정 인박스 항목(예: 택배 부치기)은 plannedBlock이 없어 특정 날짜에
    // 속하지 않는다 — 날짜별 개수 집계에서는 제외한다.
    const appointments = tasks.filter((t) => t.weeklyGoalId === null && t.plannedBlock !== null)
    const countsByDate = new Map<string, number>()
    for (const appt of appointments) {
      const date = appt.plannedBlock!.start.slice(0, 10)
      countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1)
    }

    expect(countsByDate.size).toBe(28) // 4주 × 7일
    for (const count of countsByDate.values()) {
      expect(count === 2 || count === 3).toBe(true)
    }
  })

  it('"아직 안 놓은 일"(인박스) — plannedBlock 없는 할 일이 목업 그대로 2개 있다', () => {
    const inbox = tasks.filter((t) => t.plannedBlock === null)
    expect(inbox).toHaveLength(2)

    const reference = inbox.find((t) => t.title === '참고문헌 정리')
    expect(reference?.estimatedMin).toBe(40)
    expect(reference?.weeklyGoalId).not.toBeNull() // 목표 연결(파란 점)

    const parcel = inbox.find((t) => t.title === '택배 부치기')
    expect(parcel?.estimatedMin).toBe(20)
    expect(parcel?.weeklyGoalId).toBeNull() // 약속(회색 점)
  })

  it('이월 배너 — 어제 날짜에 carried 상태 할 일이 목업 그대로 2개 있다', () => {
    const yesterdayCarried = tasks.filter(
      (t) => t.status === 'carried' && t.plannedBlock?.start.startsWith('2026-07-28'),
    )
    expect(yesterdayCarried).toHaveLength(2)
    for (const t of yesterdayCarried) {
      expect(t.actualBlock).toBeNull()
    }
  })

  describe('"오늘"(2026-07-29) 시나리오 — docs/mockups/01-today.html, 04-mobile-run.html 그대로', () => {
    const todayTasks = tasks.filter((t) => t.plannedBlock?.start.startsWith(TODAY))
    const byTitle = (title: string) => todayTasks.find((t) => t.title === title)!

    it('오늘 태스크가 정확히 6개다', () => {
      expect(todayTasks).toHaveLength(6)
    })

    it('논문 결과표 초안 — 9:00~10:00 계획, 9:00~10:45 실제(완료, 1시간 45분)', () => {
      const t = byTitle('논문 결과표 초안')
      expect(t.plannedBlock).toEqual({
        start: '2026-07-29T09:00:00+09:00',
        end: '2026-07-29T10:00:00+09:00',
      })
      expect(actualMin(t)).toBe(105)
      expect(t.status).toBe('done')
    })

    it('팀 회의(약속) — 11:00~12:00, 실제 11:00~11:51 (15분 미만 차이)', () => {
      const t = byTitle('팀 회의')
      expect(t.weeklyGoalId).toBeNull()
      expect(actualMin(t)).toBe(51)
      const plannedMin = 60
      expect(Math.abs(actualMin(t) - plannedMin)).toBeLessThan(15)
      expect(t.status).toBe('done')
    })

    it('그래프 3개 다듬기 — 13:00~14:00 계획, 아직 미완료(actualBlock 없음)', () => {
      const t = byTitle('그래프 3개 다듬기')
      expect(t.actualBlock).toBeNull()
      expect(t.status).toBe('todo')
    })

    it('논문 서론 초안 — 15:00~16:30, 아직 실행 전', () => {
      const t = byTitle('논문 서론 초안')
      expect(t.plannedBlock).toEqual({
        start: '2026-07-29T15:00:00+09:00',
        end: '2026-07-29T16:30:00+09:00',
      })
      expect(t.actualBlock).toBeNull()
    })

    it('헬스장 운동 — 17:00~18:00', () => {
      const t = byTitle('헬스장 운동')
      expect(t.plannedBlock).toEqual({
        start: '2026-07-29T17:00:00+09:00',
        end: '2026-07-29T18:00:00+09:00',
      })
    })

    it('저녁 약속(약속) — 19:00~20:30', () => {
      const t = byTitle('저녁 약속')
      expect(t.weeklyGoalId).toBeNull()
      expect(t.plannedBlock).toEqual({
        start: '2026-07-29T19:00:00+09:00',
        end: '2026-07-29T20:30:00+09:00',
      })
    })

    it('사이드바 — "결과 파트 작성" 3/10h(30%)', () => {
      const goal = weeklyGoals.find((g) => g.title === '결과 파트 작성')!
      const goalTasks = tasks.filter((t) => t.weeklyGoalId === goal.id)
      const actualHours = goalTasks.reduce((sum, t) => sum + actualMin(t), 0) / 60
      expect(actualHours).toBe(3)
      expect(goal.estimatedHours).toBe(10)
      expect(weeklyProgress(goal, goalTasks)).toBe(30)
    })

    it('사이드바 — "운동 습관 잡기" 90/180분(50%)', () => {
      const goal = weeklyGoals.find((g) => g.title === '운동 습관 잡기')!
      const goalTasks = tasks.filter((t) => t.weeklyGoalId === goal.id)
      const actualMinutes = goalTasks.reduce((sum, t) => sum + actualMin(t), 0)
      expect(actualMinutes).toBe(90)
      expect(goal.estimatedHours * 60).toBe(180)
      expect(weeklyProgress(goal, goalTasks)).toBe(50)
    })

    it('사이드바 — "선행연구 정리 완료" 6/6h(완료)', () => {
      const goal = weeklyGoals.find((g) => g.title === '선행연구 정리 완료')!
      const goalTasks = tasks.filter((t) => t.weeklyGoalId === goal.id)
      expect(weeklyProgress(goal, goalTasks)).toBe(100)
    })
  })
})
