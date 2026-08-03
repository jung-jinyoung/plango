// "오늘 마감" 여부 — 하루 단위 개념이라 Task 필드가 아니라 별도 day-level
// 상태로 둔다(드래그 브랜치의 Task.confirmed와 달리, 이건 개별 task가 아니라
// 그날 전체에 대한 사실이라 Task 단위로 두면 어느 task가 대표하는지 애매해진다).
// 지금은 로컬 상태만 — Supabase 연동 시 별도 테이블/컬럼으로 옮긴다(CLAUDE.md 17절).

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReflectionStore = defineStore('reflection', () => {
  const reflectedDates = ref<Set<string>>(new Set())

  function markDayReflected(date: string) {
    reflectedDates.value.add(date)
  }

  function isDayReflected(date: string): boolean {
    return reflectedDates.value.has(date)
  }

  return { reflectedDates, markDayReflected, isDayReflected }
})
