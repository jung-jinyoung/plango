<template>
  <div class="tree-wrap">
    <nav class="breadcrumb" aria-label="목표 계층 경로">
      <span :class="{ current: !activeMonthly }">목표 관리</span>
      <template v-if="activeMonthly">
        <span class="sep">›</span>
        <span :class="{ current: !activeWeekly }">{{ activeMonthly.title }}</span>
      </template>
      <template v-if="activeWeekly">
        <span class="sep">›</span>
        <span class="current">{{ activeWeekly.title }}</span>
      </template>
    </nav>

    <p v-if="goalStore.loading && goalStore.monthlyGoals.length === 0" class="empty">불러오는 중…</p>
    <p v-else-if="goalStore.error" class="empty">목표를 불러오지 못했어요.</p>
    <div v-else class="accordion-list">
      <BaseAccordion
        v-for="monthly in goalStore.monthlyGoals"
        :key="monthly.id"
        :model-value="!!expandedMonthly[monthly.id]"
        @update:model-value="toggleMonthly(monthly, $event)"
      >
        <template #header>
          <GoalHeaderRow
            :goal="monthly"
            @edit="openEdit(monthly, 'monthly')"
            @delete="openDelete(monthly, 'monthly')"
          />
        </template>

        <div class="weekly-list">
          <BaseAccordion
            v-for="weekly in weeklyChildrenOf(monthly.id)"
            :key="weekly.id"
            :model-value="!!expandedWeekly[weekly.id]"
            @update:model-value="toggleWeekly(weekly, $event)"
          >
            <template #header>
              <GoalHeaderRow
                :goal="weekly"
                @edit="openEdit(weekly, 'weekly')"
                @delete="openDelete(weekly, 'weekly')"
              />
            </template>

            <div class="todo-list">
              <TodoItem
                v-for="todo in todosOf(weekly.id)"
                :key="todo.id"
                :todo="todo"
                :draggable="false"
                :deletable="false"
                :taggable="false"
                @toggle="todoStore.toggleTodo(todo.dateISO, todo.id)"
              />
              <p v-if="todosOf(weekly.id).length === 0" class="empty">태그된 할 일이 없어요.</p>
            </div>
          </BaseAccordion>
          <p v-if="weeklyChildrenOf(monthly.id).length === 0" class="empty">연결된 주간 목표가 없어요.</p>
        </div>
      </BaseAccordion>

      <div v-if="orphanWeeklyGoals.length > 0" class="orphan-section">
        <p class="orphan-label">미분류 주간 목표 — 월간 목표에 연결되지 않았어요</p>
        <div class="weekly-list">
          <BaseAccordion
            v-for="weekly in orphanWeeklyGoals"
            :key="weekly.id"
            :model-value="!!expandedWeekly[weekly.id]"
            @update:model-value="toggleWeekly(weekly, $event)"
          >
            <template #header>
              <GoalHeaderRow
                :goal="weekly"
                @edit="openEdit(weekly, 'weekly')"
                @delete="openDelete(weekly, 'weekly')"
              />
            </template>

            <div class="todo-list">
              <TodoItem
                v-for="todo in todosOf(weekly.id)"
                :key="todo.id"
                :todo="todo"
                :draggable="false"
                :deletable="false"
                :taggable="false"
                @toggle="todoStore.toggleTodo(todo.dateISO, todo.id)"
              />
              <p v-if="todosOf(weekly.id).length === 0" class="empty">태그된 할 일이 없어요.</p>
            </div>
          </BaseAccordion>
        </div>
      </div>

      <p v-if="goalStore.monthlyGoals.length === 0 && orphanWeeklyGoals.length === 0" class="empty">
        아직 등록된 목표가 없어요.
      </p>
    </div>

    <GoalFormModal
      v-model="showEditForm"
      :variant="editingVariant"
      :editing-goal="editingGoal"
      :submitting="editSubmitting"
      :submit-error="editError"
      @save="handleEditSave"
    />

    <BaseModal v-model="showDeleteConfirm" variant="dialog" title="목표 삭제">
      <p class="confirm-text">
        "{{ deletingGoal?.title }}" 목표를 삭제할까요?
        <template v-if="deletingVariant === 'monthly'">연결된 주간 목표는 미분류 상태로 남아요.</template>
      </p>
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
import { reactive, ref, computed, onMounted, watchEffect } from 'vue'
import BaseAccordion from '@/components/ui/BaseAccordion.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TodoItem from '@/components/daily-plan/TodoItem.vue'
import GoalHeaderRow from './GoalHeaderRow.vue'
import GoalFormModal from './GoalFormModal.vue'
import { useGoalStore } from '@/stores/goals'
import { useTodoStore } from '@/stores/todos'

const props = defineProps({
  initialMonthlyId: { type: String, default: null },
  initialWeeklyId: { type: String, default: null },
})

const goalStore = useGoalStore()
const todoStore = useTodoStore()

onMounted(() => goalStore.load())

const showEditForm = ref(false)
const editingGoal = ref(null)
const editingVariant = ref('monthly')
const editSubmitting = ref(false)
const editError = ref(null)

function openEdit(goal, variant) {
  editingGoal.value = goal
  editingVariant.value = variant
  editError.value = null
  showEditForm.value = true
}

async function handleEditSave(payload) {
  editError.value = null
  editSubmitting.value = true
  try {
    if (editingVariant.value === 'monthly') {
      await goalStore.updateMonthlyGoal(editingGoal.value.id, payload)
    } else {
      await goalStore.updateWeeklyGoal(editingGoal.value.id, payload)
    }
    showEditForm.value = false
  } catch (e) {
    editError.value = e
  } finally {
    editSubmitting.value = false
  }
}

const showDeleteConfirm = ref(false)
const deletingGoal = ref(null)
const deletingVariant = ref('monthly')
const deleting = ref(false)
const deleteError = ref(null)

function openDelete(goal, variant) {
  deletingGoal.value = goal
  deletingVariant.value = variant
  deleteError.value = null
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  deleteError.value = null
  deleting.value = true
  try {
    if (deletingVariant.value === 'monthly') {
      await goalStore.removeMonthlyGoal(deletingGoal.value.id)
    } else {
      await goalStore.removeWeeklyGoal(deletingGoal.value.id)
    }
    showDeleteConfirm.value = false
  } catch (e) {
    deleteError.value = e
  } finally {
    deleting.value = false
  }
}

const expandedMonthly = reactive({})
const expandedWeekly = reactive({})

watchEffect(() => {
  if (props.initialMonthlyId) expandedMonthly[props.initialMonthlyId] = true
  if (props.initialWeeklyId) {
    expandedWeekly[props.initialWeeklyId] = true
    const weekly = goalStore.weeklyGoals.find((w) => w.id === props.initialWeeklyId)
    if (weekly?.monthlyGoalId) expandedMonthly[weekly.monthlyGoalId] = true
  }
})

const activeMonthly = computed(
  () => goalStore.monthlyGoals.find((g) => expandedMonthly[g.id]) ?? null,
)
const activeWeekly = computed(() => goalStore.weeklyGoals.find((g) => expandedWeekly[g.id]) ?? null)

function toggleMonthly(goal, value) {
  expandedMonthly[goal.id] = value
}
function toggleWeekly(goal, value) {
  expandedWeekly[goal.id] = value
}

function weeklyChildrenOf(monthlyId) {
  return goalStore.weeklyGoals.filter((w) => w.monthlyGoalId === monthlyId)
}

const orphanWeeklyGoals = computed(() => goalStore.weeklyGoals.filter((w) => !w.monthlyGoalId))

function todosOf(weeklyId) {
  const result = []
  for (const [dateISO, todos] of Object.entries(todoStore.todosByDate)) {
    for (const todo of todos) {
      if (todo.goalId === weeklyId) result.push({ ...todo, dateISO })
    }
  }
  return result
}
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--p-ink-faint);
  margin-bottom: 20px;
}
.breadcrumb .current {
  color: var(--p-ink);
  font-weight: 600;
}
.sep {
  color: var(--p-ink-faint);
}
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.weekly-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.orphan-section {
  padding-top: 4px;
}
.orphan-label {
  font-size: 0.78rem;
  color: var(--p-ink-faint);
  margin: 0 0 10px;
}
.todo-list {
  display: flex;
  flex-direction: column;
}
.todo-list > :deep(.todo-item) + :deep(.todo-item) {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 6%, transparent);
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.85rem;
  padding: 4px 0;
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
