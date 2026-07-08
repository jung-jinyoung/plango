<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    title="오늘 할 일"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="rows">
      <div v-for="(row, i) in rows" :key="row.key" class="row">
        <input
          :ref="(el) => setInputRef(el, i)"
          v-model="row.title"
          type="text"
          class="title-input neu-sunken"
          placeholder="할 일을 입력하세요"
          @keydown.enter.prevent="handleEnter(i)"
        />
        <input
          v-model.number="row.estimatedMinutes"
          type="number"
          min="0"
          step="5"
          class="minutes-input neu-sunken"
          placeholder="분"
          aria-label="예상 소요시간(분)"
        />
        <input
          v-model="row.deadline"
          type="time"
          class="deadline-input neu-sunken"
          aria-label="마감 시각(선택)"
        />
        <button type="button" class="remove-btn" aria-label="줄 삭제" @click="removeRow(i)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <button type="button" class="add-row-btn" @click="addRow()">+ 줄 추가</button>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">취소</BaseButton>
      <BaseButton variant="primary" :disabled="!hasValidRow" @click="submit">AI 추천 받기</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'submit'])

let keyCounter = 0
function blankRow() {
  return { key: keyCounter++, title: '', estimatedMinutes: null, deadline: '' }
}

const rows = ref([blankRow()])
const inputRefs = ref([])

function setInputRef(el, i) {
  inputRefs.value[i] = el
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      rows.value = [blankRow()]
      nextTick(() => inputRefs.value[0]?.focus())
    }
  },
)

const hasValidRow = computed(() => rows.value.some((r) => r.title.trim().length > 0))

function addRow() {
  rows.value.push(blankRow())
  nextTick(() => inputRefs.value[rows.value.length - 1]?.focus())
}

function handleEnter(i) {
  if (i === rows.value.length - 1 && rows.value[i].title.trim()) {
    addRow()
  }
}

function removeRow(i) {
  if (rows.value.length === 1) {
    rows.value[0] = blankRow()
    return
  }
  rows.value.splice(i, 1)
}

function submit() {
  const todos = rows.value
    .filter((r) => r.title.trim().length > 0)
    .map((r) => ({
      title: r.title.trim(),
      estimatedMinutes: r.estimatedMinutes || null,
      deadlineMinutes: toMinutes(r.deadline),
    }))
  emit('submit', todos)
  emit('update:modelValue', false)
}

function toMinutes(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
</script>

<style scoped>
.rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 64px 108px 28px;
  gap: 8px;
  align-items: center;
}
.row input {
  border: none;
  font-family: inherit;
  color: var(--p-ink);
  border-radius: var(--p-radius-xs);
  padding: 10px 12px;
  font-size: 0.88rem;
}
.row input::placeholder {
  color: var(--p-ink-faint);
}
.minutes-input {
  text-align: center;
  padding-left: 4px;
  padding-right: 4px;
}
.remove-btn {
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
}
.remove-btn:hover {
  color: var(--p-rose-ink);
}
.add-row-btn {
  align-self: flex-start;
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-lavender);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 4px;
}
</style>
