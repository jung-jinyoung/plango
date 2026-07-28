<template>
  <div class="records-layout">
    <div class="start-mode">
      <div class="start-hero">
        <BaseCard class="column-retro hero-full-row">
          <div class="retro-suggest">
            <span class="ai-badge" :class="`is-${journalPhase}`">{{ bannerBadgeLabel }}</span>
            <p class="suggest-text">{{ bannerText }}</p>
          </div>
          <BaseButton variant="primary" @click="handleBannerAction">
            {{ bannerButtonLabel }}
          </BaseButton>
        </BaseCard>

        <div class="hero-col hero-col-primary">
          <p class="section-eyebrow">지난 기록</p>
          <BaseCard class="start-hero-card is-quiet">
            <h2 class="card-eyebrow">실천중인 목표</h2>

            <div v-for="group in monthlyGroups" :key="group.monthly.id" class="hero-goal-group">
              <p class="hero-monthly-title">
                <span class="group-dot" :class="`is-${group.monthly.color}`" aria-hidden="true" />
                {{ group.monthly.title }}
              </p>
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

          <BaseCard class="start-hero-card hero-yesterday-card is-quiet">
            <p class="card-eyebrow">어제 요약</p>
            <template v-if="yesterdaySummary">
              <div class="hero-yesterday-head">
                <span>달성률</span>
                <span class="hero-yesterday-pct">{{ yesterdaySummary.rate }}%</span>
              </div>
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
          </BaseCard>

          <BaseCard class="start-hero-card hero-reflection-card is-quiet">
            <p class="card-eyebrow">지난 회고</p>
            <template v-if="previousReflection">
              <span class="hero-reflection-tag">회고 완료</span>
              <p class="hero-reflection-text">{{ previousReflection.text }}</p>
            </template>
            <p v-else class="empty">아직 등록된 회고가 없어요.</p>
          </BaseCard>
        </div>

        <div class="hero-col hero-col-secondary">
          <p class="section-eyebrow">오늘</p>
          <BaseCard class="start-hero-card hero-quicklink-card is-quiet">
            <button type="button" class="hero-quicklink" @click="goToMonthlyDashboard">
              <span class="hero-quicklink-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </span>
              <span class="hero-quicklink-text">
                <span class="hero-quicklink-label">바로가기</span>
                <span class="hero-quicklink-value">월간 대시보드</span>
              </span>
              <span class="hero-quicklink-chevron" aria-hidden="true">
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
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <span class="hero-quicklink-divider" aria-hidden="true" />

            <button type="button" class="hero-quicklink" @click="goToWeeklyDashboard">
              <span class="hero-quicklink-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16M15 4v16" />
                </svg>
              </span>
              <span class="hero-quicklink-text">
                <span class="hero-quicklink-label">바로가기</span>
                <span class="hero-quicklink-value">주간 대시보드</span>
              </span>
              <span class="hero-quicklink-chevron" aria-hidden="true">
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
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </BaseCard>

          <BaseCard class="start-hero-card plan-input-card">
            <div class="column-head">
              <h2>계획</h2>
            </div>
            <button
              v-if="!hasDailyIntent && (planSuggestionLoading || planSuggestion)"
              type="button"
              class="plan-suggestion-chip"
              :disabled="planSuggestionLoading"
              @click="applyPlanSuggestion"
            >
              <span class="ai-badge">AI</span>
              <span class="plan-suggestion-text">
                {{ planSuggestionLoading ? '오늘의 제안을 준비하고 있어요...' : planSuggestion }}
              </span>
            </button>
            <textarea
              ref="composerRef"
              v-model="dailyIntentDraft"
              class="plan-composer-input neu-sunken"
              rows="4"
              placeholder="오늘 하루의 계획을 적고 Enter로 저장하세요 (Shift+Enter 줄바꿈)"
              @input="autoGrowComposer"
              @keydown.enter.exact.prevent="handleComposerSend"
            />
            <BaseButton
              v-if="!hasDailyIntent"
              variant="primary"
              size="sm"
              class="plan-save-btn"
              :disabled="!dailyIntentDraft.trim()"
              @click="handleComposerSend"
            >
              계획 저장하기
            </BaseButton>
          </BaseCard>

          <BaseCard class="start-hero-card">
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
              <p
                v-if="schedules.length === 0"
                class="empty empty-link"
                @click="goToMonthlyDashboard"
              >
                오늘 기록된 일정이 없어요. 대시보드에서 계획을 세워보세요 →
              </p>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

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
import { suggestDailyIntent } from '@/services/ai/suggest-daily-intent'
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

onMounted(async () => {
  autoGrowComposer()
  await goalStore.load()
  loadPlanSuggestion()
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

// 오늘 이전 날짜 중 가장 최근에 회고가 등록된 날의 회고 텍스트를 보여준다
// (달성률은 위 "어제 달성률" 카드에서 이미 보여주므로 여기서는 중복 표시하지 않는다)
const previousReflection = computed(() => {
  const pastDates = Object.keys(retrospectiveStore.reflectionsByDate).filter(
    (d) => d < dateISO.value,
  )
  if (pastDates.length === 0) return null
  const lastDate = pastDates.sort().at(-1)
  return {
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

// 목표(월간 1순위)와 어제 실행 데이터를 반영한 계획 제안 문구
const planSuggestion = ref('')
const planSuggestionLoading = ref(false)
async function loadPlanSuggestion() {
  if (hasDailyIntent.value) return
  planSuggestionLoading.value = true
  planSuggestion.value = await suggestDailyIntent({
    topGoalTitle: monthlyGroups.value[0]?.monthly.title ?? null,
    yesterdayRate: yesterdaySummary.value?.rate ?? null,
    weakCategoryName: yesterdaySummary.value?.weakCategories[0]?.name ?? null,
  })
  planSuggestionLoading.value = false
}
function applyPlanSuggestion() {
  if (!planSuggestion.value) return
  dailyIntentDraft.value = planSuggestion.value
  nextTick(autoGrowComposer)
}

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
    message: '일일 계획을 저장했어요.',
    icon: 'check_circle',
    color: 'positive',
    position: 'top',
  })
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
watch(dateISO, loadPlanSuggestion, { immediate: true })

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
}
@media (max-width: 640px) {
  .column-retro {
    flex-direction: column;
    align-items: stretch;
  }
}
.start-mode {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 100px);
}
.start-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
@media (min-width: 880px) {
  .start-hero {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    align-items: start;
    column-gap: 40px;
  }
  .hero-col-secondary {
    position: relative;
  }
  .hero-col-secondary::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -20px;
    width: 1px;
    background: color-mix(in srgb, var(--p-ink) 8%, transparent);
  }
}
.section-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 -4px 4px;
}
.hero-full-row {
  width: 100%;
}
@media (min-width: 880px) {
  .hero-full-row {
    grid-column: 1 / -1;
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
}
.start-hero-card {
  width: 100%;
}
.start-hero-card.is-quiet {
  background: color-mix(in srgb, var(--p-surface) 65%, var(--p-bg));
  box-shadow: var(--p-shadow-raised-sm);
}
.card-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--p-ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px;
}
.hero-goal-group + .hero-goal-group {
  margin-top: 18px;
}
.hero-monthly-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.94rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0 0 8px;
}
.hero-monthly-title.is-unassigned {
  color: var(--p-ink-faint);
  font-weight: 600;
}
.group-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.group-dot.is-rose {
  background: var(--p-rose);
}
.group-dot.is-amber {
  background: var(--p-amber);
}
.group-dot.is-green {
  background: var(--p-green);
}
.group-dot.is-teal {
  background: var(--p-teal);
}
.group-dot.is-blue {
  background: var(--p-blue);
}
.group-dot.is-lavender {
  background: var(--p-lavender);
}
.group-dot.is-plum {
  background: var(--p-plum);
}
.group-dot.is-slate {
  background: var(--p-slate);
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
.hero-quicklink-card {
  display: flex;
  align-items: stretch;
  padding: 0;
  overflow: hidden;
}
.hero-quicklink {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  font-family: inherit;
  text-align: left;
  transition:
    background 120ms ease,
    transform 120ms ease;
}
.hero-quicklink:hover {
  background: color-mix(in srgb, var(--p-ink) 6%, var(--p-bg));
}
.hero-quicklink:hover .hero-quicklink-chevron {
  color: var(--p-ink);
  transform: translateX(2px);
}
.hero-quicklink:active {
  transform: scale(0.99);
}
.hero-quicklink-divider {
  width: 1px;
  align-self: stretch;
  margin: 14px 0;
  background: color-mix(in srgb, var(--p-ink) 10%, transparent);
  transition: opacity 120ms ease;
}
.hero-quicklink-card:has(.hero-quicklink:hover) .hero-quicklink-divider {
  opacity: 0;
}
.hero-quicklink-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--p-ink) 7%, var(--p-bg));
  color: var(--p-ink-muted);
  flex-shrink: 0;
}
.hero-quicklink-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.hero-quicklink-label {
  font-size: 0.7rem;
  color: var(--p-ink-faint);
}
.hero-quicklink-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--p-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero-quicklink-chevron {
  display: flex;
  color: var(--p-ink-faint);
  flex-shrink: 0;
  transition:
    color 120ms ease,
    transform 120ms ease;
}
.hero-yesterday-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.hero-reflection-tag {
  align-self: flex-start;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--p-green) 16%, var(--p-bg));
  color: var(--p-green-ink);
  margin-bottom: 2px;
}
.hero-reflection-text {
  font-size: 0.86rem;
  color: var(--p-ink-muted);
  line-height: 1.5;
  margin: 0;
}
.plan-input-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.plan-suggestion-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  max-width: 100%;
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: color-mix(in srgb, var(--p-lavender) 12%, var(--p-bg));
  font-family: inherit;
  text-align: left;
  transition:
    transform 120ms ease,
    background 120ms ease;
}
.plan-suggestion-chip:hover {
  background: color-mix(in srgb, var(--p-lavender) 20%, var(--p-bg));
  transform: translateY(-1px);
}
.plan-suggestion-chip:disabled {
  cursor: default;
  transform: none;
}
.plan-suggestion-text {
  font-size: 0.82rem;
  color: var(--p-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plan-composer-input {
  width: 100%;
  resize: vertical;
  border: none;
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.6;
  padding: 12px 14px;
  color: var(--p-ink);
}
.plan-composer-input::placeholder {
  color: var(--p-ink-faint);
}
.plan-save-btn {
  align-self: flex-end;
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
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--p-ink);
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
