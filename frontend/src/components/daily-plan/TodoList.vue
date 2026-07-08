<template>
  <div class="todo-list">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="$emit('toggle', $event)"
      @delete="$emit('delete', $event)"
    />
    <p v-if="todos.length === 0" class="empty">
      오늘 할 일이 없어요. 아래 "+ 할 일 추가"로 자유롭게 적어보세요.
    </p>
  </div>
</template>

<script setup>
import TodoItem from './TodoItem.vue'

defineProps({
  todos: { type: Array, required: true },
})
defineEmits(['toggle', 'delete'])
</script>

<style scoped>
.todo-list {
  display: flex;
  flex-direction: column;
}
.todo-list > :deep(.todo-item) + :deep(.todo-item) {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 6%, transparent);
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  padding: 16px 4px;
  line-height: 1.7;
}
</style>
