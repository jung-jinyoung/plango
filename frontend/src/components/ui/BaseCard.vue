<template>
  <component :is="tag" class="base-card" :class="[`is-${variant}`, { 'is-interactive': interactive }]">
    <slot />
  </component>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'raised' }, // raised | sunken
  interactive: { type: Boolean, default: false },
  tag: { type: String, default: 'div' },
})
</script>

<style scoped>
.base-card {
  border-radius: var(--p-radius-md);
  padding: 24px;
}
.is-raised {
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised);
}
.is-sunken {
  background: var(--p-surface);
  box-shadow: var(--p-shadow-sunken);
}
.is-interactive {
  cursor: pointer;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}
.is-interactive:hover {
  box-shadow: var(--p-shadow-raised-hover);
  transform: translateY(-1px);
}
.is-interactive:active {
  box-shadow: var(--p-shadow-pressed);
  transform: translateY(0) scale(0.99);
}
</style>
