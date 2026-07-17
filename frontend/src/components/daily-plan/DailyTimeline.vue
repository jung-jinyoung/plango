<template>
  <div class="timeline neu-sunken">
    <div class="timeline-scroll">
      <div class="grid" :style="{ height: `${totalHeight}px` }">
        <div class="hours">
          <div v-for="h in hours" :key="h" class="hour-row" :style="{ height: `${pxPerHour}px` }">
            <span class="hour-label">{{ String(h).padStart(2, '0') }}:00</span>
          </div>
        </div>

        <div ref="slotsEl" class="slots">
          <div
            v-for="schedule in schedules"
            :key="schedule.id"
            class="slot"
            :style="slotStyle(schedule)"
          >
            <ScheduleCard
              :schedule="schedule"
              :compact="schedule.durationMinutes * pxPerMinute < REASON_MIN_HEIGHT"
              @toggle-complete="$emit('toggle-complete', $event)"
              @update:note="$emit('update:note', $event)"
            />
          </div>

          <div v-if="ghost" class="ghost-slot" :class="`is-${ghost.categoryColor}`" :style="ghostStyle">
            <span class="ghost-time">{{ ghostTimeLabel }}</span>
            <span class="ghost-title">{{ ghost.title }}</span>
          </div>

          <p v-if="schedules.length === 0 && !ghost" class="empty">
            아직 배치된 일정이 없어요. 할 일을 추가하고 AI 추천을 받아보세요.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ScheduleCard from './ScheduleCard.vue'
import { useDragStore } from '@/stores/drag'
import { minutesToLabel } from '@/utils/date'

const props = defineProps({
  schedules: { type: Array, required: true },
  startHour: { type: Number, default: 6 },
  endHour: { type: Number, default: 24 },
})
const emit = defineEmits(['toggle-complete', 'update:note', 'commit-todo', 'commit-move', 'conflict'])

const pxPerHour = 84
const pxPerMinute = pxPerHour / 60
const MIN_HEIGHT = 36
const REASON_MIN_HEIGHT = 56

const hours = computed(() => {
  const arr = []
  for (let h = props.startHour; h < props.endHour; h++) arr.push(h)
  return arr
})
const totalHeight = computed(() => (props.endHour - props.startHour) * pxPerHour)

function slotStyle(schedule) {
  const top = (schedule.startMinutes - props.startHour * 60) * pxPerMinute
  const height = Math.max(schedule.durationMinutes * pxPerMinute, MIN_HEIGHT)
  return { top: `${top}px`, height: `${height}px` }
}

// ---- 드래그 앤 드롭 (D3) ----
const dragStore = useDragStore()
const slotsEl = ref(null)

function clampStart(start, duration) {
  const min = props.startHour * 60
  const max = props.endHour * 60 - duration
  return Math.min(Math.max(start, min), max)
}

function minutesFromClientY(clientY, duration) {
  const rect = slotsEl.value.getBoundingClientRect()
  const raw = props.startHour * 60 + (clientY - rect.top) / pxPerMinute
  const snapped = Math.round(raw / 15) * 15
  return clampStart(snapped, duration)
}

function isWithinBounds(clientX, clientY) {
  const rect = slotsEl.value.getBoundingClientRect()
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
}

function findLocalConflict(startMinutes, duration, excludeId) {
  const end = startMinutes + duration
  return (
    props.schedules.find(
      (s) => s.id !== excludeId && startMinutes < s.startMinutes + s.durationMinutes && end > s.startMinutes,
    ) ?? null
  )
}

const ghost = computed(() => {
  if (!dragStore.isDragging || !slotsEl.value) return null
  if (!isWithinBounds(dragStore.pointerX, dragStore.pointerY)) return null

  if (dragStore.type === 'todo') {
    const duration = dragStore.payload.estimatedMinutes || 30
    return {
      startMinutes: minutesFromClientY(dragStore.pointerY, duration),
      durationMinutes: duration,
      title: dragStore.payload.title,
      categoryColor: dragStore.payload.categoryColor,
    }
  }
  if (dragStore.type === 'schedule') {
    const duration = dragStore.payload.durationMinutes
    return {
      startMinutes: minutesFromClientY(dragStore.pointerY, duration),
      durationMinutes: duration,
      title: dragStore.payload.title,
      categoryColor: dragStore.payload.categoryColor,
    }
  }
  return null
})

const ghostStyle = computed(() => {
  if (!ghost.value) return {}
  const top = (ghost.value.startMinutes - props.startHour * 60) * pxPerMinute
  const height = Math.max(ghost.value.durationMinutes * pxPerMinute, MIN_HEIGHT)
  return { top: `${top}px`, height: `${height}px` }
})
const ghostTimeLabel = computed(() =>
  ghost.value
    ? `${minutesToLabel(ghost.value.startMinutes)}–${minutesToLabel(ghost.value.startMinutes + ghost.value.durationMinutes)}`
    : '',
)

function handleGlobalPointerUp(e) {
  if (!dragStore.isDragging || !slotsEl.value) return
  if (!isWithinBounds(e.clientX, e.clientY)) return

  const type = dragStore.type
  const payload = dragStore.payload

  if (type === 'todo') {
    const duration = payload.estimatedMinutes || 30
    const startMinutes = minutesFromClientY(e.clientY, duration)
    const conflict = findLocalConflict(startMinutes, duration, null)
    const pending = {
      kind: 'todo',
      todoId: payload.todoId,
      title: payload.title,
      startMinutes,
      durationMinutes: duration,
      categoryColor: payload.categoryColor,
    }
    if (conflict) emit('conflict', { pending, existing: conflict })
    else emit('commit-todo', pending)
  } else if (type === 'schedule') {
    const duration = payload.durationMinutes
    const startMinutes = minutesFromClientY(e.clientY, duration)
    const conflict = findLocalConflict(startMinutes, duration, payload.scheduleId)
    const pending = { kind: 'move', scheduleId: payload.scheduleId, startMinutes, durationMinutes: duration }
    if (conflict) emit('conflict', { pending, existing: conflict })
    else emit('commit-move', pending)
  }
}

onMounted(() => window.addEventListener('pointerup', handleGlobalPointerUp))
onUnmounted(() => window.removeEventListener('pointerup', handleGlobalPointerUp))
</script>

<style scoped>
.timeline {
  padding: 0;
  overflow: hidden;
}
.timeline-scroll {
  max-height: 640px;
  overflow-y: auto;
}
.grid {
  position: relative;
}
.hours {
  position: absolute;
  inset: 0;
}
.hour-row {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  position: relative;
}
.hour-label {
  position: absolute;
  top: -8px;
  left: 12px;
  font-size: 0.7rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  background: var(--p-bg);
  padding: 0 4px;
}
.slots {
  position: absolute;
  top: 0;
  left: 68px;
  right: 12px;
  bottom: 0;
}
.slot {
  position: absolute;
  left: 0;
  right: 0;
}
.empty {
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  padding: 0 24px;
}
.ghost-slot {
  position: absolute;
  left: 0;
  right: 0;
  border-radius: var(--p-radius-sm);
  border: 2px dashed var(--card-accent, var(--p-ink-faint));
  background: color-mix(in srgb, var(--card-accent, var(--p-ink-faint)) 12%, transparent);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  pointer-events: none;
  z-index: 5;
}
.ghost-slot.is-rose {
  --card-accent: var(--p-rose);
}
.ghost-slot.is-blue {
  --card-accent: var(--p-blue);
}
.ghost-slot.is-green {
  --card-accent: var(--p-green);
}
.ghost-slot.is-lavender {
  --card-accent: var(--p-lavender);
}
.ghost-slot.is-amber {
  --card-accent: var(--p-amber);
}
.ghost-slot.is-teal {
  --card-accent: var(--p-teal);
}
.ghost-slot.is-plum {
  --card-accent: var(--p-plum);
}
.ghost-slot.is-slate {
  --card-accent: var(--p-slate);
}
.ghost-time {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--card-accent, var(--p-ink-faint));
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  flex-shrink: 0;
}
.ghost-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--p-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
