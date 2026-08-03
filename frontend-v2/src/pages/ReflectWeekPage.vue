<template>
  <div class="reflect-week-dark page">
    <div class="wrap">
      <div class="hero">
        <svg class="flam" width="56" height="56" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <ellipse cx="56" cy="58" rx="19" ry="13" fill="var(--rose-500)" />
          <path
            d="M68 51C78 35 58 20 39 28"
            stroke="var(--rose-500)"
            stroke-width="4.6"
            stroke-linecap="round"
          />
          <circle cx="36" cy="29.5" r="4.6" fill="var(--rose-500)" />
          <path d="M32 27.5L23 31L32 34Z" fill="var(--rose-500)" />
          <path
            d="M52 70L55 82L48 92"
            stroke="var(--rose-500)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M41 92H55" stroke="var(--rose-500)" stroke-width="3" stroke-linecap="round" />
        </svg>
        <h1>지난주엔 목표에 <em>{{ heroActualLabel }}</em>을<br />썼어요</h1>
        <p>계획한 {{ heroEstimatedLabel }} 중에서요. 하나씩 같이 볼게요.</p>
      </div>

      <BaseCard class="section">
        <h2>목표별로 얼마나 썼나요</h2>
        <p v-if="lastWeekEntries.length === 0" class="empty">지난주 주간 목표가 없어요.</p>
        <GoalBreakdownRow
          v-for="entry in lastWeekEntries"
          :key="entry.goal.id"
          :title="entry.goal.title"
          :actual-min="entry.actualMin"
          :estimated-hours="entry.goal.estimatedHours"
          :percent="entry.percent"
          :color="entry.color"
        />
      </BaseCard>

      <BaseCard v-if="overallRatio !== null" class="section">
        <h2>예상은 얼마나 맞았나요</h2>
        <AccuracySummary :ratio="overallRatio" :trend="accuracyTrend" :trend-labels="accuracyTrendLabels">
          적어둔 시간보다 실제로 <b>{{ overrunPercent }}% 더 길게</b> 걸렸어요.<br />
          3주 전보다는 가까워지고 있어요.
        </AccuracySummary>
      </BaseCard>

      <BaseCard v-if="carrying" class="section">
        <h2>아직 안 끝난 일, 얼마나 남았나요</h2>
        <ReestimateCard
          :title="carrying.goal.title"
          :carry-count="carrying.goal.carryCount"
          :spent-min="carrying.actualMin"
          :ratio="overallRatio ?? 1"
          :initial-hours="carrying.goal.estimatedHours"
          @confirm="onConfirmReestimate"
        />
      </BaseCard>

      <BaseCard v-if="nextWeekSuggestions.length > 0" class="section">
        <h2>다음 주엔 이렇게 해볼까요</h2>
        <NextWeekSuggestions
          :suggestions="nextWeekSuggestions"
          :available-hours="availableHours"
          @confirm="onConfirmNextWeekGoals"
        />
      </BaseCard>

      <MonthlyWarningBanner
        v-for="warning in monthlyWarnings"
        :key="warning.monthlyGoalId"
        :warning="warning"
        class="section"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  actualMin,
  categoryColorOf,
  monthlyCurrentHours,
  projectedExtraWeeks,
  resolveCategoryForWeeklyGoal,
  weeklyMedianActualHours,
  weeklyProgress,
} from '../entities/derive'
import AccuracySummary from '../features/reflect/components/AccuracySummary.vue'
import { buildMonthlyWarning, type MonthlyWarning } from '../features/reflect/lib/buildMonthlyWarning'
import { computeWeeklyAccuracy } from '../features/reflect/lib/computeWeeklyAccuracy'
import GoalBreakdownRow from '../features/reflect/components/GoalBreakdownRow.vue'
import MonthlyWarningBanner from '../features/reflect/components/MonthlyWarningBanner.vue'
import NextWeekSuggestions from '../features/reflect/components/NextWeekSuggestions.vue'
import ReestimateCard from '../features/reflect/components/ReestimateCard.vue'
import { suggestNextWeekGoals, type NextWeekSuggestion } from '../features/reflect/lib/suggestNextWeekGoals'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { useTaskStore } from '../features/task/stores/taskStore'
import { addDays, formatMinutesAsHours, startOfWeek } from '../shared/lib/time'
import BaseCard from '../shared/ui/BaseCard.vue'

// DEMO_TODAY — 시드 데이터(scripts/generate-seed.mjs)가 이 날짜를 중심으로
// 고정 생성돼 있어서 화면 표시도 이 날짜에 고정한다. 실제 현재 시각으로
// 판단하는 router/index.ts(진입 라우팅)와는 별개 상수다 — 혼동 방지용으로
// 이름도 다르게 뒀다.
// TODO(CLAUDE.md 17절, Supabase 연동 후): 이 상수 대신 nowIso()를 쓴다.
const DEMO_TODAY = '2026-07-29'
const CURRENT_MONDAY = startOfWeek(DEMO_TODAY)
const LAST_MONDAY = addDays(CURRENT_MONDAY, -7)
const NEXT_MONDAY = addDays(CURRENT_MONDAY, 7)

const goalStore = useGoalStore()
const taskStore = useTaskStore()

const lastWeekGoals = computed(() => goalStore.weeklyGoals.filter((g) => g.weekOf === LAST_MONDAY))

const lastWeekEntries = computed(() =>
  lastWeekGoals.value.map((goal) => {
    const tasks = taskStore.tasks.filter((t) => t.weeklyGoalId === goal.id)
    const category = resolveCategoryForWeeklyGoal(goal, goalStore.monthlyGoalsById, goalStore.categoriesById)
    return {
      goal,
      tasks,
      actualMin: tasks.reduce((sum, t) => sum + actualMin(t), 0),
      percent: weeklyProgress(goal, tasks),
      color: categoryColorOf(category),
    }
  }),
)

const heroActualMin = computed(() => lastWeekEntries.value.reduce((sum, e) => sum + e.actualMin, 0))
const heroEstimatedMin = computed(() =>
  lastWeekEntries.value.reduce((sum, e) => sum + e.goal.estimatedHours * 60, 0),
)
const heroActualLabel = computed(() => formatMinutesAsHours(heroActualMin.value))
const heroEstimatedLabel = computed(() => formatMinutesAsHours(heroEstimatedMin.value))

// 정확도 — 연구 계열(mg-thesis) achieved 4주(연구 주제 확정 2.0 → 선행연구
// 정리 완료 1.8 → 선행 자료 스크리닝 1.6 → 실험 설계 확정 1.4, 시간순) 전체를
// computeWeeklyAccuracy로 구해서, 그중 "지난주"(실험 설계 확정) 값을 대표값으로
// 쓴다. 습관 계열(mg-fitness) achieved는 별개 트랙이라 여기 안 섞는다 — 안 섞으면
// wg-ex-3(습관, LAST_MONDAY)가 실험 설계 확정과 같은 주에 겹칠 때 "지난주" 대표값이
// 조용히 습관 목표 쪽으로 넘어가버리는 문제가 있었다(taskRepository.spec.ts의
// monthlyGoalId 스코핑과 동일한 이유).
const achievedGoalsInOrder = computed(() =>
  goalStore.weeklyGoals
    .filter((g) => g.status === 'achieved' && g.monthlyGoalId === 'mg-thesis')
    .slice()
    .sort((a, b) => a.weekOf.localeCompare(b.weekOf)),
)
const accuracyByGoalId = computed(() => {
  const results = computeWeeklyAccuracy(goalStore.weeklyGoals, taskStore.tasks)
  return new Map(results.map((r) => [r.weeklyGoalId, r.ratio]))
})
const accuracyTrend = computed(() =>
  achievedGoalsInOrder.value.map((g) => accuracyByGoalId.value.get(g.id) ?? 0),
)
// achieved 주 개수가 바뀌어도 라벨이 안 깨지게 동적으로 만든다 — 예전엔
// ['3주 전','2주 전','지난주']로 3개 고정이었는데, achieved 주가 4개로 늘자
// 막대 4개에 라벨 3개가 붙는 불일치가 났었다.
const accuracyTrendLabels = computed(() => {
  const n = accuracyTrend.value.length
  return Array.from({ length: n }, (_, i) => {
    const weeksAgo = n - i
    return weeksAgo === 1 ? '지난주' : `${weeksAgo}주 전`
  })
})
const overallRatio = computed(() => {
  const trend = accuracyTrend.value
  return trend.length > 0 ? trend[trend.length - 1]! : null
})
const overrunPercent = computed(() => Math.round(((overallRatio.value ?? 1) - 1) * 100))

// 이월 중(carryCount로 판정)
const carrying = computed(() => {
  const goal = goalStore.weeklyGoals.find((g) => g.carryCount > 0 && g.status === 'active')
  if (!goal) return null
  const tasks = taskStore.tasks.filter((t) => t.weeklyGoalId === goal.id)
  return { goal, actualMin: tasks.reduce((sum, t) => sum + actualMin(t), 0) }
})

// ReestimateCard가 emit('confirm', ...)을 보낼 때만 실행 — 힌트를 보여주는
// 동안엔(ReestimateCard 내부) 이 함수가 절대 호출되지 않는다(R6).
function onConfirmReestimate(newHours: number) {
  if (!carrying.value) return
  goalStore.updateWeeklyGoal(carrying.value.goal.id, { estimatedHours: newHours })
}

// 다음 주 목표 제안 + 가용 시간 검사 (6-5절: 지난 4주 실제 투입 중앙값 − 이미 잡힌 약속)
const medianActualHours = computed(() =>
  weeklyMedianActualHours(goalStore.weeklyGoals, taskStore.tasks, CURRENT_MONDAY),
)
const nextWeekAppointmentHours = computed(() => {
  const NEXT_SUNDAY = addDays(NEXT_MONDAY, 6)
  const totalMin = taskStore.tasks
    .filter((t) => {
      if (t.weeklyGoalId !== null || !t.plannedBlock) return false
      const date = t.plannedBlock.start.slice(0, 10)
      return date >= NEXT_MONDAY && date <= NEXT_SUNDAY
    })
    .reduce((sum, t) => sum + t.estimatedMin, 0)
  return totalMin / 60
})
const availableHours = computed(() => Math.max(0, medianActualHours.value - nextWeekAppointmentHours.value))

const nextWeekSuggestions = computed(() =>
  suggestNextWeekGoals(
    goalStore.weeklyGoals,
    goalStore.monthlyGoals,
    goalStore.categoriesById,
    taskStore.tasks,
    LAST_MONDAY,
    availableHours.value,
  ),
)

// NextWeekSuggestions가 emit('confirm', ...)을 보낼 때만 실행 — 후보를 보여주고
// ✕로 빼는 동안엔 이 함수가 절대 호출되지 않는다(R6). 이월 이어짐 후보는
// CLAUDE.md 6-3절(이월은 새 항목 생성)대로, 지난 레코드는 carried로 얼리고
// 다음 주 레코드를 새로 만든다.
function onConfirmNextWeekGoals(accepted: NextWeekSuggestion[]) {
  // carrying은 goalStore.weeklyGoals에 의존하는 computed라, 루프 안에서
  // updateWeeklyGoal로 그 배열을 건드리면 다음 접근 때 재계산되어 값이
  // 바뀐다(원본은 이미 carried, 새 레코드는 아직 안 생긴 틈에 null이 되는
  // 버그를 실제로 겪었다) — 함수 시작 시점 값을 로컬에 고정해두고 그것만 쓴다.
  const carryingGoal = carrying.value?.goal ?? null

  for (const s of accepted) {
    const isCarryingSuggestion = carryingGoal && s.key === `carry-${carryingGoal.id}`
    if (isCarryingSuggestion && carryingGoal) {
      goalStore.updateWeeklyGoal(carryingGoal.id, { status: 'carried' })
      goalStore.addWeeklyGoal({
        id: `${carryingGoal.id}-next`,
        title: s.title,
        weekOf: NEXT_MONDAY,
        monthlyGoalId: s.monthlyGoalId,
        estimatedHours: s.hours,
        carryCount: carryingGoal.carryCount + 1,
        status: 'active',
      })
    } else {
      goalStore.addWeeklyGoal({
        id: `wg-next-${s.key}`,
        title: s.title,
        weekOf: NEXT_MONDAY,
        monthlyGoalId: s.monthlyGoalId,
        estimatedHours: s.hours,
        carryCount: 0,
        status: 'active',
      })
    }
  }
}

// 월간 경고 (④ 월간 진도 재계산, 6-4절) — active 월간 목표마다 경고 조건을
// 확인해서 해당하는 것만 배너로 보여준다. 경고 조건 자체(baseline 초과 OR
// extraWeeks>=1.5)는 buildMonthlyWarning 안에서 판정한다.
const monthlyWarnings = computed<MonthlyWarning[]>(() => {
  const weeklyEntries = goalStore.weeklyGoals.map((goal) => ({
    goal,
    tasks: taskStore.tasks.filter((t) => t.weeklyGoalId === goal.id),
  }))
  return goalStore.monthlyGoals
    .filter((m) => m.status === 'active')
    .map((m) => {
      const current = monthlyCurrentHours(m, weeklyEntries)
      const extraWeeks = projectedExtraWeeks(m, goalStore.weeklyGoals, taskStore.tasks, CURRENT_MONDAY)
      return buildMonthlyWarning(m, current, extraWeeks)
    })
    .filter((w): w is MonthlyWarning => w !== null)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-page);
  color: var(--text-primary);
  padding: 24px 0 60px;
}
.wrap {
  max-width: 660px;
  margin: 0 auto;
  padding: 0 24px;
}
.hero {
  padding: 24px 0 32px;
  text-align: center;
}
.hero .flam {
  margin-bottom: 16px;
}
.hero h1 {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.35;
}
.hero h1 em {
  font-style: normal;
  color: var(--rose-500);
}
.hero p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 10px;
}
.section {
  margin-bottom: 14px;
}
.section h2 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: -0.01em;
  margin-bottom: 18px;
}
.empty {
  font-size: 13.5px;
  color: var(--text-muted);
}
</style>
