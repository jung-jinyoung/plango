<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    :title="goal?.title ?? '목표'"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="goal" class="detail">
      <p v-if="parentLabel" class="parent">{{ parentLabel }}</p>
      <ProgressBar :value="goal.progress" :color="goal.color" show-label />
      <p class="meta">{{ goal.doneCount }}/{{ goal.taskCount }} 완료</p>
    </div>

    <template #actions>
      <BaseButton variant="secondary" size="sm" @click="$emit('delete', goal)">삭제</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="$emit('edit', goal)">수정</BaseButton>
      <BaseButton variant="primary" size="sm" @click="$emit('navigate', goal)">목표 관리로 이동</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // { id, title, progress, color, taskCount, doneCount, monthlyGoalId? }
  goal: { type: Object, default: null },
})
defineEmits(['update:modelValue', 'edit', 'delete', 'navigate'])

const goalStore = useGoalStore()
const parentLabel = computed(() => {
  if (!props.goal || !('monthlyGoalId' in props.goal)) return null
  if (!props.goal.monthlyGoalId) return '상위: 미분류'
  const parent = goalStore.monthlyGoals.find((g) => g.id === props.goal.monthlyGoalId)
  return parent ? `상위: ${parent.title}` : '상위: 미분류'
})
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.parent {
  font-size: 0.82rem;
  color: var(--p-ink-faint);
  margin: 0;
}
.meta {
  font-size: 0.82rem;
  color: var(--p-ink-faint);
  margin: 0;
}
</style>
