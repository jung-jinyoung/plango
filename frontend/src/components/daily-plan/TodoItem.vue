<template>
  <div class="todo-item" :class="{ 'is-dragging': isDragging }">
    <span v-if="draggable" class="drag-handle" aria-hidden="true" @pointerdown="onPointerDown">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="6" r="1.6" /><circle cx="16" cy="6" r="1.6" />
        <circle cx="8" cy="12" r="1.6" /><circle cx="16" cy="12" r="1.6" />
        <circle cx="8" cy="18" r="1.6" /><circle cx="16" cy="18" r="1.6" />
      </svg>
    </span>

    <BaseCheckbox :model-value="todo.done" @update:model-value="$emit('toggle', todo.id)" />

    <span class="title" :class="{ 'is-done': todo.done }">{{ todo.title }}</span>

    <span v-if="todo.estimatedMinutes" class="duration">{{ todo.estimatedMinutes }}분</span>
    <span v-if="todo.deadlineMinutes != null" class="deadline">{{ deadlineLabel }}까지</span>

    <button
      v-if="deletable"
      type="button"
      class="delete-btn"
      aria-label="삭제"
      @click="$emit('delete', todo.id)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { minutesToLabel } from '@/utils/date'
import { usePointerDrag } from '@/composables/usePointerDrag'
import { useDragStore } from '@/stores/drag'

const props = defineProps({
  todo: { type: Object, required: true }, // { id, title, estimatedMinutes, deadlineMinutes, done }
  draggable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
})
defineEmits(['toggle', 'delete'])

const deadlineLabel = computed(() => minutesToLabel(props.todo.deadlineMinutes))

const dragStore = useDragStore()
const isDragging = ref(false)

const { onPointerDown } = usePointerDrag({
  onStart: (e) => {
    isDragging.value = true
    dragStore.start(
      'todo',
      { todoId: props.todo.id, title: props.todo.title, estimatedMinutes: props.todo.estimatedMinutes },
      e,
    )
  },
  onMove: (e) => dragStore.move(e),
  onEnd: () => {
    isDragging.value = false
    dragStore.end()
  },
})
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
}
.drag-handle {
  color: var(--p-ink-faint);
  cursor: grab;
  display: flex;
  flex-shrink: 0;
  touch-action: none;
}
.todo-item.is-dragging {
  opacity: 0.4;
}
.title {
  flex: 1;
  font-size: 0.92rem;
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
.duration,
.deadline {
  font-size: 0.76rem;
  color: var(--p-ink-faint);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.deadline {
  color: var(--p-rose-ink);
  font-weight: 600;
}
.delete-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.delete-btn:hover {
  color: var(--p-rose-ink);
}
</style>
