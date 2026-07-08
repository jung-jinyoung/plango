<template>
  <div>
    <div class="tabs-row">
      <PeriodTabs :tabs="retrospectiveTabs" aria-label="주간/월간 회고 전환" />
      <router-link to="/app/retrospective/archive" class="archive-link">지난 회고 보기 →</router-link>
    </div>

    <RetroSummaryCard
      class="section"
      :loading="loading"
      :summary="report?.summary ?? ''"
      :completion-rate="report?.completionRate ?? 0"
      color="blue"
    />

    <div class="section neu-raised chart-card">
      <h2>주차별 진행률</h2>
      <BarChart :bars="weeklyBars" />
    </div>

    <div class="cta-row">
      <BaseButton variant="primary" @click="showGoalForm = true">다음 달 목표 설정하러 가기</BaseButton>
    </div>

    <GoalFormModal v-model="showGoalForm" variant="monthly" @save="handleSaveGoal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PeriodTabs from '@/components/shell/PeriodTabs.vue'
import RetroSummaryCard from '@/components/retrospective/RetroSummaryCard.vue'
import BarChart from '@/components/retrospective/BarChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import { retrospectiveTabs } from '@/constants/period-tabs'
import { useRetrospectiveStore } from '@/stores/retrospective'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { useGoalStore } from '@/stores/goals'
import { buildSeedReports } from '@/services/mock/seed-retro-data'

const router = useRouter()
const retrospectiveStore = useRetrospectiveStore()
const calendarNav = useCalendarNavStore()
const goalStore = useGoalStore()
const showGoalForm = ref(false)

const currentKey = computed(() => `month:${calendarNav.currentDate.format('YYYY-MM')}`)
const report = computed(() => retrospectiveStore.reportsByKey[currentKey.value])
const loading = computed(() => !report.value)

function load() {
  retrospectiveStore.loadReport('month', calendarNav.currentDate)
}

onMounted(() => {
  retrospectiveStore.seedReports(buildSeedReports())
  load()
})
watch(currentKey, load)

const weeklyBars = computed(() => report.value?.weeklyBreakdown ?? [])

function handleSaveGoal(payload) {
  goalStore.addMonthlyGoal(payload)
  router.push('/app/dashboard/monthly')
}
</script>

<style scoped>
.tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.archive-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-lavender);
  text-decoration: none;
}
.section {
  margin-top: 20px;
}
.chart-card {
  padding: 24px 28px;
}
.chart-card h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 18px;
}
.cta-row {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>
