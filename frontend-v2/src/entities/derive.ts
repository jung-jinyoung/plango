// 파생 함수 — 저장하지 않는다 (CLAUDE.md 4절)

import type { Category, CategoryColor } from './types'

/** Dot/Chip 등에 색을 넘길 때 이 함수를 거친다 — 컴포넌트마다 `?? 'gray'`를 반복하지 않는다 */
export function categoryColorOf(category: Category | null): CategoryColor {
  return category?.color ?? 'gray'
}
