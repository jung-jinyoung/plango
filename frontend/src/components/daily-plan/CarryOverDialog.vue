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
        :taggable="false"
        :editable="false"
        @toggle="$emit('toggle', $event)"
      />
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('discard')">삭제</BaseButton>
      <BaseButton variant="primary" @click="$emit('carry-to-tomorrow')">다음 날로</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TodoItem from './TodoItem.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  incompleteTodos: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue', 'toggle', 'carry-to-tomorrow', 'discard'])
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
</style>
