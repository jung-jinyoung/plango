<template>
  <label class="radio">
    <input
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      @change="$emit('update:modelValue', value)"
    />
    <span class="circle"><i /></span>
    <span class="label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: null },
  value: { type: [String, Number], required: true },
  name: { type: String, required: true },
  label: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.92rem;
}
.radio input {
  position: absolute;
  opacity: 0;
  width: 22px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}
.circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-sunken);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.circle i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--p-blue);
  opacity: 0;
  transform: scale(0.4);
  transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.radio input:checked ~ .circle i {
  opacity: 1;
  transform: scale(1);
}
.radio input:focus-visible ~ .circle {
  outline: 3px solid var(--p-focus-ring);
  outline-offset: 3px;
}
.label {
  color: var(--p-ink);
}
</style>
