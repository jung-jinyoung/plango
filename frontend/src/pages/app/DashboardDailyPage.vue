<template>
  <div>
    <div class="daily-layout">
      <div class="todo-panel">
        <div class="goal-mini-section" :class="{ 'is-collapsed': !showWeeklyGoals }">
          <div class="panel-head">
            <h2>이번 주 목표</h2>
            <div class="panel-head-right">
              <span class="count">{{ goalStore.weeklyGoals.length }}개</span>
              <button
                type="button"
                class="mini-toggle"
                :class="{ 'is-expanded': showWeeklyGoals }"
                aria-label="이번 주 목표 접기/펼치기"
                @click="showWeeklyGoals = !showWeeklyGoals"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          </div>
          <div class="goal-mini-body-wrap" :class="{ 'is-expanded': showWeeklyGoals }">
            <div class="goal-mini-body-inner">
              <div class="goal-mini-list">
                <button
                  v-for="goal in goalStore.weeklyGoals"
                  :key="goal.id"
                  type="button"
                  class="goal-mini-item"
                  :class="`is-${goal.color}`"
                  @click="goToGoal(goal.id)"
                >
                  <span class="dot" aria-hidden="true" />
                  <span class="title">{{ goal.title }}</span>
                  <span class="count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
                </button>
                <p v-if="goalStore.weeklyGoals.length === 0" class="empty">아직 등록된 주간 목표가 없어요.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-head">
          <h2>할 일</h2>
          <span class="count">{{ unplacedTodos.length }}개</span>
        </div>
        <BaseCard class="todo-list-card">
          <TodoList
            :todos="unplacedTodos"
            @toggle="handleToggleTodo"
            @delete="handleDeleteTodo"
            @tag="handleTagOne"
          />
        </BaseCard>
      </div>

      <div class="timeline-panel">
        <div class="panel-head">
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
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
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
import { useGoalStore } from '@/stores/goals'

const $q = useQuasar()
const router = useRouter()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()
const aiPlanning = useAiPlanningStore()
const goalStore = useGoalStore()

onMounted(() => goalStore.load())

function goToGoal(goalId) {
  router.push({ path: '/app/goals', query: { weekly: goalId } })
}

const showWeeklyGoals = ref(true)
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
  grid-template-columns: 420px 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
.todo-panel {
  width: 100%;
}
.goal-mini-section {
  margin-bottom: 20px;
}
.goal-mini-section.is-collapsed {
  margin-bottom: 0;
}
.panel-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mini-toggle {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: -6px;
  border-radius: 50%;
  transition:
    transform 200ms ease,
    background 120ms ease,
    color 120ms ease;
}
.mini-toggle:hover {
  background: var(--p-surface);
  color: var(--p-ink);
}
.mini-toggle.is-expanded {
  transform: rotate(180deg);
}
.goal-mini-body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms ease;
}
.goal-mini-body-wrap.is-expanded {
  grid-template-rows: 1fr;
}
.goal-mini-body-inner {
  overflow: hidden;
  min-height: 0;
}
@media (prefers-reduced-motion: reduce) {
  .goal-mini-body-wrap {
    transition: none;
  }
}
.goal-mini-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}
.goal-mini-item {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border-radius: var(--p-radius-xs);
  font-family: inherit;
  text-align: left;
  transition: background 120ms ease;
}
.goal-mini-item:hover {
  background: color-mix(in srgb, var(--dot-color, var(--p-rose)) 10%, var(--p-bg));
}
.goal-mini-item:focus-visible {
  outline: 2px solid var(--dot-color, var(--p-rose));
  outline-offset: -2px;
}
.goal-mini-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot-color, var(--p-rose));
  flex-shrink: 0;
}
.goal-mini-item .title {
  flex: 1;
  min-width: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--p-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goal-mini-item.is-rose {
  --dot-color: var(--p-rose);
}
.goal-mini-item.is-amber {
  --dot-color: var(--p-amber);
}
.goal-mini-item.is-green {
  --dot-color: var(--p-green);
}
.goal-mini-item.is-teal {
  --dot-color: var(--p-teal);
}
.goal-mini-item.is-blue {
  --dot-color: var(--p-blue);
}
.goal-mini-item.is-lavender {
  --dot-color: var(--p-lavender);
}
.goal-mini-item.is-plum {
  --dot-color: var(--p-plum);
}
.goal-mini-item.is-slate {
  --dot-color: var(--p-slate);
}
.goal-mini-list .empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
  padding: 4px;
  margin: 0;
}
.todo-list-card {
  padding: 12px 20px;
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.panel-head h2 {
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
  justify-content: flex-end;
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
