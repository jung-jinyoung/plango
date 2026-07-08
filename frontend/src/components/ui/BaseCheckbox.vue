<template>
  <label class="checkbox">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="box">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
    <span v-if="$slots.default || label" class="label"><slot>{{ label }}</slot></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.92rem;
}
.checkbox input {
  position: absolute;
  opacity: 0;
  width: 22px;
  height: 22px;
  margin: 0;
  cursor: pointer;
}
.box {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-sunken);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    box-shadow 150ms ease,
    background 150ms ease;
}
.box svg {
  opacity: 0;
  transform: scale(0.5);
  transition: all 150ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.checkbox input:checked ~ .box {
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  box-shadow: none;
}
.checkbox input:checked ~ .box svg {
  opacity: 1;
  transform: scale(1);
}
.checkbox input:focus-visible ~ .box {
  outline: 3px solid var(--p-focus-ring);
  outline-offset: 3px;
}
.checkbox input:active ~ .box {
  transform: scale(0.92);
}
.label {
  color: var(--p-ink);
}
</style>
