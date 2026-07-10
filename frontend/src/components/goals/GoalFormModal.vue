<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="form">
      <BaseInput v-model="form.title" label="목표명" placeholder="목표를 입력하세요" />
      <BaseSelect v-if="variant === 'monthly'" v-model="form.color" label="카테고리 색상" :options="colorOptions" />

      <div v-if="variant === 'monthly' && newlyAddedColor" class="new-category-row">
        <span class="dot" :class="`is-${newlyAddedColor}`" aria-hidden="true" />
        <BaseInput
          class="name-input"
          :model-value="newCategoryName"
          placeholder="카테고리 이름"
          :maxlength="CATEGORY_NAME_MAX_LENGTH"
          :error="newCategoryNameError"
          @update:model-value="categoryStore.rename(newlyAddedColor, $event)"
        />
      </div>
      <button
        v-else-if="variant === 'monthly'"
        type="button"
        class="add-category-btn"
        :disabled="!categoryStore.hasInactive"
        @click="addNewCategory"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        새 카테고리 추가
      </button>
      <p v-if="variant === 'monthly' && !categoryStore.hasInactive && !newlyAddedColor" class="inherit-hint">
        카테고리가 이미 8개 모두 사용 중이에요. 설정에서 하나를 정리하면 새로 추가할 수 있어요.
      </p>

      <BaseSelect
        v-if="variant === 'weekly'"
        v-model="form.monthlyGoalId"
        label="연결할 월간 목표"
        :options="monthlyOptions"
      />
      <p v-if="variant === 'weekly'" class="inherit-hint">
        카테고리: {{ inheritedCategoryLabel }} — 주간 목표는 연결된 월간 목표의 카테고리를 그대로 따라가요.
      </p>
      <p v-if="submitError" class="submit-error">{{ submitErrorMessage }}</p>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">취소</BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!form.title.trim() || submitting || !!newCategoryNameError"
        @click="submit"
      >
        {{ submitting ? '저장 중…' : '저장' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'
import { CATEGORY_NAME_MAX_LENGTH } from '@/constants/category'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variant: { type: String, required: true }, // 'monthly' | 'weekly'
  editingGoal: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitError: { type: [Object, Error], default: null },
})
const emit = defineEmits(['update:modelValue', 'save'])

const goalStore = useGoalStore()
const categoryStore = useCategoryStore()

const title = computed(() => {
  const noun = props.variant === 'monthly' ? '월간' : '주간'
  return props.editingGoal ? `${noun} 목표 수정` : `이번 ${noun === '월간' ? '달' : '주'} 목표`
})

const colorOptions = computed(() =>
  categoryStore.activeCategories.map((c) => ({ label: c.name, value: c.color })),
)

const monthlyOptions = computed(() => [
  { label: '미분류', value: '' },
  ...goalStore.monthlyGoals.map((g) => ({ label: g.title, value: g.id })),
])

const inheritedCategoryLabel = computed(() => {
  if (!form.monthlyGoalId) return '없음 (미분류)'
  const parent = goalStore.monthlyGoals.find((g) => g.id === form.monthlyGoalId)
  const category = categoryStore.categories.find((c) => c.color === parent?.color)
  return category?.name ?? parent?.color ?? '없음'
})

const submitErrorMessage = computed(
  () => props.submitError?.message || '저장에 실패했어요. 잠시 후 다시 시도해주세요.',
)

const form = reactive({ title: '', color: 'rose', monthlyGoalId: '' })

const newlyAddedColor = ref(null)

const newCategoryName = computed(
  () => categoryStore.categories.find((c) => c.color === newlyAddedColor.value)?.name ?? '',
)

const newCategoryNameError = computed(() => {
  if (!newlyAddedColor.value) return ''
  const name = newCategoryName.value.trim()
  if (!name) return '카테고리 이름을 입력하세요'
  if (categoryStore.isNameTaken(name, newlyAddedColor.value)) return '이미 사용 중인 이름이에요'
  return ''
})

function addNewCategory() {
  const next = categoryStore.categories.find((c) => !c.active)
  if (!next) return
  categoryStore.setActive(next.color, true)
  newlyAddedColor.value = next.color
  form.color = next.color
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    newlyAddedColor.value = null
    if (props.editingGoal) {
      form.title = props.editingGoal.title
      form.color = props.editingGoal.color
      form.monthlyGoalId = props.editingGoal.monthlyGoalId ?? ''
    } else {
      form.title = ''
      form.color = categoryStore.activeCategories[0]?.color ?? 'rose'
      form.monthlyGoalId = ''
    }
  },
)

function submit() {
  if (!form.title.trim() || props.submitting || newCategoryNameError.value) return
  emit('save', {
    title: form.title.trim(),
    color: form.color,
    ...(props.variant === 'weekly' ? { monthlyGoalId: form.monthlyGoalId || null } : {}),
  })
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.inherit-hint {
  margin: -8px 0 0;
  font-size: 0.78rem;
  color: var(--p-ink-faint);
  line-height: 1.5;
}
.submit-error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--p-rose-ink);
}
.new-category-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -8px;
}
.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--dot-color, var(--p-rose));
}
.dot.is-rose {
  --dot-color: var(--p-rose);
}
.dot.is-blue {
  --dot-color: var(--p-blue);
}
.dot.is-green {
  --dot-color: var(--p-green);
}
.dot.is-lavender {
  --dot-color: var(--p-lavender);
}
.dot.is-amber {
  --dot-color: var(--p-amber);
}
.dot.is-teal {
  --dot-color: var(--p-teal);
}
.dot.is-plum {
  --dot-color: var(--p-plum);
}
.dot.is-slate {
  --dot-color: var(--p-slate);
}
.name-input {
  flex: 1;
}
.add-category-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  margin-top: -8px;
  align-self: flex-start;
}
.add-category-btn:disabled {
  color: var(--p-ink-faint);
  cursor: not-allowed;
}
</style>
