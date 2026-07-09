<template>
  <div>
    <PeriodTabs :tabs="dashboardTabs" aria-label="월/주/일 전환" />
    <div class="monthly-layout">
      <GoalPanel
        title="이번 달 목표"
        :goals="goalStore.monthlyGoals"
        @select="goToGoal"
        @add="showGoalForm = true"
      />
      <MonthCalendarGrid
        :current-date="calendarNav.currentDate"
        @select-day="goToDay"
        @select-week="goToWeek"
      />
    </div>

    <GoalFormModal
      v-model="showGoalForm"
      variant="monthly"
      @save="goalStore.addMonthlyGoal($event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import PeriodTabs from '@/components/shell/PeriodTabs.vue'
import GoalPanel from '@/components/goals/GoalPanel.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import MonthCalendarGrid from '@/components/calendar/MonthCalendarGrid.vue'
import { dashboardTabs } from '@/constants/period-tabs'
import { useGoalStore } from '@/stores/goals'
import { useCalendarNavStore } from '@/stores/calendar-nav'

const router = useRouter()
const goalStore = useGoalStore()
const calendarNav = useCalendarNavStore()
const showGoalForm = ref(false)

function goToDay(dateISO) {
  calendarNav.currentDate = dayjs(dateISO)
  router.push('/app/dashboard/daily')
}

function goToWeek(dateISO) {
  calendarNav.currentDate = dayjs(dateISO)
  router.push('/app/dashboard/weekly')
}

function goToGoal(goalId) {
  router.push({ path: '/app/goals', query: { monthly: goalId } })
}
</script>

<style scoped>
.monthly-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
</style>
