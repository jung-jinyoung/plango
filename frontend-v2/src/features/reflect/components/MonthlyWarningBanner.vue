<template>
  <div v-if="!dismissed" class="monthly-warning">
    <h3>{{ warning.title }}</h3>
    <p>{{ warning.body }}</p>
    <div class="acts">
      <BaseButton variant="ghost" @click="dismiss">범위 줄이기</BaseButton>
      <BaseButton variant="ghost" @click="dismiss">한 주 더 쓰기</BaseButton>
      <BaseButton variant="ghost" @click="dismiss">그냥 갈래요</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../../../shared/ui/BaseButton.vue'
import type { MonthlyWarning } from '../lib/buildMonthlyWarning'

defineProps<{
  warning: MonthlyWarning
}>()

// 지금은 범위 조정 로직이 범위 밖(product-spec.md에도 없음) — 세 버튼 모두
// 로컬 상태로 배너만 닫는다. 실제 범위 재산정은 나중 단계.
const dismissed = ref(false)

function dismiss() {
  dismissed.value = true
}
</script>

<style scoped>
.monthly-warning {
  background: var(--cat-amber-tint);
  border-radius: var(--radius-card);
  padding: 22px 24px;
}
.monthly-warning h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--cat-amber-deep);
}
.monthly-warning p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}
.acts {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}
</style>
