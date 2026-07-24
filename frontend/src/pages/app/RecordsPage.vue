<template>
  <div class="records-layout">
    <div v-if="!hasDailyIntent" class="start-mode">
      <div class="start-goals">
        <div class="start-goals-head">
          <h2>이번 달 · 이번 주 목표</h2>
        </div>
        <div
          v-for="group in monthlyGoalGroups"
          :key="group.monthly ? group.monthly.id : 'unassigned'"
          class="goal-group"
        >
          <div
            class="goal-mini-item is-parent"
            :class="group.monthly ? `is-${group.monthly.color}` : ''"
          >
            <span class="dot" aria-hidden="true" />
            <span class="title">{{ group.monthly ? group.monthly.title : '미분류' }}</span>
            <span v-if="group.monthly" class="count">
              {{ group.monthly.doneCount }}/{{ group.monthly.taskCount }}
            </span>
          </div>
          <div class="goal-mini-sublist">
            <div
              v-for="goal in group.weeklyGoals"
              :key="goal.id"
              class="goal-mini-item is-child"
              :class="`is-${goal.color}`"
            >
              <span class="dot" aria-hidden="true" />
              <span class="title">{{ goal.title }}</span>
              <span class="count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
            </div>
            <p v-if="group.weeklyGoals.length === 0" class="empty sub-empty">
              이 목표에 속한 주간 목표가 없어요.
            </p>
          </div>
        </div>
        <p v-if="monthlyGoalGroups.length === 0" class="empty">등록된 목표가 없어요.</p>
      </div>

      <div class="plan-composer neu-raised">
        <textarea
          ref="composerRef"
          v-model="dailyIntentDraft"
          class="plan-composer-input"
          rows="1"
          placeholder="오늘 하루의 계획을 적고 Enter로 저장하세요 (Shift+Enter 줄바꿈)"
          @input="autoGrowComposer"
          @keydown.enter.exact.prevent="handleComposerSend"
        />
        <button
          type="button"
          class="composer-send"
          :disabled="!dailyIntentDraft.trim()"
          aria-label="계획 저장"
          @click="handleComposerSend"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>

    <template v-else>
      <BaseCard class="column-retro">
        <div class="retro-suggest">
          <span class="ai-badge" :class="`is-${journalPhase}`">{{ bannerBadgeLabel }}</span>
          <p class="suggest-text">{{ bannerText }}</p>
        </div>
        <BaseButton variant="primary" @click="handleBannerAction">
          {{ bannerButtonLabel }}
        </BaseButton>
      </BaseCard>

      <div class="top-row">
        <BaseCard class="column">
          <div class="column-head">
            <h2>계획</h2>
            <span class="count">오늘 계획했던 것</span>
          </div>
          <textarea
            v-model="dailyIntentDraft"
            class="intent-input neu-sunken"
            rows="6"
            placeholder="오늘 하루의 계획이나 목표를 간단히 적어보세요"
          />
          <BaseButton
            variant="secondary"
            size="sm"
            class="intent-save-btn"
            @click="saveDailyIntent"
          >
            계획 수정하기
          </BaseButton>
        </BaseCard>

        <BaseCard class="column">
          <div class="column-head">
            <h2>일정</h2>
            <span class="count"
              >실제로 한 일 · <strong>{{ doneCount }}</strong
              >/{{ schedules.length }} 완료</span
            >
          </div>
          <div class="column-body">
            <div
              v-for="schedule in schedules"
              :key="schedule.id"
              class="record-item"
              @click="handleItemClick($event, goToDaily)"
            >
              <ScheduleCard
                :schedule="schedule"
                :draggable="false"
                compact
                @toggle-complete="handleToggleComplete"
              />
              <select
                v-if="schedule.todoId && goalStore.weeklyGoals.length > 0"
                class="goal-select neu-sunken"
                :value="todoGoalId(schedule.todoId) || ''"
                @change="
                  handleAssignGoal({
                    todoId: schedule.todoId,
                    goalId: $event.target.value || null,
                  })
                "
              >
                <option value="">목표 미태그</option>
                <option v-for="goal in goalStore.weeklyGoals" :key="goal.id" :value="goal.id">
                  {{ goal.title }}
                </option>
              </select>
              <button
                v-else-if="schedule.todoId"
                type="button"
                class="goal-add-link"
                @click="showGoalModal = true"
              >
                주간 목표 추가
              </button>
            </div>
            <p v-if="schedules.length === 0" class="empty empty-link" @click="goToMonthlyDashboard">
              오늘 기록된 일정이 없어요. 대시보드에서 계획을 세워보세요 →
            </p>
          </div>
        </BaseCard>
      </div>
    </template>

    <ReflectionModal v-model="showReflectionModal" :dateISO="dateISO" />
    <GoalFormModal
      v-model="showGoalModal"
      variant="weekly"
      @save="goalStore.addWeeklyGoal($event)"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import ReflectionModal from '@/components/retrospective/ReflectionModal.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
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

onMounted(() => {
  goalStore.load()
  autoGrowComposer()
})

// 주간 목표를 상위 월간 목표별로 묶는다 (미분류는 마지막 그룹으로)
const monthlyGoalGroups = computed(() => {
  const weeklyByMonthly = new Map()
  for (const goal of goalStore.weeklyGoals) {
    if (!goal.monthlyGoalId) continue
    if (!weeklyByMonthly.has(goal.monthlyGoalId)) weeklyByMonthly.set(goal.monthlyGoalId, [])
    weeklyByMonthly.get(goal.monthlyGoalId).push(goal)
  }
  const groups = goalStore.monthlyGoals.map((monthly) => ({
    monthly,
    weeklyGoals: weeklyByMonthly.get(monthly.id) ?? [],
  }))
  const orphans = goalStore.weeklyGoals.filter((g) => !g.monthlyGoalId)
  if (orphans.length > 0) groups.push({ monthly: null, weeklyGoals: orphans })
  return groups
})

const composerRef = ref(null)
function autoGrowComposer() {
  const el = composerRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
function handleComposerSend() {
  if (!dailyIntentDraft.value.trim()) return
  saveDailyIntent()
}

const todos = computed(() => todoStore.list(dateISO.value))
const schedules = computed(() =>
  [...scheduleStore.list(dateISO.value)].sort((a, b) => a.startMinutes - b.startMinutes),
)
const doneCount = computed(() => schedules.value.filter((s) => s.completed).length)

const dailyIntentDraft = ref('')
watch(
  dateISO,
  () => {
    dailyIntentDraft.value = retrospectiveStore.dailyIntentByDate[dateISO.value] || ''
    nextTick(autoGrowComposer)
  },
  {
    immediate: true,
  },
)
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
// BaseCheckbox는 <label> 안에 보이지 않는 <input>과 시각적 <span class="box">를 함께 렌더링하므로
// tagName만 비교하면 span 클릭이 걸러지지 않는다 — closest로 조상까지 확인한다.
function handleItemClick(e, navigate) {
  if (e.target.closest('input, select, option, button, textarea, label')) return
  navigate()
}
function goToDaily() {
  router.push('/app/dashboard/daily')
}
function goToMonthlyDashboard() {
  router.push('/app/dashboard/monthly')
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

const showGoalModal = ref(false)

// 계획이 없으면 "하루 시작" 모드(계획 작성 카드만)를, 계획이 있으면 "하루 종료" 모드(계획·일정 비교 + 회고 배너)를 보여준다
// 배너는 하루 종료 모드에서만 렌더링되므로 진행중/완료 2단계만 다루면 된다
const journalPhase = computed(() => (hasReflection.value ? 'done' : 'in-progress'))
const bannerBadgeLabel = computed(() => (journalPhase.value === 'done' ? 'DONE' : 'AI'))
const bannerText = computed(() => {
  if (journalPhase.value === 'done')
    return '오늘의 회고를 등록했어요. 필요하면 언제든 수정할 수 있어요.'
  return aiSuggestionLoading.value ? '오늘 하루를 돌아보는 중이에요...' : aiSuggestion.value
})
const bannerButtonLabel = computed(() => (hasReflection.value ? '회고 수정하기' : '회고 등록하기'))
function handleBannerAction() {
  showReflectionModal.value = true
}
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
.start-mode {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.start-goals {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.start-goals-head h2 {
  font-size: 1.02rem;
  font-weight: 700;
  margin: 0;
}
.goal-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.goal-mini-sublist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 22px;
}
.sub-empty {
  padding: 4px 4px 4px 10px;
  font-size: 0.8rem;
}
.goal-mini-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--p-radius-sm);
  background: color-mix(in srgb, var(--dot-color, var(--p-rose)) 8%, var(--p-bg));
  font-size: 0.85rem;
}
.goal-mini-item.is-parent .title {
  font-weight: 700;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--p-ink);
  font-weight: 600;
}
.goal-mini-item .count {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
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
.plan-composer {
  position: sticky;
  bottom: 20px;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 12px 10px 16px;
}
.plan-composer-input {
  flex: 1;
  resize: none;
  max-height: 200px;
  overflow-y: auto;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.6;
  padding: 8px 4px;
  color: var(--p-ink);
}
.plan-composer-input::placeholder {
  color: var(--p-ink-faint);
}
.composer-send {
  appearance: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--p-lavender);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 120ms ease;
}
.composer-send:disabled {
  opacity: 0.35;
  cursor: default;
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
  max-width: 320px;
  flex-shrink: 0;
}
.goal-add-link {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 6px 10px;
  flex-shrink: 0;
  white-space: nowrap;
}
.goal-add-link:hover {
  text-decoration: underline;
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
.ai-badge.is-done {
  background: linear-gradient(145deg, var(--p-green), #2f6b4f);
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
