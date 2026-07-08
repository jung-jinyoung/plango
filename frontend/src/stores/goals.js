import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTodoStore } from './todos'
import { getTodayISO } from '@/utils/date'

// 월간-주간 목표는 이제 실제로 만들고 수정·삭제할 수 있다.
// 진행률(progress/taskCount/doneCount)은 저장하지 않고, 태그된 할 일로부터 매번 계산한다 —
// 그래야 할 일을 체크하거나 목표에 태그할 때마다 카드가 실시간으로 반영된다.
export const useGoalStore = defineStore('goals', () => {
  const rawMonthlyGoals = ref([
    { id: 'g-month-1', title: '브랜드 캠페인 런칭', color: 'rose' },
    { id: 'g-month-2', title: '사이드 프로젝트 MVP 완성', color: 'blue' },
  ])

  const rawWeeklyGoals = ref([
    { id: 'g-week-1', title: '캠페인 콘텐츠 3종 제작', color: 'rose', monthlyGoalId: 'g-month-1' },
    { id: 'g-week-2', title: 'MVP 로그인 플로우 구현', color: 'blue', monthlyGoalId: 'g-month-2' },
  ])

  function allTodos() {
    const todoStore = useTodoStore()
    // 오늘 날짜는 방문 페이지 순서와 무관하게 항상 시드되어 있어야 진행률 계산이 안정적이다
    todoStore.list(getTodayISO())
    return Object.values(todoStore.todosByDate).flat()
  }

  function progressOf(taskCount, doneCount) {
    return taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100)
  }

  const weeklyGoals = computed(() =>
    rawWeeklyGoals.value.map((goal) => {
      const tagged = allTodos().filter((t) => t.goalId === goal.id)
      const taskCount = tagged.length
      const doneCount = tagged.filter((t) => t.done).length
      return { ...goal, taskCount, doneCount, progress: progressOf(taskCount, doneCount) }
    }),
  )

  const monthlyGoals = computed(() =>
    rawMonthlyGoals.value.map((goal) => {
      const children = weeklyGoals.value.filter((w) => w.monthlyGoalId === goal.id)
      const taskCount = children.reduce((sum, w) => sum + w.taskCount, 0)
      const doneCount = children.reduce((sum, w) => sum + w.doneCount, 0)
      return { ...goal, taskCount, doneCount, progress: progressOf(taskCount, doneCount) }
    }),
  )

  function addMonthlyGoal({ title, color = 'rose' }) {
    const goal = { id: crypto.randomUUID(), title, color }
    rawMonthlyGoals.value.push(goal)
    return goal
  }
  function updateMonthlyGoal(id, { title, color }) {
    const goal = rawMonthlyGoals.value.find((g) => g.id === id)
    if (goal) Object.assign(goal, { title, color })
  }
  function removeMonthlyGoal(id) {
    rawMonthlyGoals.value = rawMonthlyGoals.value.filter((g) => g.id !== id)
    rawWeeklyGoals.value.forEach((w) => {
      if (w.monthlyGoalId === id) w.monthlyGoalId = null
    })
  }

  function addWeeklyGoal({ title, color = 'rose', monthlyGoalId = null }) {
    const goal = { id: crypto.randomUUID(), title, color, monthlyGoalId }
    rawWeeklyGoals.value.push(goal)
    return goal
  }
  function updateWeeklyGoal(id, { title, color, monthlyGoalId }) {
    const goal = rawWeeklyGoals.value.find((g) => g.id === id)
    if (goal) Object.assign(goal, { title, color, monthlyGoalId })
  }
  function removeWeeklyGoal(id) {
    rawWeeklyGoals.value = rawWeeklyGoals.value.filter((g) => g.id !== id)
    const todoStore = useTodoStore()
    Object.values(todoStore.todosByDate).forEach((list) => {
      list.forEach((t) => {
        if (t.goalId === id) t.goalId = null
      })
    })
  }

  return {
    monthlyGoals,
    weeklyGoals,
    addMonthlyGoal,
    updateMonthlyGoal,
    removeMonthlyGoal,
    addWeeklyGoal,
    updateWeeklyGoal,
    removeWeeklyGoal,
  }
})
