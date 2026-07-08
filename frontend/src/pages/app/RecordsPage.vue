<template>
  <div class="records-layout">
    <BaseCard class="column">
      <div class="column-head">
        <h2>계획</h2>
        <span class="count">{{ todos.length }}개</span>
      </div>
      <div class="column-body">
        <div
          v-for="todo in todos"
          :key="todo.id"
          class="record-item"
          @click="handleItemClick($event, goToDaily)"
        >
          <RecordTodoRow :todo="todo" @toggle="handleToggleTodo" @assign-goal="handleAssignGoal" />
        </div>
        <p v-if="todos.length === 0" class="empty">오늘 계획된 할 일이 없어요.</p>
      </div>
    </BaseCard>

    <BaseCard class="column">
      <div class="column-head">
        <h2>기록</h2>
        <span class="count">{{ schedules.length }}개</span>
      </div>
      <div class="column-body">
        <div
          v-for="schedule in schedules"
          :key="schedule.id"
          class="record-item"
          @click="handleItemClick($event, goToDaily)"
        >
          <ScheduleCard :schedule="schedule" :draggable="false" compact @toggle-complete="handleToggleComplete" />
        </div>
        <p v-if="schedules.length === 0" class="empty">오늘 기록된 일정이 없어요.</p>
      </div>
    </BaseCard>

    <BaseCard class="column">
      <div class="column-head">
        <h2>회고</h2>
        <button type="button" class="detail-link" @click="goToRetrospective">자세히 보기</button>
      </div>
      <ReflectionInput :dateISO="dateISO" />
    </BaseCard>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import RecordTodoRow from '@/components/retrospective/RecordTodoRow.vue'
import ReflectionInput from '@/components/retrospective/ReflectionInput.vue'
import { useTodoStore } from '@/stores/todos'
import { useScheduleStore } from '@/stores/schedule'
import { useCalendarNavStore } from '@/stores/calendar-nav'

const router = useRouter()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()

const todos = computed(() => todoStore.list(dateISO.value))
const schedules = computed(() => scheduleStore.list(dateISO.value))

function handleToggleTodo(id) {
  todoStore.toggleTodo(dateISO.value, id)
}
function handleAssignGoal({ todoId, goalId }) {
  todoStore.assignGoal(dateISO.value, todoId, goalId)
}
function handleToggleComplete(id) {
  scheduleStore.toggleComplete(dateISO.value, id)
  const schedule = schedules.value.find((s) => s.id === id)
  if (schedule?.todoId) todoStore.setDone(dateISO.value, schedule.todoId, schedule.completed)
}

// 체크박스/셀렉트 등 인터랙션 요소 클릭 시에는 상세 화면 이동을 막는다 (D4는 B3 Timeline 내 내장 상태)
function handleItemClick(e, navigate) {
  const interactiveTags = ['INPUT', 'SELECT', 'OPTION', 'BUTTON', 'TEXTAREA', 'LABEL']
  if (interactiveTags.includes(e.target.tagName)) return
  navigate()
}
function goToDaily() {
  router.push('/app/dashboard/daily')
}
function goToRetrospective() {
  router.push('/app/retrospective/weekly')
}
</script>

<style scoped>
.records-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
.column {
  padding: 20px;
  min-width: 0;
}
.column-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.column-head h2 {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0;
}
.count {
  font-size: 0.8rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
}
.detail-link {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.85rem;
  font-weight: 600;
}
.column-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.record-item {
  cursor: pointer;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  padding: 16px 4px;
  line-height: 1.7;
}
</style>
