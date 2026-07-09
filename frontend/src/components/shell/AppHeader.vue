<template>
  <header class="app-header">
    <h1 v-if="!route.meta.showDateNav" class="title">{{ title }}</h1>

    <div v-if="route.meta.showDateNav" class="date-nav">
      <button type="button" class="date-btn" aria-label="이전" @click="step(-1)">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span class="date-label">{{ title }}</span>
      <button type="button" class="date-btn" aria-label="다음" @click="step(1)">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <button
        type="button"
        class="date-refresh"
        aria-label="오늘로 이동"
        @click="calendarNav.goToday"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>

    <div class="header-actions">
      <BaseButton variant="secondary" icon aria-label="알림">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </BaseButton>
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
  height: 72px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  column-gap: 24px;
  padding: 0 32px;
  border-bottom: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  background: var(--p-bg);
  position: sticky;
  top: 0;
  z-index: 20;
}
.title {
  grid-column: 1;
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
  justify-self: start;
}
.date-nav {
  grid-column: 2;
  display: inline-flex;
  align-items: center;
  gap: 24px;
  justify-self: center;
}
.date-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  color: var(--p-ink-muted);
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 150ms ease;
}
.date-btn:hover {
  color: var(--p-ink);
}
.date-label {
  padding: 0 4px;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.date-refresh {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--p-ink-muted);
  width: 32px;
  height: 32px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.date-refresh:hover {
  color: var(--p-ink);
}
.header-actions {
  grid-column: 3;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 14px;
}
</style>
