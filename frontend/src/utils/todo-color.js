import { CATEGORY_KEYWORDS } from '@/constants/category'

// 할일에 실제로 적용될 색을 계산한다 — 목표 태그가 카테고리 태그보다 우선한다
// (목표의 색 자체가 그 목표가 속한 카테고리에서 상속된 것이라, 목표 태그가 곧 더 구체적인 카테고리 태그다).
export function resolveTodoColor(todo, weeklyGoals) {
  const goal = todo.goalId ? weeklyGoals.find((g) => g.id === todo.goalId) : null
  return goal?.color ?? todo.categoryColor ?? null
}

// 할일 제목에서 카테고리를 자동 추론한다 — 활성 카테고리 이름이 제목에 포함되거나,
// 그 색상 슬롯의 대표 키워드가 포함되면 매칭된 것으로 본다.
export function inferCategoryColor(title, activeCategories) {
  const normalized = title.trim().toLowerCase()
  if (!normalized) return null

  for (const category of activeCategories) {
    const name = category.name.trim().toLowerCase()
    if (name && normalized.includes(name)) return category.color

    const keywords = CATEGORY_KEYWORDS[category.color] ?? []
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) return category.color
  }

  return null
}
