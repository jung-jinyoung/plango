<template>
  <div class="today-task-intake">
    <TaskInputPreview :key="inputKey" :candidate-goals="props.candidateGoals" @update:parsed="onParsed" />
    <div class="add-row">
      <BaseButton variant="ghost" :disabled="!canQueue" @click="queueCurrent">할 일 추가</BaseButton>
    </div>

    <ul v-if="queued.length > 0" class="queue">
      <li v-for="(item, i) in queued" :key="i" class="queue-item">
        <span class="title">{{ item.title }}</span>
        <span v-if="item.estimatedMin !== null" class="min">{{ item.estimatedMin }}분</span>
        <button type="button" class="remove" aria-label="빼기" @click="remove(i)">✕</button>
      </li>
    </ul>

    <BaseButton variant="primary" :disabled="queued.length === 0" @click="confirm">오늘 할 일로 확정</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WeeklyGoal } from '../../../entities/types'
import type { ParsedTaskInput } from '../lib/parse'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import TaskInputPreview from './TaskInputPreview.vue'

const props = defineProps<{
  candidateGoals: WeeklyGoal[]
}>()

const emit = defineEmits<{
  confirm: [tasks: { title: string; estimatedMin: number | null; weeklyGoalId: string | null }[]]
}>()

// TaskInputPreview는 v-model 없이 내부 text를 스스로 들고 있어서, 항목을 큐에
// 넣은 뒤 입력창을 비우려면 key를 바꿔 재마운트한다(기존 컴포넌트는 안 건드림).
const inputKey = ref(0)
const currentParsed = ref<ParsedTaskInput | null>(null)
const queued = ref<{ title: string; estimatedMin: number | null; weeklyGoalId: string | null }[]>([])

// 예상 시간은 사용자가 입력한다(CLAUDE.md 7절 R7) — 비어 있으면 큐에 넣지 않는다.
const canQueue = computed(
  () => !!currentParsed.value?.title && currentParsed.value?.estimatedMin !== null,
)

function onParsed(value: ParsedTaskInput) {
  currentParsed.value = value
}

function queueCurrent() {
  if (!canQueue.value || !currentParsed.value) return
  queued.value.push({
    title: currentParsed.value.title,
    estimatedMin: currentParsed.value.estimatedMin,
    weeklyGoalId: currentParsed.value.weeklyGoalId,
  })
  currentParsed.value = null
  inputKey.value += 1
}

function remove(index: number) {
  queued.value.splice(index, 1)
}

// "오늘 할 일로 확정"을 눌러야만 emit — 그 전까지는 큐잉도 전부 로컬 상태다(R6).
function confirm() {
  emit('confirm', queued.value)
}
</script>

<style scoped>
.today-task-intake {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.add-row {
  display: flex;
  justify-content: flex-end;
}
.queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
}
.queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface-sunken);
  border-radius: var(--radius-ctrl);
}
.queue-item .title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}
.queue-item .min {
  font-size: 12.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.queue-item .remove {
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-ctrl);
}
.queue-item .remove:hover {
  background: var(--surface-card);
  color: var(--text-secondary);
}
</style>
