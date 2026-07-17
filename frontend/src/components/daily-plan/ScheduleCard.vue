<template>
  <div
    class="schedule-card"
    :class="[
      `is-${schedule.categoryColor}`,
      {
        'is-completed': schedule.completed,
        'is-compact': compact,
        'is-dragging': isDragging,
      },
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

        <select
          v-if="showPicker"
          ref="pickerEl"
          class="tag-picker"
          :value="schedule.goalId ?? ''"
          @change="handlePick($event.target.value)"
          @blur="showPicker = false"
        >
          <option value="">태그 해제</option>
          <option v-for="g in goalStore.weeklyGoals" :key="g.id" :value="g.id">{{ g.title }}</option>
        </select>
        <button
          v-else-if="taggedGoal"
          type="button"
          class="tag-chip"
          :class="`is-${taggedGoal.color}`"
          :title="taggedGoal.title"
          :aria-label="`태그: ${taggedGoal.title}`"
          @click="openPicker"
        >
          <span class="dot" aria-hidden="true" />
        </button>
        <button v-else type="button" class="tag-add" @click="openPicker">+ 태그</button>

        <button type="button" class="move-btn" aria-label="할 일 목록으로 이동" @click="$emit('move-to-list', schedule.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <button type="button" class="delete-btn" aria-label="삭제" @click="$emit('delete', schedule.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>
      <p v-if="schedule.reason && !compact" class="reason">{{ schedule.reason }}</p>

      <div class="note-row">
        <textarea
          v-if="noteEditing"
          ref="noteInputEl"
          class="note-input"
          rows="1"
          placeholder="메모 남기기 (선택)"
          :value="schedule.note"
          @input="handleNoteInput"
          @blur="finishEditNote"
        />

        <div v-else-if="schedule.note" class="note-box">
          <p class="note-label">memo</p>
          <div class="note-line">
            <p ref="noteTextEl" class="note-text" :class="{ 'is-collapsed': !noteExpanded }">{{ schedule.note }}</p>
            <div class="note-icons">
              <button
                v-if="!noteExpanded"
                type="button"
                class="note-icon-btn"
                aria-label="펼치기"
                @click="expandNote"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <template v-else>
                <button type="button" class="note-icon-btn" aria-label="수정" @click="startEditNote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button type="button" class="note-icon-btn" aria-label="메모 삭제" @click="deleteNote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>
                <button type="button" class="note-icon-btn" aria-label="접기" @click="collapseNote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 15 12 9l-6 6" />
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </div>

        <button v-else type="button" class="note-add" @click="startEditNote">+ 메모</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { minutesToLabel } from '@/utils/date'
import { usePointerDrag } from '@/composables/usePointerDrag'
import { useDragStore } from '@/stores/drag'
import { useGoalStore } from '@/stores/goals'

const props = defineProps({
  schedule: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  draggable: { type: Boolean, default: true },
})
const emit = defineEmits([
  'toggle-complete',
  'update:note',
  'tag',
  'delete',
  'move-to-list',
  'note-resize',
])

const timeLabel = computed(
  () =>
    `${minutesToLabel(props.schedule.startMinutes)}–${minutesToLabel(props.schedule.startMinutes + props.schedule.durationMinutes)}`,
)

const goalStore = useGoalStore()
const taggedGoal = computed(
  () => goalStore.weeklyGoals.find((g) => g.id === props.schedule.goalId) ?? null,
)

const showPicker = ref(false)
const pickerEl = ref(null)

function openPicker() {
  showPicker.value = true
  nextTick(() => pickerEl.value?.focus())
}

function handlePick(value) {
  emit('tag', { id: props.schedule.id, goalId: value || null })
  showPicker.value = false
}

const noteEditing = ref(false)
const noteExpanded = ref(false)
const noteInputEl = ref(null)
const noteTextEl = ref(null)

// 기본 1줄 높이에서 내용이 늘어나는 만큼만 자연스럽게 커지도록
function autoGrowNote(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// 펼쳤을 때(편집 중이면 textarea, 아니면 본문 텍스트) 실제로 필요한 추가 높이(1줄 기준 초과분)를
// 측정해서 타임라인 슬롯에 알려준다 — 타임라인이 그 시간대 간격 자체를 늘려서 다른 일정을 밀어내는 데 씀
function reportNoteExtraHeight() {
  if (!noteExpanded.value) {
    emit('note-resize', { id: props.schedule.id, extraHeight: 0 })
    return
  }
  const el = noteEditing.value ? noteInputEl.value : noteTextEl.value
  if (!el) {
    emit('note-resize', { id: props.schedule.id, extraHeight: 0 })
    return
  }
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 16
  const extraHeight = Math.max(el.scrollHeight - lineHeight, 0)
  emit('note-resize', { id: props.schedule.id, extraHeight })
}

function expandNote() {
  noteExpanded.value = true
  nextTick(reportNoteExtraHeight)
}

function collapseNote() {
  noteExpanded.value = false
  reportNoteExtraHeight()
}

function startEditNote() {
  noteEditing.value = true
  nextTick(() => {
    noteInputEl.value?.focus()
    autoGrowNote(noteInputEl.value)
    reportNoteExtraHeight()
  })
}

function finishEditNote() {
  noteEditing.value = false
  nextTick(reportNoteExtraHeight)
}

function handleNoteInput(e) {
  emit('update:note', { id: props.schedule.id, text: e.target.value })
  autoGrowNote(e.target)
  reportNoteExtraHeight()
}

function deleteNote() {
  emit('update:note', { id: props.schedule.id, text: '' })
  noteExpanded.value = false
  reportNoteExtraHeight()
}

// 안전망: 위 명시적 호출 외에 상태가 바뀌는 경우(예: 외부에서 note가 갱신되는 경우)를 대비
watch(
  [noteExpanded, noteEditing, () => props.schedule.note],
  () => nextTick(reportNoteExtraHeight),
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
  border-left: 3px solid var(--card-accent, transparent);
  position: relative;
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
.schedule-card.is-amber {
  --card-accent: var(--p-amber);
}
.schedule-card.is-teal {
  --card-accent: var(--p-teal);
}
.schedule-card.is-plum {
  --card-accent: var(--p-plum);
}
.schedule-card.is-slate {
  --card-accent: var(--p-slate);
}
.schedule-card.is-completed {
  opacity: 0.7;
  z-index: 2;
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
  align-items: center;
  gap: 6px;
}
.time {
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  flex-shrink: 0;
}
.title {
  flex: 1;
  min-width: 0;
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
.note-row {
  margin-top: 6px;
}
.note-input {
  display: block;
  width: 100%;
  border: none;
  background: var(--p-bg);
  border-radius: var(--p-radius-xs);
  padding: 6px 10px;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--p-ink);
  font-family: inherit;
  resize: none;
  overflow: hidden;
}
.note-input::placeholder {
  color: var(--p-ink-faint);
}
.note-box {
  padding: 4px 8px;
  border-radius: var(--p-radius-xs);
  background: color-mix(in srgb, var(--card-accent, var(--p-ink-faint)) 45%, white);
}
.note-label {
  margin: 0 0 2px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-ink);
  opacity: 0.65;
}
.note-line {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.note-text {
  flex: 1;
  min-width: 0;
  margin: 0;
  color: var(--p-ink);
  font-size: 0.76rem;
  font-family: inherit;
  line-height: 1.35;
  white-space: pre-line;
  overflow-wrap: break-word;
}
.note-text.is-collapsed {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.note-icons {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.note-icon-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink);
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.note-icon-btn:hover {
  color: var(--p-ink);
  background: rgba(255, 255, 255, 0.6);
}
.note-add {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}
.note-add:hover {
  color: var(--p-lavender);
  background: var(--p-bg);
}
.tag-picker {
  border: none;
  border-radius: var(--p-radius-xs);
  background: var(--p-bg);
  color: var(--p-ink);
  font-family: inherit;
  font-size: 0.72rem;
  padding: 3px 6px;
  max-width: 90px;
  flex-shrink: 0;
}
.tag-add {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}
.tag-add:hover {
  color: var(--p-lavender);
  background: var(--p-bg);
}
.tag-chip {
  appearance: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--chip-color, var(--p-rose)) 16%, var(--p-surface));
  flex-shrink: 0;
}
.tag-chip .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color, var(--p-rose));
  flex-shrink: 0;
}
.tag-chip.is-rose {
  --chip-color: var(--p-rose);
}
.tag-chip.is-amber {
  --chip-color: var(--p-amber);
}
.tag-chip.is-green {
  --chip-color: var(--p-green);
}
.tag-chip.is-teal {
  --chip-color: var(--p-teal);
}
.tag-chip.is-blue {
  --chip-color: var(--p-blue);
}
.tag-chip.is-lavender {
  --chip-color: var(--p-lavender);
}
.tag-chip.is-plum {
  --chip-color: var(--p-plum);
}
.tag-chip.is-slate {
  --chip-color: var(--p-slate);
}
.move-btn,
.delete-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.move-btn:hover {
  color: var(--p-lavender);
}
.delete-btn:hover {
  color: var(--p-rose-ink);
}
</style>
