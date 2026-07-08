import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Plango는 디자인 시스템상 고정된 4가지 색상 토큰(--p-rose/blue/green/lavender)만 지원한다.
// 그래서 "카테고리 추가/삭제"는 무제한 카테고리 생성이 아니라, 이 4개 색상 슬롯의
// 이름을 바꾸고 활성/비활성(사용 여부)을 토글하는 것으로 구현한다.
export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([
    { color: 'rose', name: '로즈', active: true },
    { color: 'blue', name: '블루', active: true },
    { color: 'green', name: '그린', active: true },
    { color: 'lavender', name: '라벤더', active: true },
  ])

  const activeCategories = computed(() => categories.value.filter((c) => c.active))

  function rename(color, name) {
    const category = categories.value.find((c) => c.color === color)
    if (category) category.name = name
  }

  function setActive(color, active) {
    if (!active && activeCategories.value.length <= 1) return
    const category = categories.value.find((c) => c.color === color)
    if (category) category.active = active
  }

  return { categories, activeCategories, rename, setActive }
})
