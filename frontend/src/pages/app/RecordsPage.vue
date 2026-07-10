<template>
  <div class="records-layout">
    <BaseCard class="column-retro">
      <div class="retro-suggest">
        <span class="ai-badge">AI</span>
        <p class="suggest-text">{{ aiSuggestionLoading ? '오늘 하루를 돌아보는 중이에요...' : aiSuggestion }}</p>
      </div>
      <BaseButton variant="primary" @click="showReflectionModal = true">
        {{ hasReflection ? '회고 수정하기' : '회고 등록하기' }}
      </BaseButton>
    </BaseCard>

    <div class="top-row">
      <BaseCard class="column">
        <div class="column-head">
          <h2>계획</h2>
        </div>
        <textarea
          v-model="dailyIntentDraft"
          class="intent-input neu-sunken"
          rows="6"
          placeholder="오늘 하루의 계획이나 목표를 간단히 적어보세요"
        />
        <BaseButton variant="secondary" size="sm" class="intent-save-btn" @click="saveDailyIntent">
          {{ hasDailyIntent ? '계획 수정하기' : '계획 설정하기' }}
        </BaseButton>
      </BaseCard>

      <BaseCard class="column">
        <div class="column-head">
          <h2>일정</h2>
          <span class="count"><strong>{{ doneCount }}</strong>/{{ schedules.length }} 완료</span>
        </div>
        <div class="column-body">
          <div
            v-for="schedule in schedules"
            :key="schedule.id"
            class="record-item"
            @click="handleItemClick($event, goToDaily)"
          >
            <ScheduleCard :schedule="schedule" :draggable="false" compact @toggle-complete="handleToggleComplete" />
            <select
              v-if="schedule.todoId"
              class="goal-select neu-sunken"
              :value="todoGoalId(schedule.todoId) || ''"
              @change="handleAssignGoal({ todoId: schedule.todoId, goalId: $event.target.value || null })"
            >
              <option value="">목표 미태그</option>
              <option v-for="goal in goalStore.weeklyGoals" :key="goal.id" :value="goal.id">{{ goal.title }}</option>
            </select>
          </div>
          <p v-if="schedules.length === 0" class="empty empty-link" @click="goToDaily">
            오늘 기록된 일정이 없어요. 대시보드에서 계획을 세워보세요 →
          </p>
        </div>
      </BaseCard>
    </div>

    <ReflectionModal v-model="showReflectionModal" :dateISO="dateISO" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import ReflectionModal from '@/components/retrospective/ReflectionModal.vue'
import { useTodoStore } from '@/stores/todos'
import { useScheduleStore } from '@/stores/schedule'
import { useGoalStore } from '@/stores/goals'
import { useRetrospectiveStore } from '@/stores/retrospective'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { suggestReflectionPrompt } from '@/services/ai/suggest-reflection-prompt'

const router = useRouter()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()
const goalStore = useGoalStore()
const retrospectiveStore = useRetrospectiveStore()

const todos = computed(() => todoStore.list(dateISO.value))
const schedules = computed(() =>
  [...scheduleStore.list(dateISO.value)].sort((a, b) => a.startMinutes - b.startMinutes),
)
const doneCount = computed(() => schedules.value.filter((s) => s.completed).length)

const dailyIntentDraft = ref('')
watch(dateISO, () => { dailyIntentDraft.value = retrospectiveStore.dailyIntentByDate[dateISO.value] || '' }, {
  immediate: true,
})
const hasDailyIntent = computed(() => !!retrospectiveStore.dailyIntentByDate[dateISO.value])
function saveDailyIntent() {
  retrospectiveStore.setDailyIntent(dateISO.value, dailyIntentDraft.value)
}

function todoGoalId(todoId) {
  return todos.value.find((t) => t.id === todoId)?.goalId ?? null
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

const aiSuggestion = ref('')
const aiSuggestionLoading = ref(false)
async function loadSuggestion() {
  aiSuggestionLoading.value = true
  aiSuggestion.value = await suggestReflectionPrompt({
    dailyIntent: retrospectiveStore.dailyIntentByDate[dateISO.value] || '',
    schedules: schedules.value,
  })
  aiSuggestionLoading.value = false
}
watch(dateISO, loadSuggestion, { immediate: true })

const showReflectionModal = ref(false)
const hasReflection = computed(() => !!retrospectiveStore.reflectionsByDate[dateISO.value])
</script>

<style scoped>
.records-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}
.top-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: stretch;
}
@media (max-width: 640px) {
  .top-row {
    grid-template-columns: 1fr;
  }
  .column-retro {
    flex-direction: column;
    align-items: stretch;
  }
}
.column {
  padding: 20px;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.column-retro {
  padding: 20px 24px;
  border-left: 3px solid var(--p-lavender);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
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
.count strong {
  font-weight: 700;
  color: var(--p-ink);
}
.intent-input {
  width: 100%;
  flex: 1;
  border: none;
  padding: 14px 16px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--p-ink);
  resize: vertical;
  line-height: 1.6;
}
.intent-input::placeholder {
  color: var(--p-ink-faint);
}
.intent-save-btn {
  margin-top: 12px;
  align-self: flex-end;
}
.column-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.record-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--p-radius-sm);
  transition: background 120ms ease;
}
.record-item:hover {
  background: var(--p-bg);
}
.record-item :deep(.schedule-card) {
  flex: 1;
  min-width: 0;
}
.goal-select {
  border: none;
  font-family: inherit;
  font-size: 0.76rem;
  color: var(--p-ink-muted);
  padding: 6px 10px;
  border-radius: var(--p-radius-xs);
  max-width: 130px;
  flex-shrink: 0;
}
.retro-suggest {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.ai-badge {
  font-size: 0.62rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  padding: 3px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.suggest-text {
  font-size: 0.9rem;
  color: var(--p-ink);
  margin: 0;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  padding: 16px 4px;
  line-height: 1.7;
}
.empty-link {
  cursor: pointer;
}
.empty-link:hover {
  color: var(--p-ink-muted);
  text-decoration: underline;
}
</style>
