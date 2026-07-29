<template>
  <div class="base-card" :class="{ 'is-hoverable': hoverable }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    hoverable?: boolean
  }>(),
  {
    hoverable: false,
  },
)
</script>

<style scoped>
/* 카드는 전면 배경 대비로만 분리한다 — 한쪽 면 보더 금지 (CLAUDE.md 7절) */
.base-card {
  background: var(--surface-card);
  border-radius: var(--radius-card);
  padding: 20px;
}

.is-hoverable {
  transition: box-shadow 0.15s;
}

.is-hoverable:hover {
  box-shadow: var(--elev-hover);
}
</style>
