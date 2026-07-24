<template>
  <div>
    <div class="weekly-layout">
      <GoalPanel
        title="이번 주 목표"
        :goals="goalStore.weeklyGoals"
        :loading="goalStore.loading"
        :error="goalStore.error"
        :selected-goal-id="selectedGoalId"
        @select="toggleSelectedGoal"
        @add="showGoalForm = true"
        @details="openGoalDetail"
      />
      <WeekCalendarGrid
        :current-date="calendarNav.currentDate"
        :selected-goal-id="selectedGoalId"
        @select-day="goToDay"
      />
    </div>

    <GoalFormModal
      v-model="showGoalForm"
      variant="weekly"
      :submitting="saving"
      :submit-error="formError"
      @save="handleSaveWeeklyGoal"
    />

    <GoalDetailModal
      v-model="showGoalDetail"
      :goal="detailGoal"
      @edit="openEdit"
      @delete="openDelete"
      @navigate="navigateToGoal"
    />

    <GoalFormModal
      v-model="showEditForm"
      variant="weekly"
      :editing-goal="editingGoal"
      :submitting="editSubmitting"
      :submit-error="editError"
      @save="handleEditSave"
    />

    <BaseModal v-model="showDeleteConfirm" variant="dialog" title="목표 삭제">
      <p class="confirm-text">"{{ deletingGoal?.title }}" 목표를 삭제할까요?</p>
      <p v-if="deleteError" class="submit-error">{{ deleteError.message || '삭제에 실패했어요.' }}</p>
      <template #actions>
        <BaseButton variant="secondary" :disabled="deleting" @click="showDeleteConfirm = false">취소</BaseButton>
        <BaseButton variant="primary" :disabled="deleting" @click="confirmDelete">
          {{ deleting ? '삭제 중…' : '삭제' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import GoalPanel from '@/components/goals/GoalPanel.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import GoalDetailModal from '@/components/goals/GoalDetailModal.vue'
import WeekCalendarGrid from '@/components/calendar/WeekCalendarGrid.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useGoalStore } from '@/stores/goals'
import { useCalendarNavStore } from '@/stores/calendar-nav'

const router = useRouter()
const goalStore = useGoalStore()
const calendarNav = useCalendarNavStore()
const showGoalForm = ref(false)
const formError = ref(null)
const saving = ref(false)
const selectedGoalId = ref(null)

const showGoalDetail = ref(false)
const detailGoal = ref(null)

const showEditForm = ref(false)
const editingGoal = ref(null)
const editSubmitting = ref(false)
const editError = ref(null)

const showDeleteConfirm = ref(false)
const deletingGoal = ref(null)
const deleting = ref(false)
const deleteError = ref(null)

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

function toggleSelectedGoal(goalId) {
  selectedGoalId.value = selectedGoalId.value === goalId ? null : goalId
}

// 목표 카드 바깥을 클릭하면 필터를 해제한다 (카드 자체 클릭은 toggleSelectedGoal이 이미 처리)
function clearSelectionOnOutsideClick(event) {
  if (!event.target.closest('.goal-card')) selectedGoalId.value = null
}
onMounted(() => document.addEventListener('click', clearSelectionOnOutsideClick))
onUnmounted(() => document.removeEventListener('click', clearSelectionOnOutsideClick))

function openGoalDetail(goalId) {
  detailGoal.value = goalStore.weeklyGoals.find((g) => g.id === goalId) ?? null
  showGoalDetail.value = true
}

function openEdit(goal) {
  showGoalDetail.value = false
  editingGoal.value = goal
  editError.value = null
  showEditForm.value = true
}

async function handleEditSave(payload) {
  editError.value = null
  editSubmitting.value = true
  try {
    await goalStore.updateWeeklyGoal(editingGoal.value.id, payload)
    showEditForm.value = false
  } catch (e) {
    editError.value = e
  } finally {
    editSubmitting.value = false
  }
}

function openDelete(goal) {
  showGoalDetail.value = false
  deletingGoal.value = goal
  deleteError.value = null
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  deleteError.value = null
  deleting.value = true
  try {
    await goalStore.removeWeeklyGoal(deletingGoal.value.id)
    if (selectedGoalId.value === deletingGoal.value.id) selectedGoalId.value = null
    showDeleteConfirm.value = false
  } catch (e) {
    deleteError.value = e
  } finally {
    deleting.value = false
  }
}

function navigateToGoal(goal) {
  showGoalDetail.value = false
  router.push({ path: '/app/goals', query: { weekly: goal.id } })
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
.confirm-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--p-ink);
  line-height: 1.6;
}
.submit-error {
  margin: 10px 0 0;
  font-size: 0.8rem;
  color: var(--p-rose-ink);
}
</style>
