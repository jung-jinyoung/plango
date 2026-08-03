<template>
  <div class="page">
    <div class="wrap">
      <div class="progress">
        <div class="track"><i :style="{ width: `${(step / 2) * 100}%` }" /></div>
        <span class="n">{{ step }} / 2</span>
      </div>

      <template v-if="step === 1">
        <div class="head">
          <h1>이번 달 목표를 하나 정해볼까요?</h1>
          <p>산출물이 뚜렷한 목표일수록 나누기 쉬워요.</p>
        </div>
        <MonthlyGoalIntakeForm :categories="goalStore.categories" @submit="onIntakeSubmit" />
      </template>

      <template v-else-if="step === 2 && intake">
        <div class="head">
          <span class="eyebrow">
            <Dot :color="selectedCategoryColor" />
            {{ monthLabel }} 목표 · {{ selectedCategoryName }}
          </span>
          <h1>"{{ intake.title }}"을<br />네 주로 나눠봤어요</h1>
          <p v-if="!confirmed">맞지 않는 부분은 바로 고쳐도 돼요. 나중에 언제든 다시 잡을 수 있어요.</p>
        </div>

        <p v-if="confirmed" class="done">
          이번 달 목표를 시작했어요.
          <RouterLink :to="{ name: 'today' }" class="link">오늘 뷰로 가기</RouterLink>
        </p>
        <MonthlyGoalBreakdown
          v-else
          :drafts="drafts"
          :color="selectedCategoryColor"
          @confirm="onConfirmBreakdown"
          @retry="onRetry"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CategoryColor, WeeklyGoalDraft } from '../entities/types'
import { decomposeMonthlyGoal } from '../features/ai/lib/decomposeMonthlyGoal'
import MonthlyGoalBreakdown from '../features/goal/components/MonthlyGoalBreakdown.vue'
import MonthlyGoalIntakeForm from '../features/goal/components/MonthlyGoalIntakeForm.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { startOfWeek } from '../shared/lib/time'
import Dot from '../shared/ui/Dot.vue'

// 시드 데이터의 "오늘" 날짜로 고정 — TodayPage.vue와 같은 이유(10단계에서 교체).
const TODAY = '2026-07-29'
const CURRENT_MONDAY = startOfWeek(TODAY)
const MONTH = TODAY.slice(0, 7) // 'YYYY-MM'

const goalStore = useGoalStore()

// 지금은 ①목표 입력 ②역산 확인/조정까지만 — ③오늘 할 일 확정은 다음 커밋.
// "N / 2"로 정직하게 표시하고, ③이 생기면 분모를 3으로 바꾼다.
const step = ref<1 | 2>(1)
const intake = ref<{ title: string; categoryId: string; baselineHours: number } | null>(null)
const drafts = ref<WeeklyGoalDraft[]>([])
const confirmed = ref(false)

const selectedCategory = computed(() =>
  intake.value ? (goalStore.categoriesById.get(intake.value.categoryId) ?? null) : null,
)
const selectedCategoryColor = computed<CategoryColor>(() => selectedCategory.value?.color ?? 'gray')
const selectedCategoryName = computed(() => selectedCategory.value?.name ?? '')
const monthLabel = computed(() => `${Number(MONTH.slice(5, 7))}월`)

async function onIntakeSubmit(value: { title: string; categoryId: string; baselineHours: number }) {
  intake.value = value
  drafts.value = await decomposeMonthlyGoal({
    title: value.title,
    baselineHours: value.baselineHours,
    startWeekOf: CURRENT_MONDAY,
  })
  step.value = 2
}

async function onRetry() {
  if (!intake.value) return
  drafts.value = await decomposeMonthlyGoal({
    title: intake.value.title,
    baselineHours: intake.value.baselineHours,
    startWeekOf: CURRENT_MONDAY,
  })
}

// MonthlyGoalBreakdown이 emit('confirm', ...)을 보낼 때만 실행 — 스테퍼로
// 조정하는 동안엔 스토어를 절대 안 건드린다(R6: 제안 → 사용자 수락 → 변경).
function onConfirmBreakdown(weeks: { title: string; weekOf: string; estimatedHours: number }[]) {
  if (!intake.value) return
  const monthlyGoalId = `mg-${Date.now()}`
  goalStore.addMonthlyGoal({
    id: monthlyGoalId,
    title: intake.value.title,
    month: MONTH,
    categoryId: intake.value.categoryId,
    baselineHours: intake.value.baselineHours,
    status: 'active',
  })
  weeks.forEach((w, i) => {
    goalStore.addWeeklyGoal({
      id: `${monthlyGoalId}-w${i + 1}`,
      title: w.title,
      weekOf: w.weekOf,
      monthlyGoalId,
      estimatedHours: w.estimatedHours,
      carryCount: 0,
      status: 'active',
    })
  })
  confirmed.value = true
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--surface-page);
  color: var(--text-primary);
  padding-bottom: 60px;
}
.wrap {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 24px 0;
}
.progress {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}
.progress .track {
  flex: 1;
  height: 3px;
  background: var(--border);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.progress .track i {
  display: block;
  height: 100%;
  background: var(--rose-500);
  border-radius: var(--radius-pill);
  transition: width 0.2s;
}
.progress .n {
  font-size: 12.5px;
  color: var(--text-muted);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.head {
  padding-bottom: 26px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--surface-sunken);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 13px;
  border-radius: var(--radius-pill);
  margin-bottom: 16px;
}
.head h1 {
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.38;
}
.head p {
  color: var(--text-secondary);
  font-size: 14.5px;
  margin-top: 12px;
}
.done {
  color: var(--text-secondary);
  font-size: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.link {
  color: var(--rose-500);
  font-weight: 600;
}
</style>
