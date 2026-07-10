<template>
  <div>
    <div class="weekly-layout">
      <GoalPanel
        title="이번 주 목표"
        :goals="goalStore.weeklyGoals"
        :loading="goalStore.loading"
        :error="goalStore.error"
        @select="goToGoal"
        @add="showGoalForm = true"
      />
      <WeekCalendarGrid :current-date="calendarNav.currentDate" @select-day="goToDay" />
    </div>

    <GoalFormModal
      v-model="showGoalForm"
      variant="weekly"
      :submitting="saving"
      :submit-error="formError"
      @save="handleSaveWeeklyGoal"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
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
const formError = ref(null)
const saving = ref(false)

onMounted(() => goalStore.load())

async function handleSaveWeeklyGoal(payload) {
  formError.value = null
  saving.value = true
  try {
    await goalStore.addWeeklyGoal(payload)
    showGoalForm.value = false
  } catch (e) {
    formError.value = e
  } finally {
    saving.value = false
  }
}

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
