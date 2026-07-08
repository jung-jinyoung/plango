<template>
  <component
    :is="tag"
    class="base-btn neu-interactive"
    :class="[`is-${variant}`, `is-${size}`, { 'is-icon': icon }]"
    :disabled="disabled || loading"
    v-bind="tag === 'a' ? { href } : { type: type || 'button' }"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </component>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost
  size: { type: String, default: 'md' }, // md | sm
  icon: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
  href: { type: String, default: undefined },
  tag: { type: String, default: 'button' },
})
</script>

<style scoped>
.base-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
.is-md {
  padding: 13px 26px;
  font-size: 0.95rem;
}
.is-sm {
  padding: 10px 20px;
  font-size: 0.875rem;
}
.is-icon {
  padding: 0;
  width: 44px;
  height: 44px;
  border-radius: 14px;
}
.is-primary {
  color: #fff;
  background: linear-gradient(145deg, var(--p-rose), var(--p-rose-ink));
  box-shadow: var(--p-shadow-raised-sm);
}
.is-primary:active {
  box-shadow:
    inset 4px 4px 9px rgba(122, 44, 66, 0.55),
    inset -3px -3px 7px rgba(255, 190, 205, 0.25);
}
.is-secondary,
.is-ghost {
  color: var(--p-ink);
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
}
.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 700ms linear infinite;
}
.is-secondary .spinner,
.is-ghost .spinner {
  border-color: color-mix(in srgb, var(--p-ink) 30%, transparent);
  border-top-color: var(--p-ink);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
