<template>
  <label class="switch">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="track">
      <span class="thumb" />
    </span>
    <span v-if="label" class="label">{{ label }}</span>
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
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.switch input {
  position: absolute;
  opacity: 0;
  width: 54px;
  height: 30px;
  margin: 0;
  cursor: pointer;
}
.track {
  width: 54px;
  height: 30px;
  border-radius: 999px;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-sunken);
  position: relative;
  flex-shrink: 0;
  transition: box-shadow 150ms ease;
}
.thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  transition:
    transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background 180ms ease;
}
.switch input:checked ~ .track .thumb {
  transform: translateX(24px);
  background: linear-gradient(145deg, var(--p-green), var(--p-green-ink));
}
.switch input:focus-visible ~ .track {
  outline: 3px solid var(--p-focus-ring);
  outline-offset: 3px;
}
.switch input:active ~ .track .thumb {
  box-shadow: var(--p-shadow-pressed);
}
.label {
  font-size: 0.92rem;
  color: var(--p-ink);
}
</style>
