<template>
  <div class="field">
    <label v-if="label" :for="id">{{ label }}</label>
    <input
      :id="id"
      class="input neu-sunken"
      :class="{ 'has-error': !!error }"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="msg error-msg">{{ error }}</span>
    <span v-else-if="helper" class="msg helper-msg">{{ helper }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  helper: { type: String, default: '' },
  error: { type: String, default: '' },
  id: { type: String, default: () => `field-${Math.random().toString(36).slice(2, 9)}` },
})
defineEmits(['update:modelValue', 'blur'])
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--p-ink-muted);
}
.input {
  border: none;
  padding: 13px 16px;
  font-size: 0.92rem;
  font-family: inherit;
  color: var(--p-ink);
  transition: box-shadow 150ms ease;
}
.input::placeholder {
  color: var(--p-ink-faint);
}
.input.has-error {
  box-shadow: var(--p-shadow-sunken), 0 0 0 2px var(--p-rose);
}
.msg {
  font-size: 0.76rem;
}
.helper-msg {
  color: var(--p-ink-faint);
}
.error-msg {
  color: var(--p-rose-ink);
  font-weight: 600;
}
</style>
