import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recommendDailyPlan } from '@/services/ai/recommend-daily-plan'
import { resolveTodoColor } from '@/utils/todo-color'
import { useTodoStore } from './todos'
import { useScheduleStore } from './schedule'
import { useGoalStore } from './goals'

export const useAiPlanningStore = defineStore('aiPlanning', () => {
  const status = ref('idle') // idle | loading | proposed | error
  const draftRecommendations = ref([])
  const summary = ref('')
  const error = ref(null)

  async function requestRecommendation(dateISO) {
    status.value = 'loading'
    error.value = null
    try {
      const todoStore = useTodoStore()
      const scheduleStore = useScheduleStore()
      const goalStore = useGoalStore()
      const alreadyScheduledIds = new Set(scheduleStore.list(dateISO).map((s) => s.todoId))
      const todos = todoStore
        .list(dateISO)
        .filter((t) => !t.done && !alreadyScheduledIds.has(t.id))
        .map((t) => ({ ...t, color: resolveTodoColor(t, goalStore.weeklyGoals) }))

      const result = await recommendDailyPlan({
        dateISO,
        todos,
        existingSchedules: scheduleStore.list(dateISO),
      })

      draftRecommendations.value = result.recommendations
      summary.value = result.summary
      status.value = 'proposed'
    } catch (e) {
      error.value = e
      status.value = 'error'
    }
  }

  function excludeDraft(todoId) {
    draftRecommendations.value = draftRecommendations.value.filter((r) => r.todoId !== todoId)
  }

  function applyAll(dateISO) {
    const scheduleStore = useScheduleStore()
    scheduleStore.applyRecommendations(dateISO, draftRecommendations.value)
    reset()
  }

  function reset() {
    status.value = 'idle'
    draftRecommendations.value = []
    summary.value = ''
    error.value = null
  }

  return { status, draftRecommendations, summary, error, requestRecommendation, excludeDraft, applyAll, reset }
})
