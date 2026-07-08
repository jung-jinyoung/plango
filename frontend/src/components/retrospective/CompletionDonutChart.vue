<template>
  <div class="donut" :style="{ width: `${size}px`, height: `${size}px`, background: ringBackground }">
    <div class="hole">
      <span class="pct">{{ value }}%</span>
      <span class="label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  color: { type: String, default: 'rose' },
  size: { type: Number, default: 128 },
  label: { type: String, default: '완료율' },
})

const ringBackground = computed(
  () => `conic-gradient(var(--p-${props.color}) ${props.value}%, var(--p-bg) 0)`,
)
</script>

<style scoped>
.donut {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--p-shadow-raised);
  flex-shrink: 0;
}
.hole {
  width: 68%;
  height: 68%;
  border-radius: 50%;
  background: var(--p-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--p-shadow-sunken);
}
.pct {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--p-ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.label {
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  margin-top: 2px;
}
</style>
