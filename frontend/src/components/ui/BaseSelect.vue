<template>
  <div class="field">
    <label v-if="label" :for="id">{{ label }}</label>
    <select
      :id="id"
      class="select neu-sunken"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ label, value }]
  id: { type: String, default: () => `select-${Math.random().toString(36).slice(2, 9)}` },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-ink-muted);
}
.select {
  border: none;
  padding: 13px 16px;
  font-size: 0.92rem;
  font-family: inherit;
  color: var(--p-ink);
  cursor: pointer;
}
</style>
