<template>
  <BaseCard>
    <div class="label">할 일 적기</div>
    <TaskInputPreview :candidate-goals="candidateGoals" @update:parsed="() => {}" />

    <div class="label with-margin">아직 안 놓은 일 {{ unplacedTasks.length }}</div>
    <div v-for="item in unplacedTasks" :key="item.task.id" class="inbox-item">
      <Dot :color="item.color" />
      <span class="title">{{ item.task.title }}</span>
      <em class="minutes">{{ item.task.estimatedMin }}분</em>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import type { CategoryColor, Task, WeeklyGoal } from '../../../entities/types'
import Dot from '../../../shared/ui/Dot.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import TaskInputPreview from './TaskInputPreview.vue'

// 색은 페이지 레벨(resolveCategory)에서 이미 정해져 들어온다 — 여기선 다시 조회하지 않는다.
defineProps<{
  candidateGoals: WeeklyGoal[]
  unplacedTasks: { task: Task; color: CategoryColor }[]
}>()
</script>

<style scoped>
.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.label.with-margin {
  margin: 22px 0 0;
  margin-bottom: 8px;
}
.inbox-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 12px;
  border-radius: var(--radius-ctrl);
  background: var(--surface-card);
  border: 1px solid var(--border);
  margin-top: 8px;
}
.title {
  flex: 1;
  font-size: 13.5px;
}
.minutes {
  font-style: normal;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
