<template>
  <div class="todo-list">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @toggle="$emit('toggle', $event)"
      @delete="$emit('delete', $event)"
      @tag="$emit('tag', $event)"
    />
    <p v-if="todos.length === 0 && !isAdding" class="empty">오늘 할 일이 없어요.</p>

    <input
      v-if="isAdding"
      ref="inputEl"
      v-model="newTitle"
      type="text"
      class="quick-add-input neu-sunken"
      placeholder="할 일을 입력하고 Enter (예: 독서하기/60/1)"
      @keydown.enter.prevent="handleEnter"
      @keydown.esc.prevent="cancelAdd"
      @compositionstart="isComposing = true"
      @compositionend="isComposing = false"
      @blur="cancelAdd"
    />
    <button v-else type="button" class="quick-add-btn" @click="startAdd">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14" /></svg>
      할 일 추가
    </button>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import TodoItem from './TodoItem.vue'

defineProps({
  todos: { type: Array, required: true },
})
const emit = defineEmits(['toggle', 'delete', 'tag', 'add'])

const isAdding = ref(false)
const newTitle = ref('')
const inputEl = ref(null)
const isComposing = ref(false)

function startAdd() {
  isAdding.value = true
  nextTick(() => inputEl.value?.focus())
}

// 한글 등 조합형 입력(IME) 중에는 Enter가 조합 확정 목적으로 한 번 더 발화될 수 있어
// isComposing 중엔 무시한다 — 안 그러면 "독서하기"가 "독서하"/"독서기"로 두 번 추가됨
function handleEnter(e) {
  if (isComposing.value || e.isComposing) return
  submitAdd()
}

function submitAdd() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('add', title)
  newTitle.value = ''
  nextTick(() => inputEl.value?.focus())
}

function cancelAdd() {
  isAdding.value = false
  newTitle.value = ''
}
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
.quick-add-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  color: var(--p-lavender);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 10px 4px;
  margin-top: 12px;
  border-radius: var(--p-radius-xs);
}
.quick-add-btn:hover {
  background: var(--p-bg);
}
.quick-add-input {
  width: 100%;
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  padding: 12px;
  margin-top: 12px;
  font-size: 0.9rem;
}
.quick-add-input::placeholder {
  color: var(--p-ink-faint);
}
</style>
