<template>
  <button
    class="base-btn"
    :class="[`is-${variant}`]"
    :disabled="disabled"
    :type="type"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'ghost',
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.base-btn {
  border: none;
  border-radius: var(--radius-ctrl);
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.base-btn:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}

.base-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 로즈는 화면당 1개, 주 CTA에만 — CLAUDE.md 7절 */
.is-primary {
  background: var(--rose-500);
  color: var(--surface-card);
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
}

.is-primary:hover:not(:disabled) {
  background: var(--rose-600);
}

.is-ghost {
  background: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  padding: 10px 14px;
}

.is-ghost:hover:not(:disabled) {
  background: var(--surface-sunken);
}
</style>
