<template>
  <div class="records-layout">
    <div class="journey-steps">
      <template v-for="(step, i) in journeySteps" :key="step.key">
        <div
          class="journey-step"
          :class="{ 'is-active': step.key === currentStepKey, 'is-done': step.done }"
        >
          <span class="step-index">{{ step.done ? '✓' : i + 1 }}</span>
          <span class="step-label">{{ step.label }}</span>
        </div>
        <span v-if="i < journeySteps.length - 1" class="step-arrow" aria-hidden="true">→</span>
      </template>
    </div>

    <div v-if="!hasDailyIntent" class="start-mode">
      <div class="start-hero">
        <div class="hero-col hero-col-primary">
          <BaseCard class="start-hero-card">
            <h2 class="start-hero-title">실천중인 목표</h2>

            <div v-for="group in monthlyGroups" :key="group.monthly.id" class="hero-goal-group">
              <p class="hero-monthly-title">{{ group.monthly.title }}</p>
              <ul class="hero-weekly-list">
                <li v-for="goal in group.weeklyGoals" :key="goal.id">
                  {{ goal.title }}
                  <span class="hero-weekly-count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
                </li>
                <li v-if="group.weeklyGoals.length === 0" class="hero-weekly-empty">
                  아직 이 목표에 속한 주간 목표가 없어요.
                </li>
              </ul>
            </div>

            <div v-if="unassignedWeeklyGoals.length > 0" class="hero-goal-group">
              <p class="hero-monthly-title is-unassigned">미분류 주간 목표</p>
              <ul class="hero-weekly-list">
                <li v-for="goal in unassignedWeeklyGoals" :key="goal.id">
                  {{ goal.title }}
                  <span class="hero-weekly-count">{{ goal.doneCount }}/{{ goal.taskCount }}</span>
                </li>
              </ul>
            </div>

            <p
              v-if="monthlyGroups.length === 0 && unassignedWeeklyGoals.length === 0"
              class="empty"
            >
              등록된 목표가 없어요.
            </p>
          </BaseCard>
        </div>

        <div class="hero-col hero-col-secondary">
          <button type="button" class="hero-goto-btn" @click="goToMonthlyDashboard">
            월간 대시보드 이동 &gt;
          </button>

          <BaseCard class="start-hero-card hero-nav-card hero-nav-card-wide">
            <button type="button" class="hero-nav-link" @click="goToWeeklyDashboard">
              주간 대시보드 이동 &gt;
            </button>
            <div class="hero-yesterday">
              <template v-if="yesterdaySummary">
                <div class="hero-yesterday-head">
                  <span>어제 달성률</span>
                  <span class="hero-yesterday-pct">{{ yesterdaySummary.rate }}%</span>
                </div>
                <ProgressBar :value="yesterdaySummary.rate" :color="yesterdaySummary.rateColor" />
                <div v-if="yesterdaySummary.weakCategories.length > 0" class="hero-weak">
                  <p class="hero-weak-label">보완하면 좋을 카테고리</p>
                  <div class="hero-weak-chip-row">
                    <span
                      v-for="c in yesterdaySummary.weakCategories"
                      :key="c.color"
                      class="hero-weak-chip"
                      :class="`is-${c.color}`"
                    >
                      {{ c.name }} {{ c.rate }}%
                    </span>
                  </div>
                </div>
              </template>
              <p v-else class="empty">어제 등록된 일정이 없어요.</p>
            </div>
          </BaseCard>

          <BaseCard class="start-hero-card hero-reflection-card">
            <template v-if="previousReflection">
              <p class="hero-reflection-label">지난 회고 · 완료율 {{ previousReflection.rate }}%</p>
              <p class="hero-reflection-text">{{ previousReflection.text }}</p>
            </template>
            <p v-else class="empty">아직 등록된 회고가 없어요.</p>
          </BaseCard>
        </div>
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
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import ReflectionModal from '@/components/retrospective/ReflectionModal.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import { useTodoStore } from '@/stores/todos'
import { useScheduleStore } from '@/stores/schedule'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'
import { useRetrospectiveStore } from '@/stores/retrospective'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { suggestReflectionPrompt } from '@/services/ai/suggest-reflection-prompt'
import { addDaysISO } from '@/utils/date'

const $q = useQuasar()
const router = useRouter()
const calendarNav = useCalendarNavStore()
const dateISO = computed(() => calendarNav.currentDateISO)

const todoStore = useTodoStore()
const scheduleStore = useScheduleStore()
const goalStore = useGoalStore()
const categoryStore = useCategoryStore()
const retrospectiveStore = useRetrospectiveStore()

onMounted(() => {
  goalStore.load()
  autoGrowComposer()
})

// 주간 목표를 상위 월간 목표별로 묶는다 (부모 없는 주간 목표는 별도 미분류 목록으로)
const monthlyGroups = computed(() => {
  const weeklyByMonthly = new Map()
  for (const goal of goalStore.weeklyGoals) {
    if (!goal.monthlyGoalId) continue
    if (!weeklyByMonthly.has(goal.monthlyGoalId)) weeklyByMonthly.set(goal.monthlyGoalId, [])
    weeklyByMonthly.get(goal.monthlyGoalId).push(goal)
  }
  return goalStore.monthlyGoals.map((monthly) => ({
    monthly,
    weeklyGoals: weeklyByMonthly.get(monthly.id) ?? [],
  }))
})
const unassignedWeeklyGoals = computed(() => goalStore.weeklyGoals.filter((g) => !g.monthlyGoalId))

// 오늘 이전 날짜 중 가장 최근에 회고가 등록된 날의 완료율+회고 텍스트를 보여준다
const previousReflection = computed(() => {
  const pastDates = Object.keys(retrospectiveStore.reflectionsByDate).filter(
    (d) => d < dateISO.value,
  )
  if (pastDates.length === 0) return null
  const lastDate = pastDates.sort().at(-1)
  const daySchedules = scheduleStore.list(lastDate)
  const total = daySchedules.length
  const done = daySchedules.filter((s) => s.completed).length
  return {
    rate: total === 0 ? 0 : Math.round((done / total) * 100),
    text: retrospectiveStore.reflectionsByDate[lastDate],
  }
})

// 어제 일정의 달성률과, 완료율이 가장 낮았던 카테고리 2개를 보여준다
const yesterdaySummary = computed(() => {
  const daySchedules = scheduleStore.list(addDaysISO(dateISO.value, -1))
  const total = daySchedules.length
  if (total === 0) return null

  const done = daySchedules.filter((s) => s.completed).length
  const rate = Math.round((done / total) * 100)
  const rateColor = rate >= 70 ? 'green' : rate >= 40 ? 'amber' : 'rose'

  const byCategory = new Map()
  daySchedules.forEach((s) => {
    if (!s.categoryColor) return
    const entry = byCategory.get(s.categoryColor) ?? { total: 0, done: 0 }
    entry.total += 1
    if (s.completed) entry.done += 1
    byCategory.set(s.categoryColor, entry)
  })

  const weakCategories = [...byCategory.entries()]
    .map(([color, { total: t, done: d }]) => ({
      color,
      name: categoryStore.categories.find((c) => c.color === color)?.name ?? color,
      rate: Math.round((d / t) * 100),
    }))
    .filter((c) => c.rate < 100)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 2)

  return { rate, rateColor, weakCategories }
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
  $q.notify({
    message: '일일 계획을 저장했어요. 월간·주간 목표를 확인하고 오늘 일정을 세워보세요!',
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
  router.push('/app/dashboard/monthly')
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
function goToWeeklyDashboard() {
  router.push('/app/dashboard/weekly')
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

// 하루 여정 4단계: 계획 작성 → 목표 확인/할 일 정하기(대시보드) → 일정 실행 → 회고.
// 저널 화면만으로는 대시보드 단계 진행 여부를 알 수 없어 일정 존재 여부로 근사한다.
const JOURNEY_STEP_LABELS = {
  plan: '오늘 계획 작성',
  dashboard: '목표 확인 · 할 일 정하기',
  execute: '일정 실행',
  reflect: '오늘 회고',
}
const currentStepKey = computed(() => {
  if (!hasDailyIntent.value) return 'plan'
  if (schedules.value.length === 0) return 'dashboard'
  if (!hasReflection.value) return 'execute'
  return 'reflect'
})
const journeySteps = computed(() => {
  const order = Object.keys(JOURNEY_STEP_LABELS)
  const currentIdx = order.indexOf(currentStepKey.value)
  return order.map((key, idx) => ({
    key,
    label: JOURNEY_STEP_LABELS[key],
    done: idx < currentIdx,
  }))
})

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
.journey-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.journey-step {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 6px;
  border-radius: 999px;
  color: var(--p-ink-faint);
}
.journey-step .step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--p-bg);
  color: var(--p-ink-faint);
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}
.journey-step .step-label {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.journey-step.is-done .step-index {
  background: var(--p-green);
  color: #fff;
}
.journey-step.is-done .step-label {
  color: var(--p-ink-faint);
}
.journey-step.is-active {
  color: var(--p-lavender);
}
.journey-step.is-active .step-index {
  background: var(--p-lavender);
  color: #fff;
}
.journey-step.is-active .step-label {
  color: var(--p-ink);
}
.step-arrow {
  color: var(--p-ink-faint);
  font-size: 0.78rem;
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
.start-hero {
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  border-radius: var(--p-radius-lg);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
@media (min-width: 880px) {
  .start-hero {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    align-items: stretch;
  }
}
.hero-col {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 880px) {
  .hero-col {
    max-width: none;
  }
  .hero-col-primary > .start-hero-card {
    flex: 1;
  }
}
.start-hero-card {
  width: 100%;
  box-shadow: none !important;
}
.start-hero-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  margin: 0 0 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--p-ink) 12%, transparent);
}
.hero-goal-group + .hero-goal-group {
  margin-top: 18px;
}
.hero-monthly-title {
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0 0 6px;
}
.hero-monthly-title.is-unassigned {
  color: var(--p-ink-faint);
  font-weight: 600;
}
.hero-weekly-list {
  list-style: disc;
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hero-weekly-list li {
  font-size: 0.85rem;
  color: var(--p-ink-muted);
}
.hero-weekly-count {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  margin-left: 6px;
  font-variant-numeric: tabular-nums;
}
.hero-weekly-empty {
  list-style: none;
  margin-left: -20px;
  color: var(--p-ink-faint);
  font-size: 0.8rem;
}
.hero-goto-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  width: 100%;
  padding: 14px 20px;
  border-radius: 999px;
  background: var(--p-surface);
  color: var(--p-rose-ink);
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  transition: transform 120ms ease;
}
.hero-goto-btn:hover {
  transform: translateY(-1px);
}
.hero-goto-btn:active {
  transform: translateY(0) scale(0.98);
}
.hero-nav-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.hero-nav-card-wide {
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}
.hero-nav-link {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  padding: 0;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--p-rose-ink);
  text-align: left;
}
.hero-nav-link:hover {
  text-decoration: underline;
}
.hero-yesterday {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
}
.hero-yesterday-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--p-ink-muted);
}
.hero-yesterday-pct {
  font-weight: 700;
  color: var(--p-ink);
  font-variant-numeric: tabular-nums;
}
.hero-weak {
  margin-top: 4px;
}
.hero-weak-label {
  font-size: 0.74rem;
  color: var(--p-ink-faint);
  margin: 0 0 6px;
}
.hero-weak-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.hero-weak-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--chip-color, var(--p-rose)) 16%, var(--p-bg));
  color: var(--chip-ink, var(--p-rose-ink));
}
.hero-weak-chip.is-rose {
  --chip-color: var(--p-rose);
  --chip-ink: var(--p-rose-ink);
}
.hero-weak-chip.is-amber {
  --chip-color: var(--p-amber);
  --chip-ink: var(--p-amber-ink);
}
.hero-weak-chip.is-green {
  --chip-color: var(--p-green);
  --chip-ink: var(--p-green-ink);
}
.hero-weak-chip.is-teal {
  --chip-color: var(--p-teal);
  --chip-ink: var(--p-teal-ink);
}
.hero-weak-chip.is-blue {
  --chip-color: var(--p-blue);
  --chip-ink: var(--p-blue-ink);
}
.hero-weak-chip.is-lavender {
  --chip-color: var(--p-lavender);
  --chip-ink: var(--p-lavender-ink);
}
.hero-weak-chip.is-plum {
  --chip-color: var(--p-plum);
  --chip-ink: var(--p-plum-ink);
}
.hero-weak-chip.is-slate {
  --chip-color: var(--p-slate);
  --chip-ink: var(--p-slate-ink);
}
.hero-reflection-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero-reflection-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  margin: 0;
}
.hero-reflection-text {
  font-size: 0.86rem;
  color: var(--p-ink-muted);
  line-height: 1.5;
  margin: 0;
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
