<template>
  <aside class="sidebar">
    <router-link to="/" class="logo">
      <AppLogo :size="30" bg="bg" />
    </router-link>

    <nav class="nav-list" aria-label="주요 메뉴">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'is-active': isActive(item.to) }"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        {{ item.label }}
      </router-link>
    </nav>

    <div class="spacer" />

    <div class="nav-bottom">
      <button type="button" class="nav-item nav-item-btn" aria-label="알림">
        <span class="nav-icon" v-html="ICONS.bell"></span>
        알림
      </button>
      <router-link
        to="/app/settings"
        class="nav-item"
        :class="{ 'is-active': isActive('/app/settings') }"
      >
        <span class="nav-icon" v-html="ICONS.settings"></span>
        설정
      </router-link>
      <div class="profile">
        <span class="avatar">P</span>
        <span class="name">Plango 사용자</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppLogo from '@/components/ui/AppLogo.vue'

const route = useRoute()
function isActive(to) {
  return route.path.startsWith(to)
}

const ICONS = {
  dashboard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  goals:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  retro:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  records:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  settings:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.1.68.32.92.63"/></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>',
}

const navItems = [
  { label: '대시보드', to: '/app/dashboard', icon: ICONS.dashboard },
  { label: '목표 관리', to: '/app/goals', icon: ICONS.goals },
  { label: '회고', to: '/app/retrospective', icon: ICONS.retro },
  { label: '데일리 저널', to: '/app/records', icon: ICONS.records },
]
</script>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--p-surface);
  border-right: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  position: sticky;
  top: 0;
  height: 100dvh;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--p-ink);
  text-decoration: none;
  padding: 8px;
  margin-bottom: 20px;
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 12px;
  color: var(--p-ink-muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition:
    background 150ms ease,
    color 150ms ease;
}
.nav-item:hover {
  background: var(--p-bg);
  color: var(--p-ink);
}
.nav-item.is-active {
  background: color-mix(in srgb, var(--p-rose) 14%, var(--p-surface));
  color: var(--p-rose-ink);
}
.nav-icon {
  display: flex;
  flex-shrink: 0;
}
.nav-item-btn {
  appearance: none;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font: inherit;
}
.spacer {
  flex: 1;
}
.nav-bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
}
.profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--p-ink-muted);
}
</style>
