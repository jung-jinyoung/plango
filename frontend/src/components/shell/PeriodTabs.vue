<template>
  <nav class="tabs neu-sunken" :aria-label="ariaLabel">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="tab"
      :class="{ 'is-active': isActive(tab.to) }"
    >
      {{ tab.label }}
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  tabs: { type: Array, required: true }, // [{ label, to }]
  ariaLabel: { type: String, default: '기간 선택' },
})

const route = useRoute()
function isActive(to) {
  return route.path === to
}
</script>

<style scoped>
.tabs {
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
}
.tab {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-muted);
  font-weight: 600;
  font-size: 0.88rem;
  padding: 9px 20px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 180ms ease;
}
.tab.is-active {
  background: var(--p-surface);
  color: var(--p-ink);
  box-shadow: var(--p-shadow-raised-sm);
}
.tab:active {
  transform: scale(0.96);
}
</style>
