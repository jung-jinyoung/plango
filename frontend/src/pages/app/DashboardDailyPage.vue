<template>
  <div>
    <div class="daily-layout">
      <BaseCard class="todo-panel">
        <div class="panel-head">
          <h2>할 일</h2>
          <span class="count">{{ unplacedTodos.length }}개</span>
        </div>
        <TodoList
          :todos="unplacedTodos"
          @toggle="handleToggleTodo"
          @delete="handleDeleteTodo"
          @tag="handleTagOne"
        />
      </BaseCard>

      <div class="timeline-panel">
        <div class="panel-head">
          <h2>타임라인</h2>
          <button type="button" class="end-day-link" @click="handleEndDay">하루 마감</button>
        </div>
        <DailyTimeline
          :schedules="schedules"
          @toggle-complete="handleToggleComplete"
          @update:note="handleUpdateNote"
          @commit-todo="handleCommitTodo"
          @commit-move="handleCommitMove"
          @conflict="handleConflict"
        />
      </div>
    </div>

    <BaseButton variant="primary" class="fab" @click="showTodoInput = true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      할 일 추가
    </BaseButton>

    <TodoInputModal v-model="showTodoInput" @submit="handleTodoSubmit" />

    <AiRecommendationPanel
      :model-value="showAiPanel"
      :loading="aiPlanning.status === 'loading'"
      :summary="aiPlanning.summary"
      :recommendations="aiPlanning.draftRecommendations"
      @update:model-value="handleAiPanelClose"
      @exclude="aiPlanning.excludeDraft"
      @apply-all="handleApplyAll"
      @adjust-manually="aiPlanning.reset"
    />

    <ScheduleConflictModal
      v-model="showConflictModal"
      :conflict="pendingConflict"
      @auto-resolve="handleAutoResolve"
      @adjust-manually="pendingConflict = null"
    />

    <CarryOverDialog
      v-model="showCarryOver"
      :incomplete-todos="incompleteTodos"
      @toggle="handleToggleTodo"
      @carry-to-tomorrow="handleCarryOverAll"
      @discard="handleDiscardAll"
      @tag-to-goal="handleTagToGoal"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TodoList from '@/components/daily-plan/TodoList.vue'
import DailyTimeline from '@/components/daily-plan/DailyTimeline.vue'
import TodoInputModal from '@/components/daily-plan/TodoInputModal.vue'
import AiRecommendationPanel from '@/components/daily-plan/AiRecommendationPanel.vue'
import ScheduleConflictModal from '@/components/daily-plan/ScheduleConflictModal.vue'
import CarryOverDialog from '@/components/daily-plan/CarryOverDialog.vue'
import { useTodoStore } from '@/stores/todos'
import { useScheduleStore } from '@/stores/schedule'
import { useAiPlanningStore } from '@/stores/ai-planning'
import { useCalendarNavStore } from '@/stores/calendar-nav'

const $q = useQuasar()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()
const aiPlanning = useAiPlanningStore()

const showTodoInput = ref(false)
const showAiPanel = computed(() => aiPlanning.status !== 'idle')
const showConflictModal = ref(false)
const pendingConflict = ref(null) // { pending, existing }
const showCarryOver = ref(false)

const schedules = computed(() => scheduleStore.list(dateISO.value))
const unplacedTodos = computed(() => {
  const scheduledIds = new Set(schedules.value.map((s) => s.todoId))
  return todoStore.list(dateISO.value).filter((t) => !scheduledIds.has(t.id))
})
const incompleteTodos = computed(() => todoStore.list(dateISO.value).filter((t) => !t.done))

function handleToggleTodo(id) {
  todoStore.toggleTodo(dateISO.value, id)
}
function handleDeleteTodo(id) {
  todoStore.removeTodo(dateISO.value, id)
}
function handleToggleComplete(id) {
  scheduleStore.toggleComplete(dateISO.value, id)
  const schedule = schedules.value.find((s) => s.id === id)
  if (schedule?.todoId) todoStore.setDone(dateISO.value, schedule.todoId, schedule.completed)
}
function handleUpdateNote({ id, text }) {
  scheduleStore.setNote(dateISO.value, id, text)
}

function handleTodoSubmit(todos) {
  todos.forEach((t) => todoStore.addTodo(dateISO.value, t))
  aiPlanning.requestRecommendation(dateISO.value)
}

function handleApplyAll() {
  const count = aiPlanning.draftRecommendations.length
  aiPlanning.applyAll(dateISO.value)
  $q.notify({
    message: `일정 ${count}개가 타임라인에 적용되었습니다`,
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
}

function handleAiPanelClose(open) {
  if (!open) aiPlanning.reset()
}

// ---- D3: 드래그로 배치/재배치 ----
function handleCommitTodo({ todoId, title, startMinutes, durationMinutes, categoryColor }) {
  scheduleStore.addSchedule(dateISO.value, { todoId, title, startMinutes, durationMinutes, categoryColor, source: 'manual' })
}
function handleCommitMove({ scheduleId, startMinutes }) {
  scheduleStore.moveSchedule(dateISO.value, scheduleId, startMinutes)
}

// ---- D6: 일정 충돌 알림 ----
function handleConflict({ pending, existing }) {
  pendingConflict.value = { pending, existing }
  showConflictModal.value = true
}
function handleAutoResolve() {
  const { pending } = pendingConflict.value
  const excludeId = pending.kind === 'move' ? pending.scheduleId : null
  const freeStart = scheduleStore.nextFreeStart(
    dateISO.value,
    { startMinutes: pending.startMinutes, durationMinutes: pending.durationMinutes },
    excludeId,
  )
  if (pending.kind === 'todo') {
    scheduleStore.addSchedule(dateISO.value, {
      todoId: pending.todoId,
      title: pending.title,
      startMinutes: freeStart,
      durationMinutes: pending.durationMinutes,
      categoryColor: pending.categoryColor,
      source: 'manual',
    })
  } else {
    scheduleStore.moveSchedule(dateISO.value, pending.scheduleId, freeStart)
  }
  pendingConflict.value = null
  showConflictModal.value = false
}

// ---- D5: 미완료 이월 처리 ----
function handleEndDay() {
  if (incompleteTodos.value.length === 0) {
    $q.notify({ message: '오늘 하루도 수고하셨어요!', icon: 'check_circle', color: 'positive', position: 'top' })
    return
  }
  showCarryOver.value = true
}
function removeLinkedSchedule(todoId) {
  const schedule = schedules.value.find((s) => s.todoId === todoId)
  if (schedule) scheduleStore.removeSchedule(dateISO.value, schedule.id)
}
function handleCarryOverAll() {
  const ids = incompleteTodos.value.map((t) => t.id)
  ids.forEach((id) => {
    removeLinkedSchedule(id)
    todoStore.carryOverToTomorrow(dateISO.value, id)
  })
  showCarryOver.value = false
  $q.notify({ message: `${ids.length}개를 내일로 이월했습니다`, icon: 'check_circle', color: 'positive', position: 'top' })
}
function handleDiscardAll() {
  const ids = incompleteTodos.value.map((t) => t.id)
  ids.forEach((id) => {
    removeLinkedSchedule(id)
    todoStore.removeTodo(dateISO.value, id)
  })
  showCarryOver.value = false
}
function handleTagOne({ id, goalId }) {
  todoStore.assignGoal(dateISO.value, id, goalId)
  $q.notify({
    message: goalId ? '목표에 태그했습니다' : '태그를 해제했습니다',
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
}
function handleTagToGoal({ todoIds, goalId }) {
  todoIds.forEach((id) => todoStore.assignGoal(dateISO.value, id, goalId))
  showCarryOver.value = false
  $q.notify({
    message: `${todoIds.length}개를 주간 목표에 태그했습니다`,
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
}
</script>

<style scoped>
.daily-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
.todo-panel {
  padding: 20px;
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.panel-head h2,
.timeline-panel h2 {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0;
}
.count {
  font-size: 0.8rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
}
.timeline-panel .panel-head {
  margin-bottom: 12px;
}
.end-day-link {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.85rem;
  font-weight: 600;
}
.fab {
  position: fixed;
  right: 40px;
  bottom: 36px;
  z-index: 30;
}
</style>
