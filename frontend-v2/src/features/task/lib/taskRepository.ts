// docs/seed-data.json(시드 픽스처)을 읽어 타입이 붙은 컬렉션으로 내준다.
// scripts/generate-seed.mjs가 이 파일을 생성한다 — 규격은 CLAUDE.md 14절 참고.

import seedData from '../../../../docs/seed-data.json'
import type { Category, MonthlyGoal, Task, WeeklyGoal } from '../../../entities/types'

interface SeedData {
  categories: Category[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
  tasks: Task[]
}

const data = seedData as SeedData

export function getSeedCategories(): Category[] {
  return data.categories
}

export function getSeedMonthlyGoals(): MonthlyGoal[] {
  return data.monthlyGoals
}

export function getSeedWeeklyGoals(): WeeklyGoal[] {
  return data.weeklyGoals
}

export function getSeedTasks(): Task[] {
  return data.tasks
}

/**
 * task 하나를 patch로 갱신한다. 지금은 seed-data.json 기반이라 실제 저장소에
 * 반영되진 않는다(Supabase 전환 예정, CLAUDE.md 17절) — 호출 경로(스토어 액션 →
 * 이 함수)만 지금 확립해둔다. 실제 로컬 상태 반영은 taskStore.updateTask가 한다.
 */
export function updateTask(_id: string, _patch: Partial<Task>): void {
  // TODO: Supabase 연동 후 실제 저장 호출로 교체
}

/**
 * task를 새로 만든다. updateTask와 같은 이유로 지금은 호출 경로만 확립해둔다.
 */
export function addTask(_task: Task): void {
  // TODO: Supabase 연동 후 실제 저장 호출로 교체
}
