import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Plango는 디자인 시스템상 고정된 8가지 색상 토큰(--p-rose/amber/green/teal/blue/lavender/plum/slate)만 지원한다.
// 그래서 "카테고리 추가/삭제"는 무제한 카테고리 생성이 아니라, 이 8개 색상 슬롯의
// 이름을 바꾸고 활성/비활성(사용 여부)을 토글하는 것으로 구현한다.
export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([
    { color: 'rose', name: '운동', active: true },
    { color: 'amber', name: '업무', active: true },
    { color: 'green', name: '독서', active: true },
    { color: 'teal', name: '공부', active: true },
    { color: 'blue', name: '자기계발', active: true },
    { color: 'lavender', name: '취미', active: true },
    { color: 'plum', name: '건강', active: true },
    { color: 'slate', name: '기타', active: true },
  ])

  const activeCategories = computed(() => categories.value.filter((c) => c.active))
  const hasInactive = computed(() => categories.value.some((c) => !c.active))

  function rename(color, name) {
    const category = categories.value.find((c) => c.color === color)
    if (category) category.name = name
  }

  function setActive(color, active) {
    if (!active && activeCategories.value.length <= 1) return
    const category = categories.value.find((c) => c.color === color)
    if (category) category.active = active
  }

  // 백엔드 카테고리 name은 unique 제약이 있어, 저장 전에 미리 걸러서 500을 방지한다
  function isNameTaken(name, excludeColor = null) {
    const target = name.trim().toLowerCase()
    if (!target) return false
    return activeCategories.value.some(
      (c) => c.color !== excludeColor && c.name.trim().toLowerCase() === target,
    )
  }

  return { categories, activeCategories, hasInactive, rename, setActive, isNameTaken }
})
