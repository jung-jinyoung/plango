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
