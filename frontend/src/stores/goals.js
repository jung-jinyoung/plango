import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTodoStore } from './todos'
import { useCategoryStore } from './categories'
import { getTodayISO } from '@/utils/date'
import * as categoriesApi from '@/services/api/categories'
import * as monthlyGoalsApi from '@/services/api/monthly-goals'
import * as weeklyGoalsApi from '@/services/api/weekly-goals'

// 월간/주간 목표는 실제 백엔드(FastAPI)와 통신한다. 진행률(progress/taskCount/doneCount)은
// 서버에 저장하지 않고, 태그된 할 일로부터 매번 계산한다 — 그래야 할 일을 체크하거나
// 목표에 태그할 때마다 카드가 실시간으로 반영된다.
//
// 백엔드의 월간 목표는 category_id(FK, 필수)를 갖고, 주간 목표는 카테고리를 직접 갖지
// 않고 부모 월간 목표에서 상속한다. 프론트는 색상을 slot 이름("rose" 등)으로 다루므로,
// 이 스토어가 슬롯 색상 ↔ 백엔드 category id를 서로 변환하는 다리 역할을 한다
// (카테고리 이름은 categories 스토어의 8개 고정 슬롯 이름을 그대로 시드한다).
export const useGoalStore = defineStore('goals', () => {
  const rawMonthlyGoals = ref([]) // { id, title, categoryId }
  const rawWeeklyGoals = ref([]) // { id, title, monthlyGoalId, categoryId }
  const categoryIdByColor = ref({})
  const colorByCategoryId = ref({})

  const loading = ref(false)
  const error = ref(null)
  let loaded = false
  let loadPromise = null

  function colorOf(categoryId) {
    return colorByCategoryId.value[categoryId] ?? 'slate'
  }

  async function ensureCategoryId(color) {
    if (categoryIdByColor.value[color]) return categoryIdByColor.value[color]
    const categoryStore = useCategoryStore()
    const local = categoryStore.categories.find((c) => c.color === color)
    const name = (local?.name ?? '').trim() || color
    const created = await categoriesApi.createCategory({ name, color })
    categoryIdByColor.value = { ...categoryIdByColor.value, [color]: created.id }
    colorByCategoryId.value = { ...colorByCategoryId.value, [created.id]: color }
    return created.id
  }

  async function load() {
    if (loaded) return
    if (loadPromise) return loadPromise
    loading.value = true
    error.value = null
    loadPromise = (async () => {
      try {
        const [categories, monthly, weekly] = await Promise.all([
          categoriesApi.listCategories(),
          monthlyGoalsApi.listMonthlyGoals(),
          weeklyGoalsApi.listWeeklyGoals(),
        ])
        const byColor = {}
        const byId = {}
        for (const c of categories) {
          byColor[c.color] = c.id
          byId[c.id] = c.color
        }
        categoryIdByColor.value = byColor
        colorByCategoryId.value = byId
        rawMonthlyGoals.value = monthly
        rawWeeklyGoals.value = weekly
        loaded = true
      } catch (e) {
        error.value = e
      } finally {
        loading.value = false
        loadPromise = null
      }
    })()
    return loadPromise
  }

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
      return {
        ...goal,
        color: colorOf(goal.categoryId),
        taskCount,
        doneCount,
        progress: progressOf(taskCount, doneCount),
      }
    }),
  )

  const monthlyGoals = computed(() =>
    rawMonthlyGoals.value
      .map((goal) => {
        const children = weeklyGoals.value.filter((w) => w.monthlyGoalId === goal.id)
        const taskCount = children.reduce((sum, w) => sum + w.taskCount, 0)
        const doneCount = children.reduce((sum, w) => sum + w.doneCount, 0)
        return {
          ...goal,
          color: colorOf(goal.categoryId),
          taskCount,
          doneCount,
          progress: progressOf(taskCount, doneCount),
        }
      })
      // 달성률(progress) 내림차순 — 가장 진척된 목표가 먼저 보이도록
      .sort((a, b) => b.progress - a.progress),
  )

  async function addMonthlyGoal({ title, color = 'rose' }) {
    const categoryId = await ensureCategoryId(color)
    const goal = await monthlyGoalsApi.createMonthlyGoal({ title, categoryId })
    rawMonthlyGoals.value.push(goal)
    return goal
  }

  async function updateMonthlyGoal(id, { title, color }) {
    const categoryId = color ? await ensureCategoryId(color) : undefined
    const updated = await monthlyGoalsApi.updateMonthlyGoal(id, { title, categoryId })
    const idx = rawMonthlyGoals.value.findIndex((g) => g.id === id)
    if (idx !== -1) rawMonthlyGoals.value[idx] = updated
    // 백엔드는 주간 목표가 부모의 카테고리를 상속하도록 계산해서 응답하지만, 그 응답은
    // 이 PATCH 호출엔 포함되지 않으므로 로컬 캐시도 같은 규칙으로 직접 맞춰준다
    if (categoryId !== undefined) {
      rawWeeklyGoals.value.forEach((w) => {
        if (w.monthlyGoalId === id) w.categoryId = categoryId
      })
    }
  }

  async function removeMonthlyGoal(id) {
    await monthlyGoalsApi.deleteMonthlyGoal(id)
    rawMonthlyGoals.value = rawMonthlyGoals.value.filter((g) => g.id !== id)
    // 백엔드가 ON DELETE SET NULL로 자식 주간 목표의 monthly_goal_id/category_id를 null 처리한다
    rawWeeklyGoals.value.forEach((w) => {
      if (w.monthlyGoalId === id) {
        w.monthlyGoalId = null
        w.categoryId = null
      }
    })
  }

  async function addWeeklyGoal({ title, monthlyGoalId = null }) {
    const goal = await weeklyGoalsApi.createWeeklyGoal({ title, monthlyGoalId })
    rawWeeklyGoals.value.push(goal)
    return goal
  }

  async function updateWeeklyGoal(id, { title, monthlyGoalId }) {
    const updated = await weeklyGoalsApi.updateWeeklyGoal(id, { title, monthlyGoalId })
    const idx = rawWeeklyGoals.value.findIndex((g) => g.id === id)
    if (idx !== -1) rawWeeklyGoals.value[idx] = updated
  }

  async function removeWeeklyGoal(id) {
    await weeklyGoalsApi.deleteWeeklyGoal(id)
    rawWeeklyGoals.value = rawWeeklyGoals.value.filter((g) => g.id !== id)
    const todoStore = useTodoStore()
    Object.values(todoStore.todosByDate).forEach((list) => {
      list.forEach((t) => {
        if (t.goalId === id) t.goalId = null
      })
    })
  }

  return {
    loading,
    error,
    load,
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
