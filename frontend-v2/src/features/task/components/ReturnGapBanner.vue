<template>
  <BaseCard class="gap">
    <p>지난 5일 기록이 비어 있어요. 이번 주 목표만 다시 잡을까요?</p>
    <div class="actions">
      <BaseButton variant="ghost" @click="emit('dismiss')">나중에</BaseButton>
      <BaseButton variant="primary" @click="emit('accept')">이번 주 목표 다시 잡기</BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'

// 진입 라우팅(CLAUDE.md 12절) "복귀 리셋" — 누적 미완료를 보여주지 않고
// 조용히 아카이브(화면 표시 필터, status는 안 건드림)한 뒤 이 배너만 띄운다.
// 문구는 CLAUDE.md 8절 "공백 복귀" 예문 그대로.
const emit = defineEmits<{
  dismiss: []
  accept: []
}>()
</script>

<style scoped>
.gap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px 18px;
}
.gap p {
  flex: 1;
  font-size: 13.5px;
}
.actions {
  display: flex;
  gap: 4px;
  flex: none;
}
</style>
