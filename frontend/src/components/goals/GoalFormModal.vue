<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="form">
      <BaseInput v-model="form.title" label="목표명" placeholder="목표를 입력하세요" />
      <BaseSelect v-model="form.color" label="카테고리 색상" :options="colorOptions" />
      <BaseSelect
        v-if="variant === 'weekly'"
        v-model="form.monthlyGoalId"
        label="연결할 월간 목표"
        :options="monthlyOptions"
      />
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!form.title.trim()" @click="submit">저장</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  variant: { type: String, required: true }, // 'monthly' | 'weekly'
  editingGoal: { type: Object, default: null },
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

const form = reactive({ title: '', color: 'rose', monthlyGoalId: '' })

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
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
  if (!form.title.trim()) return
  emit('save', {
    title: form.title.trim(),
    color: form.color,
    ...(props.variant === 'weekly' ? { monthlyGoalId: form.monthlyGoalId || null } : {}),
  })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>
