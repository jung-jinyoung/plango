// docs/seed-data.json(시드 픽스처)을 읽어 타입이 붙은 컬렉션으로 내준다.
// taskRepository.ts(features/task/lib)와 같은 패턴 — 이쪽은 카테고리·목표만 담당.

import seedData from '../../../../docs/seed-data.json'
import type { Category, MonthlyGoal, WeeklyGoal } from '../../../entities/types'

interface SeedData {
  categories: Category[]
  monthlyGoals: MonthlyGoal[]
  weeklyGoals: WeeklyGoal[]
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
