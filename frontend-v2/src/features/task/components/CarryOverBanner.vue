<template>
  <BaseCard class="carry">
    <p><b>어제 못 한 일 {{ count }}개</b>가 기다리고 있어요. 오늘로 옮길까요?</p>
    <div class="actions">
      <BaseButton variant="ghost" @click="emit('dismiss')">나중에</BaseButton>
      <!-- CLAUDE.md 9절엔 이 버튼이 rose-50/rose-700 링크 스타일인데,
           product-spec.md 9-3절 로즈 허용 규칙엔 "링크 텍스트" 금지가 명시돼
           있어 서로 어긋난다 — 화면에 아직 다른 로즈 CTA가 없어서(화면당 1개
           규칙) BaseButton primary(단색 로즈)로 대신했다. -->
      <BaseButton variant="primary" @click="emit('accept')">오늘로 옮기기</BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseButton from '../../../shared/ui/BaseButton.vue'
import BaseCard from '../../../shared/ui/BaseCard.vue'

defineProps<{
  count: number
}>()

const emit = defineEmits<{
  dismiss: []
  accept: []
}>()
</script>

<style scoped>
.carry {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 14px 18px;
}
.carry p {
  flex: 1;
  font-size: 13.5px;
}
.actions {
  display: flex;
  gap: 4px;
  flex: none;
}
</style>
