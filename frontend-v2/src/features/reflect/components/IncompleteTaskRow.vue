<template>
  <div class="inc-row">
    <div class="main">
      <Dot :color="color" />
      <div class="txt">
        <b>{{ title }}</b>
        <span>{{ estimatedMin }}분</span>
      </div>
      <div class="acts">
        <BaseButton variant="ghost" @click="emit('carry')">내일로</BaseButton>
        <BaseButton variant="ghost" disabled>이번 주 내로</BaseButton>
      </div>
    </div>
    <p class="note">"이번 주 내로"는 다음 슬라이스에서 지원해요. 지금은 "내일로"만 동작해요.</p>
  </div>
</template>

<script setup lang="ts">
import type { CategoryColor } from '../../../entities/types'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import Dot from '../../../shared/ui/Dot.vue'

defineProps<{
  title: string
  color: CategoryColor
  estimatedMin: number
}>()

// Task 스키마(entities/types.ts)엔 "내일로"/"이번 주 내로"를 구분해 기록할
// 필드가 없다 — status는 carried 하나뿐이고 plannedBlock은 "오늘 확정" 이후
// 읽기 전용(R2)이라 옮길 대상을 인코딩할 다른 필드도 없다. 스키마를 바꾸지
// 않는 이번 슬라이스에선 "내일로"만 실제로 taskStore.updateTask를 호출하고,
// "이번 주 내로"는 비활성화해 미구현임을 화면에서도 드러낸다.
const emit = defineEmits<{
  carry: []
}>()
</script>

<style scoped>
.inc-row {
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.inc-row:last-of-type {
  border-bottom: none;
}
.main {
  display: flex;
  align-items: center;
  gap: 12px;
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
.acts {
  display: flex;
  gap: 4px;
  flex: none;
}
.note {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 8px;
}
</style>
