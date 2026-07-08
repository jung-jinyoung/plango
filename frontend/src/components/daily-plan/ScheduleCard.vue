<template>
  <div
    class="schedule-card"
    :class="[
      `is-${schedule.categoryColor}`,
      { 'is-completed': schedule.completed, 'is-compact': compact, 'is-dragging': isDragging },
    ]"
  >
    <span v-if="draggable" class="drag-handle" aria-hidden="true" @pointerdown="onPointerDown">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="8" cy="6" r="1.6" /><circle cx="16" cy="6" r="1.6" />
        <circle cx="8" cy="18" r="1.6" /><circle cx="16" cy="18" r="1.6" />
      </svg>
    </span>

    <BaseCheckbox
      :model-value="schedule.completed"
      @update:model-value="$emit('toggle-complete', schedule.id)"
    />

    <div class="body">
      <div class="row-1">
        <span class="time">{{ timeLabel }}</span>
        <span class="title" :class="{ 'is-done': schedule.completed }">{{ schedule.title }}</span>
        <span v-if="schedule.source === 'ai'" class="ai-badge">AI</span>
      </div>
      <p v-if="schedule.reason && !compact" class="reason">{{ schedule.reason }}</p>

      <input
        v-if="schedule.completed && !compact"
        class="note-input"
        type="text"
        placeholder="메모 남기기 (선택)"
        :value="schedule.note"
        @input="$emit('update:note', { id: schedule.id, text: $event.target.value })"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { minutesToLabel } from '@/utils/date'
import { usePointerDrag } from '@/composables/usePointerDrag'
import { useDragStore } from '@/stores/drag'

const props = defineProps({
  schedule: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  draggable: { type: Boolean, default: true },
})
defineEmits(['toggle-complete', 'update:note'])

const timeLabel = computed(
  () =>
    `${minutesToLabel(props.schedule.startMinutes)}–${minutesToLabel(props.schedule.startMinutes + props.schedule.durationMinutes)}`,
)

const dragStore = props.draggable ? useDragStore() : null
const isDragging = ref(false)

const { onPointerDown } = usePointerDrag({
  onStart: (e) => {
    isDragging.value = true
    dragStore.start(
      'schedule',
      {
        scheduleId: props.schedule.id,
        title: props.schedule.title,
        durationMinutes: props.schedule.durationMinutes,
        categoryColor: props.schedule.categoryColor,
      },
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
.schedule-card {
  height: 100%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--p-radius-sm);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  border-left: 3px solid var(--card-accent, var(--p-rose));
  overflow: hidden;
}
.schedule-card.is-rose {
  --card-accent: var(--p-rose);
}
.schedule-card.is-blue {
  --card-accent: var(--p-blue);
}
.schedule-card.is-green {
  --card-accent: var(--p-green);
}
.schedule-card.is-lavender {
  --card-accent: var(--p-lavender);
}
.schedule-card.is-completed {
  opacity: 0.7;
}
.drag-handle {
  color: var(--p-ink-faint);
  cursor: grab;
  flex-shrink: 0;
  margin-top: 3px;
  touch-action: none;
}
.schedule-card.is-dragging {
  opacity: 0.4;
}
.body {
  flex: 1;
  min-width: 0;
}
.row-1 {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.time {
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  flex-shrink: 0;
}
.title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--p-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title.is-done {
  color: var(--p-ink-faint);
  text-decoration: line-through;
}
.ai-badge {
  font-size: 0.62rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;
}
.reason {
  font-size: 0.74rem;
  color: var(--p-ink-faint);
  margin: 2px 0 0;
}
.note-input {
  margin-top: 6px;
  width: 100%;
  border: none;
  background: var(--p-bg);
  border-radius: var(--p-radius-xs);
  padding: 6px 10px;
  font-size: 0.78rem;
  color: var(--p-ink);
  font-family: inherit;
}
.note-input::placeholder {
  color: var(--p-ink-faint);
}
</style>
