import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTodayISO, addDaysISO } from '@/utils/date'
import { seedTodosForToday } from '@/services/mock/seed-data'

export const useTodoStore = defineStore('todos', () => {
  const todosByDate = ref({}) // { [dateISO]: Todo[] }

  function ensureDate(dateISO) {
    if (todosByDate.value[dateISO]) return
    const seed = dateISO === getTodayISO() ? seedTodosForToday() : []
    todosByDate.value[dateISO] = seed.map((t) => ({
      id: crypto.randomUUID(),
      done: false,
      goalId: null,
      categoryColor: null,
      ...t,
    }))
  }

  function list(dateISO) {
    ensureDate(dateISO)
    return todosByDate.value[dateISO]
  }

  function addTodo(
    dateISO,
    { title, estimatedMinutes = null, deadlineMinutes = null, goalId = null, categoryColor = null },
  ) {
    ensureDate(dateISO)
    const todo = {
      id: crypto.randomUUID(),
      title,
      estimatedMinutes,
      deadlineMinutes,
      done: false,
      goalId,
      categoryColor,
    }
    todosByDate.value[dateISO].push(todo)
    return todo
  }

  function removeTodo(dateISO, id) {
    ensureDate(dateISO)
    todosByDate.value[dateISO] = todosByDate.value[dateISO].filter((t) => t.id !== id)
  }

  function toggleTodo(dateISO, id) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (todo) todo.done = !todo.done
  }

  // ScheduleCard의 완료 체크와 Todo의 완료 상태를 동기화하기 위한 명시적 setter
  function setDone(dateISO, id, value) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (todo) todo.done = value
  }

  // 제목/예상 소요시간 등 할 일 내용 수정
  function updateTodo(dateISO, id, patch) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (todo) Object.assign(todo, patch)
  }

  // 할 일을 주간 목표에 태그(또는 태그 해제, goalId=null)한다
  function assignGoal(dateISO, id, goalId) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (todo) todo.goalId = goalId
  }

  // 할 일을 카테고리에 태그(또는 태그 해제, categoryColor=null)한다.
  // goalId는 건드리지 않는다 — 목표 태그가 있으면 표시/색상은 resolveTodoColor에서 항상 목표를 우선한다.
  function assignCategory(dateISO, id, categoryColor) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (todo) todo.categoryColor = categoryColor
  }

  // D5 미완료 이월: 오늘 항목을 내일 날짜로 옮기고, 오늘 마감이었던 시간 정보는 초기화한다
  function carryOverToTomorrow(dateISO, id) {
    const todo = list(dateISO).find((t) => t.id === id)
    if (!todo) return
    removeTodo(dateISO, id)
    const tomorrow = addDaysISO(dateISO, 1)
    ensureDate(tomorrow)
    todosByDate.value[tomorrow].push({
      ...todo,
      id: crypto.randomUUID(),
      deadlineMinutes: null,
    })
  }

  return {
    todosByDate,
    list,
    addTodo,
    removeTodo,
    toggleTodo,
    setDone,
    updateTodo,
    assignGoal,
    assignCategory,
    carryOverToTomorrow,
  }
})
