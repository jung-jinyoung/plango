<template>
  <div class="ab-row">
    <Dot :color="color" />
    <div class="txt">
      <b>{{ title }}</b>
      <span>계획 {{ formatMinutesAsHours(plannedMin) }} · {{ formatHHMM(actualStart) }}부터</span>
    </div>
    <BaseStepper
      :model-value="durationMin"
      :min="15"
      :step="15"
      unit="분"
      decrease-label="줄이기"
      increase-label="늘리기"
      @update:model-value="onChangeDuration"
    />
  </div>
</template>

<script setup lang="ts">
import type { CategoryColor } from '../../../entities/types'
import { formatHHMM, formatMinutesAsHours } from '../../../shared/lib/time'
import BaseStepper from '../../../shared/ui/BaseStepper.vue'
import Dot from '../../../shared/ui/Dot.vue'

// 자동 포착 값을 직접 고치는 화면이다 — AI 제안이 아니라 사용자가 이미 벌어진
// 사실을 정정하는 것이라 R6(제안→수락)의 대상이 아니다. 스테퍼를 움직이면
// 바로 반영된다(별도 확정 버튼 없음). start는 건드리지 않고 duration만 바꾼다
// — end 재계산(addMinutes)은 상위(페이지)의 taskStore.updateTask 호출에서 한다.
defineProps<{
  title: string
  color: CategoryColor
  plannedMin: number
  actualStart: string
  durationMin: number
}>()

const emit = defineEmits<{
  'update-duration': [minutes: number]
}>()

function onChangeDuration(minutes: number) {
  emit('update-duration', minutes)
}
</script>

<style scoped>
.ab-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.ab-row:last-of-type {
  border-bottom: none;
}
.txt {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.txt b {
  font-weight: 600;
  font-size: 14.5px;
}
.txt span {
  font-size: 12.5px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
