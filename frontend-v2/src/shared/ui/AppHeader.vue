<template>
  <header class="app-header">
    <div class="brand">
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden="true">
        <ellipse cx="8" cy="14.5" rx="6.2" ry="4.4" fill="var(--rose-500)" />
        <path
          d="M12 12.4C15.2 9.6 15 5 11.6 3.6"
          stroke="var(--rose-500)"
          stroke-width="2.4"
          stroke-linecap="round"
        />
        <circle cx="10.9" cy="3" r="2.1" fill="var(--rose-500)" />
        <path d="M12.6 2.1L16 3.4L12.6 4.4Z" fill="var(--rose-500)" />
        <path
          d="M6.6 18.6L7.7 20.4L6 21.9"
          stroke="var(--rose-500)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Plango
    </div>
    <div>
      <span class="title">{{ title }}</span>
      <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
    </div>
    <div class="spacer" />
    <slot name="actions" />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
/* 목업 01의 .top — 보더는 아래 한 줄이지만 카드가 아니라 페이지 구획선이다 */
.app-header {
  height: 64px;
  background: var(--surface-card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 17px;
  letter-spacing: -0.02em;
}
.title {
  font-weight: 600;
  font-size: 15px;
}
.subtitle {
  color: var(--text-muted);
  font-size: 13px;
  margin-left: 6px;
}
.spacer {
  flex: 1;
}
</style>
