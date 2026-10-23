// 포트폴리오 배포용 "날짜 신선도" — 시드는 2026-07-29(수) 기준으로 고정
// 생성돼 있는데, QR/URL은 배포 후 몇 달이 지나도 계속 방문될 수 있다.
// VITE_DEMO_FRESH가 켜져 있을 때만 모든 날짜를 방문자의 실제 "이번 주"로
// 통째로 이동시켜서 "지난 7월" 데모처럼 보이지 않게 한다.
//
// 개발·테스트 환경(VITE_DEMO_FRESH 미설정)에서는 완전한 no-op이라 기존
// 동작(demoScenario.spec.ts 등, 2026-07-29 고정 시나리오)에 영향이 없다.
//
// 이동은 항상 7의 배수(주 단위)로만 한다 — 요일 정렬(월요일=weekOf,
// 태스크의 요일별 시간대)이 그대로 보존되도록. 즉 "오늘"은 항상 실제
// 현재 주의 수요일로 보인다(방문자의 실제 요일과는 다를 수 있다) — 이건
// router의 진입 라우팅(nowIso() 기준 실제 시각)과는 별개 개념이다.

import { addDays, daysSince, nowIso, startOfWeek } from './time'
import type { Category, MonthlyGoal, Task, WeeklyGoal } from '../../entities/types'

export interface SeedData {
  categories: Category[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  tasks: Task[]
}

// generate-seed.mjs / generate-seed-doyoon.mjs의 TODAY와 반드시 같아야 한다.
export const ANCHOR_TODAY = '2026-07-29'

export function isDemoFreshEnabled(): boolean {
  return import.meta.env.VITE_DEMO_FRESH === 'true'
}

function offsetDays(): number {
  const anchorMonday = startOfWeek(ANCHOR_TODAY)
  const currentMonday = startOfWeek(nowIso().slice(0, 10))
  return daysSince(anchorMonday, currentMonday)
}

/** "오늘" — 비활성 시 ANCHOR_TODAY 그대로, 활성 시 실제 이번 주로 이동한 값 */
export function getDemoToday(): string {
  if (!isDemoFreshEnabled()) return ANCHOR_TODAY
  return addDays(ANCHOR_TODAY, offsetDays())
}

function shiftIso(iso: string, days: number): string {
  const dateKey = iso.slice(0, 10)
  const shiftedKey = addDays(dateKey, days)
  return shiftedKey + iso.slice(10)
}

/** 비활성 시 입력을 그대로 반환한다(no-op) — 원본 배열/객체 참조를 그대로 내준다 */
export function shiftSeedForDemo(data: SeedData): SeedData {
  if (!isDemoFreshEnabled()) return data

  const days = offsetDays()
  const shiftedMonth = getDemoToday().slice(0, 7)

  return {
    categories: data.categories,
    monthlyGoals: data.monthlyGoals.map((g) => ({ ...g, month: shiftedMonth })),
    weeklyGoals: data.weeklyGoals.map((g) => ({ ...g, weekOf: addDays(g.weekOf, days) })),
    tasks: data.tasks.map((t) => ({
      ...t,
      plannedBlock: t.plannedBlock && {
        start: shiftIso(t.plannedBlock.start, days),
        end: shiftIso(t.plannedBlock.end, days),
      },
      actualBlock: t.actualBlock && {
        start: shiftIso(t.actualBlock.start, days),
        end: shiftIso(t.actualBlock.end, days),
      },
    })),
  }
}
