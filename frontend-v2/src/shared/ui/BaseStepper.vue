<template>
  <div class="base-stepper">
    <button
      class="step-btn"
      type="button"
      :aria-label="decreaseLabel"
      :disabled="modelValue <= min"
      @click="set(modelValue - step)"
    >
      −
    </button>
    <div class="val">{{ modelValue }}<em v-if="unit">{{ unit }}</em></div>
    <button
      class="step-btn"
      type="button"
      :aria-label="increaseLabel"
      :disabled="modelValue >= max"
      @click="set(modelValue + step)"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    unit?: string
    decreaseLabel?: string
    increaseLabel?: string
  }>(),
  {
    min: 0,
    max: Infinity,
    step: 1,
    unit: '',
    decreaseLabel: '줄이기',
    increaseLabel: '늘리기',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function set(next: number) {
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, next)))
}
</script>

<style scoped>
.base-stepper {
  display: flex;
  align-items: center;
  background: var(--surface-sunken);
  border-radius: var(--radius-ctrl);
}

.step-btn {
  width: 34px;
  height: 40px;
  border: none;
  background: none;
  border-radius: var(--radius-ctrl);
  font-size: 17px;
  font-family: inherit;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background-color 0.15s;
}

.step-btn:hover:not(:disabled) {
  background: var(--border);
}

.step-btn:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: -2px;
}

.step-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.val {
  width: 52px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.val em {
  font-style: normal;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: 2px;
}
</style>
