<template>
  <div class="composer neu-raised">
    <div v-if="isExpanded" class="composer-options">
      <input
        v-model.number="minutes"
        type="number"
        min="0"
        step="5"
        class="minutes-input neu-sunken"
        placeholder="분"
        aria-label="예상 소요시간(분)"
      />
      <input v-model="deadline" type="time" class="deadline-input neu-sunken" aria-label="마감 시각(선택)" />
      <select
        v-if="goalStore.weeklyGoals.length > 0"
        v-model="goalId"
        class="goal-select neu-sunken"
        aria-label="주간 목표 태그(선택)"
      >
        <option :value="null">목표 없음</option>
        <option v-for="g in goalStore.weeklyGoals" :key="g.id" :value="g.id">{{ g.title }}</option>
      </select>
      <button v-else type="button" class="goal-add-link" @click="showGoalModal = true">+ 목표 추가</button>
      <select
        v-model="categoryColor"
        class="category-select neu-sunken"
        :disabled="!!goalId"
        :title="goalId ? '목표 색상을 사용해요' : ''"
        aria-label="카테고리 태그(선택)"
        @change="categoryTouched = true"
      >
        <option :value="null">카테고리 없음</option>
        <option v-for="c in categoryStore.activeCategories" :key="c.color" :value="c.color">{{ c.name }}</option>
      </select>
    </div>

    <div class="composer-main">
      <input
        ref="inputEl"
        v-model="title"
        type="text"
        class="title-input neu-sunken"
        placeholder="할 일을 입력하세요"
        @keydown.enter.prevent="handleEnter"
        @keydown.esc="resetFields"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
      />
      <button
        type="button"
        class="ai-btn"
        :disabled="!hasUnplacedTodos"
        title="미배치 할 일을 AI가 시간표에 배치해줘요"
        @click="$emit('request-ai')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>
        AI로 배치
      </button>
    </div>
  </div>

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
import GoalFormModal from '@/components/goals/GoalFormModal.vue'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'
import { inferCategoryColor } from '@/utils/todo-color'

defineProps({
  hasUnplacedTodos: { type: Boolean, default: false },
})
const emit = defineEmits(['add-todo', 'request-ai'])

const goalStore = useGoalStore()
const categoryStore = useCategoryStore()

const title = ref('')
const minutes = ref(null)
const deadline = ref('')
const goalId = ref(null)
const categoryColor = ref(null)
const categoryTouched = ref(false)
const isComposing = ref(false)
const inputEl = ref(null)

const showGoalModal = ref(false)
const savingGoal = ref(false)
const goalSaveError = ref(null)

// 제목을 입력하기 시작하면 옵션 행이 확장되고, 비우면(제출/Esc 포함) 다시 한 줄로 접힌다
const isExpanded = computed(() => title.value.trim().length > 0)

// 목표 태그가 없는 동안, 제목으로 카테고리를 자동 추론해 미리 채워준다.
// 사용자가 직접 카테고리를 고르면(categoryTouched) 더는 자동으로 덮어쓰지 않는다.
watch(title, (newTitle) => {
  if (goalId.value || categoryTouched.value) return
  categoryColor.value = inferCategoryColor(newTitle, categoryStore.activeCategories)
})
watch(goalId, (val) => {
  if (!val && !categoryTouched.value) {
    categoryColor.value = inferCategoryColor(title.value, categoryStore.activeCategories)
  }
})

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

// 한글 등 조합형 입력(IME) 중에는 Enter가 조합 확정 목적으로 한 번 더 발화될 수 있어
// isComposing 중엔 무시한다
function handleEnter(e) {
  if (isComposing.value || e.isComposing) return
  submit()
}

function submit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('add-todo', {
    title: trimmed,
    estimatedMinutes: minutes.value || null,
    deadlineMinutes: toMinutes(deadline.value),
    goalId: goalId.value || null,
    categoryColor: goalId.value ? null : categoryColor.value || null,
  })
  resetFields()
  nextTick(() => inputEl.value?.focus())
}

function resetFields() {
  title.value = ''
  minutes.value = null
  deadline.value = ''
  goalId.value = null
  categoryColor.value = null
  categoryTouched.value = false
}

function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
</script>

<style scoped>
.composer {
  position: sticky;
  bottom: 16px;
  z-index: 20;
  margin-top: 14px;
  padding: 10px;
  border-radius: var(--p-radius-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.composer-options {
  display: flex;
  align-items: center;
  gap: 8px;
}
.composer-options input,
.composer-options select {
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  padding: 8px 10px;
  font-size: 0.82rem;
}
.minutes-input {
  width: 56px;
  flex-shrink: 0;
  text-align: center;
  padding-left: 4px;
  padding-right: 4px;
}
.deadline-input {
  width: 100px;
  flex-shrink: 0;
}
.goal-select,
.category-select {
  width: 100px;
  flex: 1;
  min-width: 0;
  font-size: 0.78rem;
}
.category-select:disabled {
  opacity: 0.5;
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
.composer-main {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-input {
  flex: 1;
  min-width: 0;
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  padding: 12px;
  font-size: 0.9rem;
}
.title-input::placeholder {
  color: var(--p-ink-faint);
}
.ai-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  color: #fff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 10px 14px;
  border-radius: var(--p-radius-xs);
  white-space: nowrap;
}
.ai-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
</style>
