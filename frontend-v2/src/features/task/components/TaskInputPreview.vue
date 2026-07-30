<template>
  <div class="task-input-preview">
    <input v-model="text" type="text" class="input" placeholder="헬스장 운동 45분 #운동" />
    <div class="chips">
      <Chip v-if="parsed.title">{{ parsed.title }}</Chip>
      <Chip v-if="parsed.estimatedMin !== null" variant="time">{{ parsed.estimatedMin }}분</Chip>
      <Chip v-if="parsed.matchedGoalTitle" variant="category" dot># {{ parsed.matchedGoalTitle }}</Chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Chip from '../../../shared/ui/Chip.vue'
import { parseTaskInput, type ParsedTaskInput } from '../lib/parse'
import type { WeeklyGoal } from '../../../entities/types'

const props = defineProps<{
  candidateGoals: WeeklyGoal[]
}>()

// 카테고리 색 해석(resolveCategory)은 여기서 하지 않는다 — pages/ 레벨에서
// goalStore+taskStore를 조합해 처리한다. 이 컴포넌트는 weeklyGoalId까지만
// 알려주고 색은 모른다(features/task가 features/goal을 import하지 않도록).
const emit = defineEmits<{
  'update:parsed': [value: ParsedTaskInput]
}>()

const text = ref('')
const parsed = computed(() => parseTaskInput(text.value, props.candidateGoals))

watch(parsed, (value) => emit('update:parsed', value), { immediate: true })
</script>

<style scoped>
.task-input-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.input {
  width: 100%;
  padding: 11px 13px;
  border-radius: var(--radius-ctrl);
  border: none;
  background: var(--surface-sunken);
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
}
.input:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 24px;
}
</style>
