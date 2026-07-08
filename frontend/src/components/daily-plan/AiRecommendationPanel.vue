<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    title="AI 추천 결과"
    width="560px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="loading">
      <span class="spinner" aria-hidden="true" />
      <p>AI가 할 일을 분석하고 있어요…</p>
    </div>

    <div v-else class="content">
      <p class="summary">{{ summary }}</p>

      <div class="rec-list">
        <AiRecommendationCard
          v-for="rec in recommendations"
          :key="rec.todoId"
          :recommendation="rec"
          @exclude="$emit('exclude', $event)"
        />
        <p v-if="recommendations.length === 0" class="empty">
          추천할 항목이 없어요. 모두 제외되었거나 완료된 할 일뿐이에요.
        </p>
      </div>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('adjust-manually')">직접 조정</BaseButton>
      <BaseButton variant="primary" :disabled="loading || recommendations.length === 0" @click="$emit('apply-all')">
        이대로 적용
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AiRecommendationCard from './AiRecommendationCard.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  summary: { type: String, default: '' },
  recommendations: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue', 'exclude', 'apply-all', 'adjust-manually'])
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 0;
  color: var(--p-ink-muted);
}
.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid color-mix(in srgb, var(--p-lavender) 25%, transparent);
  border-top-color: var(--p-lavender);
  animation: spin 700ms linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.summary {
  font-size: 0.9rem;
  color: var(--p-ink-muted);
  margin: 0 0 16px;
}
.rec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  text-align: center;
  padding: 16px 0;
}
</style>
