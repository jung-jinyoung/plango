<template>
  <div class="goal-row">
    <div class="row-top">
      <b>{{ title }}</b>
      <span class="v">{{ formatMinutesAsHours(actualMin) }}</span>
      <span class="p">/ {{ estimatedHours }}h</span>
    </div>
    <ProgressBar :percent="percent" :color="color" />
  </div>
</template>

<script setup lang="ts">
import type { CategoryColor } from '../../../entities/types'
import { formatMinutesAsHours } from '../../../shared/lib/time'
import ProgressBar from '../../../shared/ui/ProgressBar.vue'

defineProps<{
  title: string
  actualMin: number
  estimatedHours: number
  percent: number
  color: CategoryColor
}>()
</script>

<style scoped>
/* .row가 아니라 .goal-row — Quasar가 전역 유틸리티 클래스로 .row{display:flex}를
   이미 선점하고 있어서, 이 scoped 규칙이 display를 안 건드리면 Quasar 쪽이 이겨
   자식(ProgressBar)이 flex item이 되고 너비가 0으로 무너진다. */
.goal-row {
  margin-bottom: 20px;
}
.goal-row:last-child {
  margin-bottom: 0;
}
.row-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 9px;
}
.row-top b {
  font-weight: 600;
  font-size: 15px;
  flex: 1;
}
.row-top .v {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.row-top .p {
  font-size: 12.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
