<template>
  <div class="record-row">
    <BaseCheckbox :model-value="todo.done" @update:model-value="$emit('toggle', todo.id)" />
    <span class="title" :class="{ 'is-done': todo.done }">{{ todo.title }}</span>
    <select
      class="goal-select neu-sunken"
      :value="todo.goalId || ''"
      @change="$emit('assign-goal', { todoId: todo.id, goalId: $event.target.value || null })"
    >
      <option value="">목표 미태그</option>
      <option v-for="goal in goalStore.weeklyGoals" :key="goal.id" :value="goal.id">{{ goal.title }}</option>
    </select>
  </div>
</template>

<script setup>
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { useGoalStore } from '@/stores/goals'

defineProps({
  todo: { type: Object, required: true },
})
defineEmits(['toggle', 'assign-goal'])

const goalStore = useGoalStore()
</script>

<style scoped>
.record-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
}
.title {
  flex: 1;
  font-size: 0.9rem;
  color: var(--p-ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title.is-done {
  color: var(--p-ink-faint);
  text-decoration: line-through;
}
.goal-select {
  border: none;
  font-family: inherit;
  font-size: 0.76rem;
  color: var(--p-ink-muted);
  padding: 6px 10px;
  border-radius: var(--p-radius-xs);
  max-width: 130px;
  flex-shrink: 0;
}
</style>
