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

    <template v-if="!isEditing">
      <span class="title" :class="{ 'is-done': todo.done }">{{ todo.title }}</span>

      <span v-if="todo.estimatedMinutes" class="duration">{{ todo.estimatedMinutes }}분</span>
      <span v-if="todo.deadlineMinutes != null" class="deadline">{{ deadlineLabel }}까지</span>

      <select
        v-if="taggable && showPicker"
        ref="pickerEl"
        class="tag-picker"
        :value="pickerValue"
        @change="handlePick($event.target.value)"
        @blur="showPicker = false"
      >
        <option value="">태그 해제</option>
        <optgroup label="목표">
          <option v-for="g in goalStore.weeklyGoals" :key="g.id" :value="`goal:${g.id}`">{{ g.title }}</option>
        </optgroup>
        <optgroup label="카테고리">
          <option v-for="c in categoryStore.activeCategories" :key="c.color" :value="`category:${c.color}`">
            {{ c.name }}
          </option>
        </optgroup>
      </select>
      <button
        v-else-if="taggable && taggedGoal"
        type="button"
        class="tag-chip"
        :class="`is-${taggedGoal.color}`"
        :title="taggedGoal.title"
        :aria-label="`태그: ${taggedGoal.title}`"
        @click="openPicker"
      >
        <span class="dot" aria-hidden="true" />
      </button>
      <button
        v-else-if="taggable && taggedCategory"
        type="button"
        class="tag-chip"
        :class="`is-${taggedCategory.color}`"
        :title="taggedCategory.name"
        :aria-label="`태그: ${taggedCategory.name}`"
        @click="openPicker"
      >
        <span class="dot" aria-hidden="true" />
      </button>
      <button v-else-if="taggable" type="button" class="tag-add" @click="openPicker">+ 태그</button>

      <button v-if="editable" type="button" class="edit-btn" aria-label="수정" @click="startEdit">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>

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
    </template>

    <template v-else>
      <input
        ref="editTitleEl"
        v-model="editTitle"
        type="text"
        class="edit-title-input"
        @keydown.enter="saveEdit"
        @keydown.esc="cancelEdit"
      />
      <input
        v-model.number="editMinutes"
        type="number"
        min="0"
        step="5"
        class="edit-minutes-input"
        placeholder="분"
        @keydown.enter="saveEdit"
        @keydown.esc="cancelEdit"
      />
      <button type="button" class="save-btn" aria-label="저장" @click="saveEdit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </button>
      <button type="button" class="cancel-btn" aria-label="취소" @click="cancelEdit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import { minutesToLabel } from '@/utils/date'
import { usePointerDrag } from '@/composables/usePointerDrag'
import { useDragStore } from '@/stores/drag'
import { useGoalStore } from '@/stores/goals'
import { useCategoryStore } from '@/stores/categories'
import { resolveTodoColor } from '@/utils/todo-color'

const props = defineProps({
  todo: { type: Object, required: true }, // { id, title, estimatedMinutes, deadlineMinutes, done, goalId, categoryColor }
  draggable: { type: Boolean, default: true },
  deletable: { type: Boolean, default: true },
  taggable: { type: Boolean, default: true },
  editable: { type: Boolean, default: true },
})
const emit = defineEmits(['toggle', 'delete', 'tag', 'tag-category', 'update'])

const deadlineLabel = computed(() => minutesToLabel(props.todo.deadlineMinutes))

const goalStore = useGoalStore()
const categoryStore = useCategoryStore()
const taggedGoal = computed(
  () => goalStore.weeklyGoals.find((g) => g.id === props.todo.goalId) ?? null,
)
// 목표 태그가 없을 때만 카테고리 칩을 보여준다 — 목표가 카테고리보다 우선
const taggedCategory = computed(() =>
  taggedGoal.value
    ? null
    : (categoryStore.activeCategories.find((c) => c.color === props.todo.categoryColor) ?? null),
)
const pickerValue = computed(() => {
  if (props.todo.goalId) return `goal:${props.todo.goalId}`
  if (props.todo.categoryColor) return `category:${props.todo.categoryColor}`
  return ''
})

const showPicker = ref(false)
const pickerEl = ref(null)

function openPicker() {
  showPicker.value = true
  nextTick(() => pickerEl.value?.focus())
}

function handlePick(value) {
  if (!value) {
    if (taggedGoal.value) emit('tag', { id: props.todo.id, goalId: null })
    else emit('tag-category', { id: props.todo.id, categoryColor: null })
    showPicker.value = false
    return
  }
  const [kind, val] = value.split(':')
  if (kind === 'goal') emit('tag', { id: props.todo.id, goalId: val })
  else emit('tag-category', { id: props.todo.id, categoryColor: val })
  showPicker.value = false
}

const isEditing = ref(false)
const editTitle = ref('')
const editMinutes = ref(null)
const editTitleEl = ref(null)

function startEdit() {
  editTitle.value = props.todo.title
  editMinutes.value = props.todo.estimatedMinutes
  isEditing.value = true
  nextTick(() => editTitleEl.value?.focus())
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title) return
  emit('update', { id: props.todo.id, title, estimatedMinutes: editMinutes.value || null })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

const dragStore = useDragStore()
const isDragging = ref(false)

const { onPointerDown } = usePointerDrag({
  onStart: (e) => {
    isDragging.value = true
    dragStore.start(
      'todo',
      {
        todoId: props.todo.id,
        title: props.todo.title,
        estimatedMinutes: props.todo.estimatedMinutes,
        categoryColor: resolveTodoColor(props.todo, goalStore.weeklyGoals),
        goalId: props.todo.goalId ?? null,
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
.tag-picker {
  border: none;
  border-radius: var(--p-radius-xs);
  background: var(--p-bg);
  color: var(--p-ink);
  font-family: inherit;
  font-size: 0.72rem;
  padding: 4px 8px;
  max-width: 120px;
  flex-shrink: 0;
}
.tag-add {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-faint);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  flex-shrink: 0;
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
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--chip-color, var(--p-rose)) 16%, var(--p-surface));
  flex-shrink: 0;
}
.tag-chip .dot {
  width: 8px;
  height: 8px;
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
.edit-btn {
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
.edit-btn:hover {
  color: var(--p-lavender);
}
.edit-title-input,
.edit-minutes-input {
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  background: var(--p-bg);
  padding: 6px 10px;
  font-size: 0.9rem;
}
.edit-title-input {
  flex: 1;
  min-width: 0;
}
.edit-minutes-input {
  width: 56px;
  flex-shrink: 0;
  text-align: center;
  padding-left: 4px;
  padding-right: 4px;
}
.save-btn,
.cancel-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.save-btn {
  color: var(--p-green-ink, var(--p-green));
}
.save-btn:hover {
  background: var(--p-bg);
}
.cancel-btn {
  color: var(--p-ink-faint);
}
.cancel-btn:hover {
  color: var(--p-rose-ink);
}
</style>
