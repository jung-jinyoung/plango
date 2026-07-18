<template>
  <div>
    <div class="daily-layout">
      <div class="todo-panel">
        <div class="tag-accordion" :class="{ 'is-collapsed': !showTagAccordion }">
          <div class="panel-head">
            <h2>태그</h2>
            <button
              type="button"
              class="mini-toggle"
              :class="{ 'is-expanded': showTagAccordion }"
              aria-label="태그 접기/펼치기"
              @click="showTagAccordion = !showTagAccordion"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
          <div class="tag-body-wrap" :class="{ 'is-expanded': showTagAccordion }">
            <div class="tag-body-inner">
              <div class="tag-group">
                <div class="tag-group-head">
                  <span class="tag-group-label">이번 주 목표</span>
                  <span class="count">{{ goalStore.weeklyGoals.length }}개</span>
                </div>
                <div class="tag-chip-row">
                  <button
                    v-for="(goal, idx) in goalStore.weeklyGoals"
                    :key="goal.id"
                    type="button"
                    class="tag-pill"
                    :class="`is-${goal.color}`"
                    @click="goToGoal(goal.id)"
                  >
                    <span class="index" aria-hidden="true">{{ idx + 1 }}</span>
                    <span class="dot" aria-hidden="true" />
                    <span class="title">{{ goal.title }}</span>
                    <span class="count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
                  </button>
                  <p v-if="goalStore.weeklyGoals.length === 0" class="empty">아직 등록된 주간 목표가 없어요.</p>
                </div>
              </div>

              <div class="tag-group">
                <div class="tag-group-head">
                  <span class="tag-group-label">카테고리</span>
                  <span class="count">{{ categoryStore.activeCategories.length }}개</span>
                </div>
                <div class="tag-chip-row">
                  <span
                    v-for="c in categoryStore.activeCategories"
                    :key="c.color"
                    class="tag-pill is-static"
                    :class="`is-${c.color}`"
                  >
                    <span class="dot" aria-hidden="true" />
                    <span class="title">{{ c.name }}</span>
                  </span>
                </div>
              </div>

              <p class="tag-hint">이번 주 목표는 번호로, 카테고리는 이름으로 할 일 입력창에서 바로 태그할 수 있어요.</p>
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
            @tag-category="handleCategoryTagOne"
            @update="handleUpdateTodo"
          />
        </BaseCard>

        <TodoComposer @add-todo="handleAddTodo" @parse-warning="handleComposerWarning" />
      </div>

      <div class="timeline-panel">
        <div class="panel-head">
          <button type="button" class="end-day-link" @click="handleEndDay">하루 마감</button>
        </div>
        <DailyTimeline
          :schedules="schedules"
          :is-today="isToday"
          @toggle-complete="handleToggleComplete"
          @update:note="handleUpdateNote"
          @tag="handleScheduleTag"
          @delete="handleScheduleDelete"
          @move-to-list="handleScheduleMoveToList"
          @commit-todo="handleCommitTodo"
          @commit-move="handleCommitMove"
          @commit-resize="handleCommitResize"
          @conflict="handleConflict"
        />
      </div>
    </div>

    <button
      type="button"
      class="ai-fab"
      :disabled="unplacedTodos.length === 0"
      title="미배치 할 일을 AI가 시간표에 배치해줘요"
      @click="handleRequestAi"
    >
      <span class="ai-fab-shine" aria-hidden="true" />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
      AI로 배치
    </button>

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
import BaseCard from '@/components/ui/BaseCard.vue'
import TodoList from '@/components/daily-plan/TodoList.vue'
import DailyTimeline from '@/components/daily-plan/DailyTimeline.vue'
import TodoComposer from '@/components/daily-plan/TodoComposer.vue'
import AiRecommendationPanel from '@/components/daily-plan/AiRecommendationPanel.vue'
import ScheduleConflictModal from '@/components/daily-plan/ScheduleConflictModal.vue'
import CarryOverDialog from '@/components/daily-plan/CarryOverDialog.vue'
import { useTodoStore } from '@/stores/todos'
import { useScheduleStore } from '@/stores/schedule'
import { useAiPlanningStore } from '@/stores/ai-planning'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'
import { getTodayISO } from '@/utils/date'

const $q = useQuasar()
const router = useRouter()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)
const isToday = computed(() => dateISO.value === getTodayISO())

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()
const aiPlanning = useAiPlanningStore()
const goalStore = useGoalStore()
const categoryStore = useCategoryStore()

onMounted(() => goalStore.load())

function goToGoal(goalId) {
  router.push({ path: '/app/goals', query: { weekly: goalId } })
}

const showTagAccordion = ref(true)
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
function handleUpdateTodo({ id, title, estimatedMinutes }) {
  todoStore.updateTodo(dateISO.value, id, { title, estimatedMinutes })
}
function handleToggleComplete(id) {
  scheduleStore.toggleComplete(dateISO.value, id)
  const schedule = schedules.value.find((s) => s.id === id)
  if (schedule?.todoId) todoStore.setDone(dateISO.value, schedule.todoId, schedule.completed)
}
function handleUpdateNote({ id, text }) {
  scheduleStore.setNote(dateISO.value, id, text)
}

function handleAddTodo(todo) {
  todoStore.addTodo(dateISO.value, todo)
}

function handleComposerWarning(message) {
  $q.notify({ message, icon: 'warning', color: 'warning', position: 'top' })
}

function handleRequestAi() {
  if (unplacedTodos.value.length === 0) {
    $q.notify({ message: '배치할 할 일이 없어요', icon: 'warning', color: 'warning', position: 'top' })
    return
  }
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
function handleCommitTodo({ todoId, title, startMinutes, durationMinutes, categoryColor, goalId }) {
  scheduleStore.addSchedule(dateISO.value, {
    todoId,
    title,
    startMinutes,
    durationMinutes,
    categoryColor,
    goalId,
    source: 'manual',
  })
}
function handleCommitMove({ scheduleId, startMinutes }) {
  scheduleStore.moveSchedule(dateISO.value, scheduleId, startMinutes)
}
function handleCommitResize({ scheduleId, startMinutes, durationMinutes }) {
  scheduleStore.resizeSchedule(dateISO.value, scheduleId, startMinutes, durationMinutes)
}

// ---- 타임라인 카드에서 직접 태그/삭제/할 일 리스트로 이동 ----
function handleScheduleTag({ id, goalId }) {
  const schedule = schedules.value.find((s) => s.id === id)
  if (!schedule) return
  const color = goalId ? (goalStore.weeklyGoals.find((g) => g.id === goalId)?.color ?? null) : null
  scheduleStore.setTag(dateISO.value, id, goalId, color)
  if (schedule.todoId) todoStore.assignGoal(dateISO.value, schedule.todoId, goalId)
  $q.notify({
    message: goalId ? '목표에 태그했습니다' : '태그를 해제했습니다',
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
}
function handleScheduleDelete(id) {
  const schedule = schedules.value.find((s) => s.id === id)
  if (!schedule) return
  scheduleStore.removeSchedule(dateISO.value, id)
  if (schedule.todoId) todoStore.removeTodo(dateISO.value, schedule.todoId)
}
function handleScheduleMoveToList(id) {
  scheduleStore.removeSchedule(dateISO.value, id)
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
      goalId: pending.goalId,
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
function handleCategoryTagOne({ id, categoryColor }) {
  todoStore.assignCategory(dateISO.value, id, categoryColor)
  $q.notify({
    message: categoryColor ? '카테고리에 태그했습니다' : '태그를 해제했습니다',
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
  grid-template-columns: 560px 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
.todo-panel {
  width: 100%;
}
.tag-accordion {
  margin-bottom: 20px;
}
.tag-accordion.is-collapsed {
  margin-bottom: 0;
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
.tag-body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms ease;
}
.tag-body-wrap.is-expanded {
  grid-template-rows: 1fr;
}
.tag-body-inner {
  overflow: hidden;
  min-height: 0;
}
@media (prefers-reduced-motion: reduce) {
  .tag-body-wrap {
    transition: none;
  }
}
.tag-group {
  margin-top: 10px;
}
.tag-group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}
.tag-group-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--p-ink-faint);
}
.tag-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-pill {
  appearance: none;
  border: none;
  cursor: pointer;
  background: color-mix(in srgb, var(--dot-color, var(--p-rose)) 10%, var(--p-bg));
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-ink);
  max-width: 220px;
  transition: background 120ms ease;
}
.tag-pill:hover {
  background: color-mix(in srgb, var(--dot-color, var(--p-rose)) 18%, var(--p-bg));
}
.tag-pill:focus-visible {
  outline: 2px solid var(--dot-color, var(--p-rose));
  outline-offset: -2px;
}
.tag-pill.is-static {
  cursor: default;
}
.tag-pill .index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--p-bg);
  color: var(--p-ink-faint);
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.tag-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot-color, var(--p-rose));
  flex-shrink: 0;
}
.tag-pill .title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tag-pill .count {
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.tag-pill.is-rose {
  --dot-color: var(--p-rose);
}
.tag-pill.is-amber {
  --dot-color: var(--p-amber);
}
.tag-pill.is-green {
  --dot-color: var(--p-green);
}
.tag-pill.is-teal {
  --dot-color: var(--p-teal);
}
.tag-pill.is-blue {
  --dot-color: var(--p-blue);
}
.tag-pill.is-lavender {
  --dot-color: var(--p-lavender);
}
.tag-pill.is-plum {
  --dot-color: var(--p-plum);
}
.tag-pill.is-slate {
  --dot-color: var(--p-slate);
}
.tag-chip-row .empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
  padding: 4px;
  margin: 0;
}
.tag-hint {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  margin: 12px 0 0;
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
.ai-fab {
  position: fixed;
  right: 40px;
  bottom: 36px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  appearance: none;
  border: none;
  cursor: pointer;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  color: #fff;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  box-shadow: 0 6px 20px color-mix(in srgb, var(--p-lavender) 45%, transparent);
  animation: ai-fab-pulse 2.4s ease-in-out infinite;
}
.ai-fab:disabled {
  cursor: default;
  opacity: 0.45;
  animation: none;
  box-shadow: none;
}
.ai-fab-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.65) 48%, transparent 66%);
  transform: translateX(-130%);
  animation: ai-fab-shine 2.8s ease-in-out infinite;
}
.ai-fab:disabled .ai-fab-shine {
  animation: none;
  display: none;
}
@keyframes ai-fab-pulse {
  0%,
  100% {
    box-shadow: 0 6px 20px color-mix(in srgb, var(--p-lavender) 45%, transparent);
  }
  50% {
    box-shadow: 0 6px 30px color-mix(in srgb, var(--p-lavender) 75%, transparent);
  }
}
@keyframes ai-fab-shine {
  0% {
    transform: translateX(-130%);
  }
  55%,
  100% {
    transform: translateX(130%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ai-fab,
  .ai-fab-shine {
    animation: none;
  }
}
</style>
