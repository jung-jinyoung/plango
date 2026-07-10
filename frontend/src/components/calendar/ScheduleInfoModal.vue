<template>
  <BaseModal
    :model-value="modelValue"
    title="일정 정보"
    width="360px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="schedule" class="info">
      <div class="title-row">
        <span class="dot" :class="`is-${schedule.categoryColor}`" aria-hidden="true" />
        <h3 :class="{ 'is-done': schedule.completed }">{{ schedule.title }}</h3>
      </div>
      <p class="time">{{ dateLabel }} · {{ timeLabel }}</p>
      <span v-if="schedule.completed" class="done-badge">완료됨</span>
      <p v-if="schedule.reason" class="reason">{{ schedule.reason }}</p>
      <p v-if="schedule.note" class="note">{{ schedule.note }}</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { formatDateTitle, minutesToLabel } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  schedule: { type: Object, default: null }, // { title, categoryColor, startMinutes, durationMinutes, completed, reason, note, dateISO }
})
defineEmits(['update:modelValue'])

const dateLabel = computed(() => (props.schedule ? formatDateTitle(props.schedule.dateISO) : ''))
const timeLabel = computed(() =>
  props.schedule
    ? `${minutesToLabel(props.schedule.startMinutes)}–${minutesToLabel(props.schedule.startMinutes + props.schedule.durationMinutes)}`
    : '',
)
</script>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--p-rose);
}
.dot.is-blue {
  background: var(--p-blue);
}
.dot.is-green {
  background: var(--p-green);
}
.dot.is-lavender {
  background: var(--p-lavender);
}
h3 {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--p-ink);
  margin: 0;
}
h3.is-done {
  color: var(--p-ink-faint);
  text-decoration: line-through;
}
.time {
  font-size: 0.84rem;
  color: var(--p-ink-faint);
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.done-badge {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-green-ink);
  background: color-mix(in srgb, var(--p-green) 18%, transparent);
  padding: 3px 10px;
  border-radius: 999px;
}
.reason,
.note {
  font-size: 0.84rem;
  color: var(--p-ink-muted);
  margin: 0;
  line-height: 1.5;
}
</style>
