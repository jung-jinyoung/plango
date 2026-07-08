<template>
  <BaseModal
    :model-value="modelValue"
    variant="modal"
    title="일정이 겹쳐요"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="conflict" class="compare">
      <div class="card existing">
        <span class="label">기존 일정</span>
        <p class="time">{{ label(conflict.existing.startMinutes, conflict.existing.durationMinutes) }}</p>
        <p class="title">{{ conflict.existing.title }}</p>
      </div>
      <div class="vs" aria-hidden="true">↔</div>
      <div class="card incoming">
        <span class="label">새로 배치하려는 일정</span>
        <p class="time">{{ label(conflict.pending.startMinutes, conflict.pending.durationMinutes) }}</p>
        <p class="title">{{ conflict.pending.title }}</p>
      </div>
    </div>

    <template #actions>
      <BaseButton variant="secondary" @click="$emit('adjust-manually')">직접 조정</BaseButton>
      <BaseButton variant="primary" @click="$emit('auto-resolve')">자동 재배치</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { minutesToLabel } from '@/utils/date'

defineProps({
  modelValue: { type: Boolean, default: false },
  conflict: { type: Object, default: null }, // { pending, existing }
})
defineEmits(['update:modelValue', 'auto-resolve', 'adjust-manually'])

function label(start, duration) {
  return `${minutesToLabel(start)}–${minutesToLabel(start + duration)}`
}
</script>

<style scoped>
.compare {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  border-radius: var(--p-radius-sm);
  background: var(--p-bg);
}
.card.incoming {
  box-shadow: 0 0 0 2px var(--p-rose);
}
.label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.time {
  font-size: 0.78rem;
  color: var(--p-ink-muted);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  margin: 0 0 4px;
}
.title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vs {
  color: var(--p-ink-faint);
  font-size: 1.1rem;
  flex-shrink: 0;
}
</style>
