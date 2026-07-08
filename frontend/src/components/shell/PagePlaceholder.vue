<template>
  <BaseCard class="placeholder">
    <span class="ia-code">{{ code }}</span>
    <h1>{{ title }}</h1>
    <p class="purpose">{{ purpose }}</p>
    <ul v-if="actions.length" class="actions">
      <li v-for="a in actions" :key="a">{{ a }}</li>
    </ul>
    <slot />
  </BaseCard>
</template>

<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'

defineProps({
  code: { type: String, required: true },
  title: { type: String, required: true },
  purpose: { type: String, required: true },
  actions: { type: Array, default: () => [] },
})
</script>

<style scoped>
.placeholder {
  max-width: 640px;
}
.ia-code {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--p-rose-ink);
  background: color-mix(in srgb, var(--p-rose) 14%, var(--p-surface));
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
  letter-spacing: 0.02em;
}
h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.purpose {
  color: var(--p-ink-muted);
  font-size: 0.98rem;
  margin: 0 0 18px;
}
.actions {
  margin: 0;
  padding-left: 20px;
  color: var(--p-ink-faint);
  font-size: 0.88rem;
  line-height: 1.9;
}
</style>
