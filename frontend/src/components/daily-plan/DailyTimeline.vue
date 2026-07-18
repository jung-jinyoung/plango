<template>
  <div class="timeline neu-raised">
    <div class="timeline-scroll">
      <div class="grid" :style="{ height: `${totalHeight}px` }">
        <div class="hours">
          <div v-for="h in hours" :key="h" class="hour-row" :style="{ height: `${hourRowHeight(h)}px` }">
            <span class="hour-label">{{ String(h).padStart(2, '0') }}:00</span>
          </div>
        </div>

        <div v-if="isToday && nowLineTop !== null" class="now-line" :style="{ top: `${nowLineTop}px` }" />

        <div ref="slotsEl" class="slots">
          <div
            v-for="schedule in schedules"
            :key="schedule.id"
            class="slot"
            :class="slotClass(schedule)"
            :style="slotStyle(schedule)"
          >
            <ScheduleCard
              :schedule="schedule"
              :compact="schedule.durationMinutes * pxPerMinute < REASON_MIN_HEIGHT"
              @toggle-complete="$emit('toggle-complete', $event)"
              @update:note="$emit('update:note', $event)"
              @tag="$emit('tag', $event)"
              @tag-category="$emit('tag-category', $event)"
              @delete="$emit('delete', $event)"
              @move-to-list="$emit('move-to-list', $event)"
              @card-resize="handleCardResize"
            />
            <span
              class="resize-handle resize-top"
              aria-hidden="true"
              @pointerdown="startResize($event, schedule, 'top')"
            />
            <span
              class="resize-handle resize-bottom"
              aria-hidden="true"
              @pointerdown="startResize($event, schedule, 'bottom')"
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
  isToday: { type: Boolean, default: false },
})
const emit = defineEmits([
  'toggle-complete',
  'update:note',
  'tag',
  'tag-category',
  'delete',
  'move-to-list',
  'commit-todo',
  'commit-move',
  'commit-resize',
  'conflict',
])

// 84 -> 112로 확대: 짧은 일정(15~20분)도 체크박스+제목줄 최소 UI가 시간만큼의 높이 안에
// 최대한 들어가도록 (ScheduleCard의 아이콘 컴팩트화와 함께 적용)
const pxPerHour = 112
const pxPerMinute = pxPerHour / 60
const MIN_HEIGHT = 36
const REASON_MIN_HEIGHT = 56
const MIN_DURATION = 15

const hours = computed(() => {
  const arr = []
  for (let h = props.startHour; h < props.endHour; h++) arr.push(h)
  return arr
})

// 각 카드가 실제로 필요로 하는 콘텐츠 높이(id -> px, 카드 패딩 포함) — ScheduleCard가 측정해서 알려줌
const cardNaturalHeight = ref({})

function handleCardResize({ id, naturalHeight }) {
  const next = { ...cardNaturalHeight.value }
  if (naturalHeight > 0) next[id] = naturalHeight
  else delete next[id]
  cardNaturalHeight.value = next
}

// 시간(소요시간)만으로 정해지는 순수 시간 높이 (MIN_HEIGHT 클램프 없음)
function pureTimeHeight(durationMinutes) {
  return durationMinutes * pxPerMinute
}

// 시간 기반 높이 / MIN_HEIGHT / 콘텐츠 실측 높이 중 가장 큰 값 = 이 일정이 실제로 차지하는 높이
function effectiveHeightOf(schedule) {
  const timeHeight = pureTimeHeight(schedule.durationMinutes)
  const natural = cardNaturalHeight.value[schedule.id] || 0
  return Math.max(timeHeight, MIN_HEIGHT, natural)
}

// 순수 시간 높이 대비 실제로 더 필요한 높이(MIN_HEIGHT 클램프분 포함) — 이만큼만 이후 일정들을 밀어낸다
function extraHeightOf(schedule) {
  const timeHeight = pureTimeHeight(schedule.durationMinutes)
  return Math.max(effectiveHeightOf(schedule) - timeHeight, 0)
}

// 주어진 시각(minutes) 이전에 끝나는 일정들의 초과 높이 합 — 그만큼 이후 요소들을 밀어낸다
function displacementBefore(minutes) {
  let extra = 0
  for (const s of props.schedules) {
    const e = extraHeightOf(s)
    if (!e) continue
    if (s.startMinutes + s.durationMinutes <= minutes) extra += e
  }
  return extra
}

const totalExtraHeight = computed(() => props.schedules.reduce((sum, s) => sum + extraHeightOf(s), 0))
const totalHeight = computed(() => (props.endHour - props.startHour) * pxPerHour + totalExtraHeight.value)

// 초과 높이가 발생하는(=일정이 끝나는) 지점이 걸친 시(hour) 행만 그만큼 늘린다 — 일반 문서 흐름이라 이후 행들은 자동으로 밀림
function hourRowHeight(h) {
  let extra = 0
  for (const s of props.schedules) {
    const e = extraHeightOf(s)
    if (!e) continue
    const insertionMinute = s.startMinutes + s.durationMinutes
    if (Math.floor((insertionMinute - 1) / 60) === h) extra += e
  }
  return pxPerHour + extra
}

// 리사이즈 중인 일정의 실시간 미리보기 (드래그 중엔 실제 스토어를 건드리지 않고 여기서만 반영)
const resizePreview = ref(null) // { id, startMinutes, durationMinutes }
const resizingScheduleId = ref(null)

function slotStyle(schedule) {
  const preview = resizePreview.value?.id === schedule.id ? resizePreview.value : null
  const startMinutes = preview?.startMinutes ?? schedule.startMinutes
  const durationMinutes = preview?.durationMinutes ?? schedule.durationMinutes
  const top = (startMinutes - props.startHour * 60) * pxPerMinute + displacementBefore(startMinutes)
  const height = preview
    ? Math.max(durationMinutes * pxPerMinute, MIN_HEIGHT)
    : effectiveHeightOf(schedule)
  return { top: `${top}px`, height: `${height}px` }
}

function slotClass(schedule) {
  const isBeingDragged =
    dragStore.isDragging && dragStore.type === 'schedule' && dragStore.payload?.scheduleId === schedule.id
  const isBeingResized = resizingScheduleId.value === schedule.id
  return { 'no-transition': isBeingDragged || isBeingResized }
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
      goalId: payload.goalId,
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

// ---- 위/아래 가장자리 드래그로 시간 길이 조정 (캘린더 리사이즈) ----
// 다른 일정과 겹치기 직전까지만 허용 — 충돌 모달 없이 조용히 클램프한다
let resizing = null // { id, edge, originalStart, originalEnd }

function clampResize(id, edge, candidateStart, candidateDuration, originalStart, originalEnd) {
  const others = props.schedules.filter((s) => s.id !== id)
  const dayStart = props.startHour * 60
  const dayEnd = props.endHour * 60

  if (edge === 'bottom') {
    let maxEnd = dayEnd
    for (const o of others) {
      if (o.startMinutes >= originalStart) maxEnd = Math.min(maxEnd, o.startMinutes)
    }
    const end = Math.min(originalStart + candidateDuration, maxEnd)
    return { start: originalStart, duration: Math.max(end - originalStart, MIN_DURATION) }
  }

  let minStart = dayStart
  for (const o of others) {
    const oEnd = o.startMinutes + o.durationMinutes
    if (oEnd <= originalEnd) minStart = Math.max(minStart, oEnd)
  }
  const start = Math.max(candidateStart, minStart)
  return { start, duration: Math.max(originalEnd - start, MIN_DURATION) }
}

function startResize(e, schedule, edge) {
  e.preventDefault()
  e.stopPropagation()
  e.target.setPointerCapture?.(e.pointerId)
  resizing = {
    id: schedule.id,
    edge,
    originalStart: schedule.startMinutes,
    originalEnd: schedule.startMinutes + schedule.durationMinutes,
  }
  resizingScheduleId.value = schedule.id
  resizePreview.value = { id: schedule.id, startMinutes: schedule.startMinutes, durationMinutes: schedule.durationMinutes }
  window.addEventListener('pointermove', handleResizeMove)
  window.addEventListener('pointerup', handleResizeEnd)
}

function handleResizeMove(e) {
  if (!resizing || !slotsEl.value) return
  const rect = slotsEl.value.getBoundingClientRect()
  const raw = props.startHour * 60 + (e.clientY - rect.top) / pxPerMinute
  const snapped = Math.round(raw / 15) * 15
  const { id, edge, originalStart, originalEnd } = resizing

  const candidateStart = edge === 'top' ? snapped : originalStart
  const candidateDuration =
    edge === 'bottom' ? Math.max(snapped - originalStart, MIN_DURATION) : originalEnd - snapped

  const clamped = clampResize(id, edge, candidateStart, candidateDuration, originalStart, originalEnd)
  resizePreview.value = { id, startMinutes: clamped.start, durationMinutes: clamped.duration }
}

function handleResizeEnd() {
  window.removeEventListener('pointermove', handleResizeMove)
  window.removeEventListener('pointerup', handleResizeEnd)
  if (resizePreview.value) {
    emit('commit-resize', {
      scheduleId: resizePreview.value.id,
      startMinutes: resizePreview.value.startMinutes,
      durationMinutes: resizePreview.value.durationMinutes,
    })
  }
  resizing = null
  resizingScheduleId.value = null
  resizePreview.value = null
}

onMounted(() => window.addEventListener('pointerup', handleGlobalPointerUp))
onUnmounted(() => window.removeEventListener('pointerup', handleGlobalPointerUp))

// 현재 시각 표시선 (WeekCalendarGrid와 동일 패턴) — 1분 단위로 갱신하기엔 과하니 1분 간격이면 충분
const nowMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())
let nowTimer = null
onMounted(() => {
  nowTimer = setInterval(() => {
    nowMinutes.value = new Date().getHours() * 60 + new Date().getMinutes()
  }, 60000)
})
onUnmounted(() => {
  if (nowTimer) clearInterval(nowTimer)
})
const nowLineTop = computed(() => {
  const min = props.startHour * 60
  const max = props.endHour * 60
  if (nowMinutes.value < min || nowMinutes.value > max) return null
  return (nowMinutes.value - min) * pxPerMinute + displacementBefore(nowMinutes.value)
})
</script>

<style scoped>
.timeline {
  padding: 12px;
}
.timeline-scroll {
  margin-top: 8px;
  padding-top: 12px;
}
.grid {
  position: relative;
  transition: height 200ms ease;
}
.now-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px solid var(--p-rose);
  z-index: 4;
  pointer-events: none;
  transition: top 200ms ease;
}
.now-line::before,
.now-line::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-rose);
}
.now-line::before {
  left: -3px;
}
.now-line::after {
  right: -3px;
}
.hours {
  position: absolute;
  inset: 0;
}
.hour-row {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  position: relative;
  transition: height 200ms ease;
}
.hour-label {
  position: absolute;
  top: -8px;
  left: 12px;
  font-size: 0.7rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  background: var(--p-surface);
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
  transition:
    top 200ms ease,
    height 200ms ease;
}
.slot.no-transition {
  transition: none;
}
.resize-handle {
  position: absolute;
  left: 12px;
  right: 12px;
  height: 8px;
  cursor: ns-resize;
  touch-action: none;
  border-radius: 3px;
  z-index: 3;
}
.resize-handle:hover {
  background: color-mix(in srgb, var(--p-ink) 15%, transparent);
}
.resize-top {
  top: -4px;
}
.resize-bottom {
  bottom: -4px;
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
