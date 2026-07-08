<template>
  <BaseModal
    :model-value="modelValue"
    variant="dialog"
    title="오늘 못한 일이 있어요"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="list">
      <TodoItem
        v-for="todo in incompleteTodos"
        :key="todo.id"
        :todo="todo"
        :draggable="false"
        :deletable="false"
        @toggle="$emit('toggle', $event)"
      />
    </div>

    <div v-if="showGoalPicker" class="goal-picker">
      <BaseSelect v-model="selectedGoalId" label="태그할 주간 목표" :options="goalOptions" />
      <BaseButton variant="primary" size="sm" :disabled="!selectedGoalId" @click="confirmTag">
        태그하기
      </BaseButton>
    </div>

    <template #actions>
      <BaseButton variant="ghost" @click="showGoalPicker = !showGoalPicker">주간 목표로</BaseButton>
      <BaseButton variant="secondary" @click="$emit('discard')">삭제</BaseButton>
      <BaseButton variant="primary" @click="$emit('carry-to-tomorrow')">다음 날로</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import TodoItem from './TodoItem.vue'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  incompleteTodos: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'toggle', 'carry-to-tomorrow', 'discard', 'tag-to-goal'])

const goalStore = useGoalStore()
const showGoalPicker = ref(false)
const selectedGoalId = ref('')

const goalOptions = computed(() => goalStore.weeklyGoals.map((g) => ({ label: g.title, value: g.id })))

function confirmTag() {
  if (!selectedGoalId.value) return
  emit('tag-to-goal', { todoIds: props.incompleteTodos.map((t) => t.id), goalId: selectedGoalId.value })
  showGoalPicker.value = false
  selectedGoalId.value = ''
}
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
}
.list > :deep(.todo-item) + :deep(.todo-item) {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 6%, transparent);
}
.goal-picker {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
}
.goal-picker :deep(.field) {
  flex: 1;
}
</style>
