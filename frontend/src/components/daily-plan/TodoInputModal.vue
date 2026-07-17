<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    title="오늘 할 일"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="rows">
      <div v-for="(row, i) in rows" :key="row.key" class="row">
        <input
          :ref="(el) => setInputRef(el, i)"
          v-model="row.title"
          type="text"
          class="title-input neu-sunken"
          placeholder="할 일을 입력하세요"
          @keydown.enter.prevent="handleEnter(i, $event)"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
        />
        <input
          v-model.number="row.estimatedMinutes"
          type="number"
          min="0"
          step="5"
          class="minutes-input neu-sunken"
          placeholder="분"
          aria-label="예상 소요시간(분)"
        />
        <input
          v-model="row.deadline"
          type="time"
          class="deadline-input neu-sunken"
          aria-label="마감 시각(선택)"
        />
        <select
          v-if="goalStore.weeklyGoals.length > 0"
          v-model="row.goalId"
          class="goal-select neu-sunken"
          aria-label="주간 목표 태그(선택)"
        >
          <option :value="null">태그 없음</option>
          <option v-for="g in goalStore.weeklyGoals" :key="g.id" :value="g.id">{{ g.title }}</option>
        </select>
        <button v-else type="button" class="goal-add-link" @click="showGoalModal = true">
          + 목표 추가
        </button>
        <button type="button" class="remove-btn" aria-label="줄 삭제" @click="removeRow(i)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <button type="button" class="add-row-btn" @click="addRow()">+ 줄 추가</button>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!hasValidRow" @click="submit">AI 추천 받기</BaseButton>
    </template>
  </BaseModal>

  <GoalFormModal
    v-model="showGoalModal"
    variant="weekly"
    :submitting="savingGoal"
    :submit-error="goalSaveError"
    @save="handleSaveGoal"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const goalStore = useGoalStore()
const showGoalModal = ref(false)
const savingGoal = ref(false)
const goalSaveError = ref(null)

async function handleSaveGoal(payload) {
  goalSaveError.value = null
  savingGoal.value = true
  try {
    await goalStore.addWeeklyGoal(payload)
    showGoalModal.value = false
  } catch (e) {
    goalSaveError.value = e
  } finally {
    savingGoal.value = false
  }
}

let keyCounter = 0
function blankRow() {
  return { key: keyCounter++, title: '', estimatedMinutes: null, deadline: '', goalId: null }
}

const rows = ref([blankRow()])
const inputRefs = ref([])
const isComposing = ref(false)

function setInputRef(el, i) {
  inputRefs.value[i] = el
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      rows.value = [blankRow()]
      goalStore.load()
      nextTick(() => inputRefs.value[0]?.focus())
    }
  },
)

const hasValidRow = computed(() => rows.value.some((r) => r.title.trim().length > 0))

function addRow() {
  rows.value.push(blankRow())
  nextTick(() => inputRefs.value[rows.value.length - 1]?.focus())
}

// 한글 등 조합형 입력(IME) 중에는 Enter가 조합 확정 목적으로 한 번 더 발화될 수 있어
// isComposing 중엔 무시한다 — 안 그러면 빈 줄이 중복으로 추가됨
function handleEnter(i, e) {
  if (isComposing.value || e.isComposing) return
  if (i === rows.value.length - 1 && rows.value[i].title.trim()) {
    addRow()
  }
}

function removeRow(i) {
  if (rows.value.length === 1) {
    rows.value[0] = blankRow()
    return
  }
  rows.value.splice(i, 1)
}

function submit() {
  const todos = rows.value
    .filter((r) => r.title.trim().length > 0)
    .map((r) => ({
      title: r.title.trim(),
      estimatedMinutes: r.estimatedMinutes || null,
      deadlineMinutes: toMinutes(r.deadline),
      goalId: r.goalId || null,
    }))
  emit('submit', todos)
  emit('update:modelValue', false)
}

function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
</script>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.row input,
.row select {
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  padding: 10px 12px;
  font-size: 0.88rem;
}
.title-input {
  flex: 1;
  min-width: 0;
}
.row input::placeholder {
  color: var(--p-ink-faint);
}
.minutes-input {
  width: 64px;
  flex-shrink: 0;
  text-align: center;
  padding-left: 4px;
  padding-right: 4px;
}
.deadline-input {
  width: 108px;
  flex-shrink: 0;
}
.goal-select {
  width: 100px;
  flex-shrink: 0;
  font-size: 0.8rem;
}
.goal-add-link {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 6px 8px;
  flex-shrink: 0;
  white-space: nowrap;
}
.remove-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove-btn:hover {
  color: var(--p-rose-ink);
}
.add-row-btn {
  align-self: flex-start;
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 4px;
}
</style>
