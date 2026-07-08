<template>
  <header class="app-header">
    <h1 class="title">{{ title }}</h1>

    <div v-if="route.meta.showDateNav" class="date-nav neu-sunken">
      <button type="button" class="date-btn" aria-label="이전" @click="step(-1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button type="button" class="date-btn today" @click="calendarNav.goToday">오늘</button>
      <button type="button" class="date-btn" aria-label="다음" @click="step(1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>

    <div class="header-actions">
      <BaseButton variant="secondary" icon aria-label="알림">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </BaseButton>
      <span class="avatar">P</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { formatMonthTitle, formatWeekTitle } from '@/composables/useCalendarDates'
import { formatDateTitle } from '@/utils/date'

const route = useRoute()
const calendarNav = useCalendarNavStore()

const title = computed(() => {
  const unit = route.meta.dateUnit
  if (unit === 'month') return formatMonthTitle(calendarNav.currentDate)
  if (unit === 'week') return formatWeekTitle(calendarNav.currentDate)
  if (unit === 'day') return formatDateTitle(calendarNav.currentDateISO)
  return route.meta.title || ''
})

function step(delta) {
  calendarNav.step(route.meta.dateUnit, delta)
}
</script>

<style scoped>
.app-header {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 28px;
  border-bottom: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  background: var(--p-bg);
  position: sticky;
  top: 0;
  z-index: 20;
}
.title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.date-nav {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
}
.date-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-muted);
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}
.date-btn.today {
  width: auto;
  padding: 0 14px;
}
.date-btn:hover {
  color: var(--p-ink);
}
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--p-lavender), #4b3b8c);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
