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
    <!-- 화면 이동 — 진입 라우팅은 강제 이동이 아니므로 항상 다른 화면으로 갈 길을 둔다(CLAUDE.md 12절) -->
    <nav class="tabs" aria-label="화면 이동">
      <RouterLink v-for="tab in TABS" :key="tab.name" :to="{ name: tab.name }" class="tab">
        {{ tab.label }}
      </RouterLink>
    </nav>
    <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
    <div class="spacer" />
    <slot name="actions" />
    <!-- 라이트·다크 전환 — 전체 화면에 적용된다(shared/lib/theme.ts) -->
    <button
      type="button"
      class="theme-toggle"
      :aria-label="theme === 'dark' ? '라이트 모드로 보기' : '다크 모드로 보기'"
      :title="theme === 'dark' ? '라이트 모드로 보기' : '다크 모드로 보기'"
      @click="toggle"
    >
      <!-- 지금 라이트면 달(다크로), 다크면 해(라이트로) -->
      <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M15 10.6A6.3 6.3 0 0 1 7.4 3a6.3 6.3 0 1 0 7.6 7.6Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3.3" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M9 1.5v1.8M9 14.7v1.8M1.5 9h1.8M14.7 9h1.8M3.7 3.7l1.3 1.3M13 13l1.3 1.3M3.7 14.3 5 13M13 5l1.3-1.3"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTheme } from '../lib/theme'

defineProps<{
  subtitle?: string
}>()

const { theme, toggle } = useTheme()

// UI 문구는 CLAUDE.md 3절 화면 표. mobile-run은 화면 이름이 없어 "모바일"로만 표시한다
const TABS = [
  { name: 'today', label: '오늘' },
  { name: 'reflect-day', label: '오늘의 기록' },
  { name: 'reflect-week', label: '주간 회고' },
  { name: 'mobile-run', label: '모바일' },
] as const
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
  color: var(--text-primary);
}
.tabs {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}
.tab {
  padding: 8px 12px;
  border-radius: var(--radius-ctrl);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
}
.tab:hover {
  background: var(--surface-sunken);
}
/* 현재 화면 — 로즈는 주 CTA와 포커스에만 쓰므로 중립 톤으로 구분한다(CLAUDE.md 7절) */
.tab.router-link-exact-active {
  background: var(--surface-sunken);
  color: var(--text-primary);
  font-weight: 600;
}
.tab:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.theme-toggle {
  flex: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-ctrl);
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
}
.theme-toggle:hover {
  background: var(--surface-sunken);
}
.theme-toggle:focus-visible {
  outline: 2px solid var(--rose-500);
  outline-offset: 2px;
}
.subtitle {
  color: var(--text-muted);
  font-size: 13px;
}
.spacer {
  flex: 1;
}
</style>
