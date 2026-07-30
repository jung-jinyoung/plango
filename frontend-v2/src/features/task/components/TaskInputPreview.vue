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
import { computed, ref } from 'vue'
import Chip from '../../../shared/ui/Chip.vue'
import { parseTaskInput } from '../lib/parse'
import type { WeeklyGoal } from '../../../entities/types'

const props = defineProps<{
  candidateGoals: WeeklyGoal[]
}>()

const text = ref('')
const parsed = computed(() => parseTaskInput(text.value, props.candidateGoals))
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
