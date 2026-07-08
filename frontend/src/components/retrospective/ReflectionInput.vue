<template>
  <div class="reflection">
    <label :for="`reflect-${dateISO}`" class="label">오늘 한 줄 회고</label>
    <textarea
      :id="`reflect-${dateISO}`"
      class="input neu-sunken"
      rows="4"
      placeholder="오늘 하루는 어땠나요?"
      :value="retrospectiveStore.reflectionsByDate[dateISO] || ''"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup>
import { useRetrospectiveStore } from '@/stores/retrospective'

const props = defineProps({
  dateISO: { type: String, required: true },
})

const retrospectiveStore = useRetrospectiveStore()

function handleBlur(e) {
  retrospectiveStore.setReflection(props.dateISO, e.target.value)
}
</script>

<style scoped>
.reflection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-ink-muted);
}
.input {
  border: none;
  padding: 14px 16px;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--p-ink);
  resize: vertical;
  line-height: 1.6;
}
.input::placeholder {
  color: var(--p-ink-faint);
}
</style>
