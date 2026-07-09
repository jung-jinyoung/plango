<template>
  <div>
    <div class="weekly-layout">
      <GoalPanel
        title="이번 주 목표"
        :goals="goalStore.weeklyGoals"
        @select="goToGoal"
        @add="showGoalForm = true"
      />
      <WeekCalendarGrid :current-date="calendarNav.currentDate" @select-day="goToDay" />
    </div>

    <GoalFormModal
      v-model="showGoalForm"
      variant="weekly"
      @save="goalStore.addWeeklyGoal($event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import GoalPanel from '@/components/goals/GoalPanel.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import WeekCalendarGrid from '@/components/calendar/WeekCalendarGrid.vue'
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

function goToGoal(goalId) {
  router.push({ path: '/app/goals', query: { weekly: goalId } })
}
</script>

<style scoped>
.weekly-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
</style>
