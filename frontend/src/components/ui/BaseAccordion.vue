<template>
  <div class="accordion neu-raised" :class="{ 'is-expanded': modelValue }">
    <div
      class="accordion-header"
      role="button"
      tabindex="0"
      @click="emit('update:modelValue', !modelValue)"
      @keydown.enter.prevent="emit('update:modelValue', !modelValue)"
      @keydown.space.prevent="emit('update:modelValue', !modelValue)"
    >
      <span class="header-content"><slot name="header" /></span>
      <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
    <div class="body-wrap">
      <div class="body-inner">
        <div class="body-padding"><slot /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.accordion {
  padding: 0;
  overflow: hidden;
}
.accordion-header {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  text-align: left;
}
.header-content {
  flex: 1;
  min-width: 0;
}
.arrow {
  flex-shrink: 0;
  color: var(--p-ink-faint);
  transition: transform 200ms ease;
}
.accordion.is-expanded .arrow {
  transform: rotate(180deg);
}
.body-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 220ms ease;
}
.accordion.is-expanded .body-wrap {
  grid-template-rows: 1fr;
}
.body-inner {
  overflow: hidden;
  min-height: 0;
}
.body-padding {
  padding: 0 20px 20px;
}

@media (prefers-reduced-motion: reduce) {
  .body-wrap {
    transition: none;
  }
}
</style>
