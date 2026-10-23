<template>
  <BaseCard>
    <div class="label">할 일 적기</div>
    <TaskInputPreview
      :candidate-goals="candidateGoals"
      submittable
      @update:parsed="() => {}"
      @submit="(parsed) => emit('add', parsed)"
    />

    <div class="label with-margin">아직 안 놓은 일 {{ unplacedTasks.length }}</div>
    <div v-for="item in unplacedTasks" :key="item.task.id" class="inbox-item">
      <Dot :color="item.color" />
      <span class="title">{{ item.task.title }}</span>
      <em class="minutes">{{ item.task.estimatedMin }}분</em>
    </div>
    <button
      type="button"
      class="place-btn"
      :disabled="unplacedTasks.length === 0"
      @click="emit('place')"
    >
      비어 있는 시간에 놓기
    </button>
    <p v-if="placeNote" class="place-note" role="status">{{ placeNote }}</p>

    <!-- 타임라인 블록 읽는 법(목업 01) -->
    <ul class="legend">
      <li><span class="sw sw-goal" />목표에 연결된 할 일</li>
      <li><span class="sw sw-appt" />약속</li>
      <li><span class="sw sw-ghost" />원래 계획</li>
    </ul>
  </BaseCard>
</template>

<script setup lang="ts">
import type { CategoryColor, Task, WeeklyGoal } from '../../../entities/types'
import type { ParsedTaskInput } from '../lib/parse'
import Dot from '../../../shared/ui/Dot.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'
import TaskInputPreview from './TaskInputPreview.vue'

// 색은 페이지 레벨(resolveCategory)에서 이미 정해져 들어온다 — 여기선 다시 조회하지 않는다.
defineProps<{
  candidateGoals: WeeklyGoal[]
  unplacedTasks: { task: Task; color: CategoryColor }[]
  placeNote?: string
}>()

// 저장·배치는 페이지가 한다 — 이 패널은 입력과 요청만 올려보낸다
const emit = defineEmits<{
  add: [parsed: ParsedTaskInput]
  place: []
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
/* 목업 01의 .btn-sub — 화면의 주 CTA(오늘 확정)와 겹치지 않게 중립 톤 */
.place-btn {
  width: 100%;
  margin-top: 14px;
  padding: 11px;
  border: none;
  border-radius: var(--radius-ctrl);
  background: var(--surface-sunken);
  font-family: inherit;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text-secondary);
  cursor: pointer;
}
.place-btn:hover:not(:disabled) {
  background: var(--border);
}
.place-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.place-btn:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.place-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-secondary);
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 16px 0 0;
  padding: 14px 0 0;
  list-style: none;
  border-top: 1px solid var(--border);
}
.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: var(--text-muted);
}
.sw {
  width: 14px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}
.sw-goal {
  background: var(--cat-blue-tint);
}
.sw-appt {
  background: var(--surface-sunken);
  border: 1px solid var(--border);
}
.sw-ghost {
  border: 1px dashed var(--text-muted);
}
.minutes {
  font-style: normal;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
