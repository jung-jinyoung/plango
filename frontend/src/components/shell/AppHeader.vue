<template>
  <header class="app-header">
    <h1 v-if="!route.meta.showDateNav" class="title">{{ title }}</h1>

    <template v-else>
      <div class="edge-slot edge-start">
        <button type="button" class="today-btn" @click="calendarNav.goToday">today</button>
      </div>

      <div class="date-nav">
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
      </div>

      <div class="edge-slot edge-end">
        <PeriodTabs v-if="periodTabs" :tabs="periodTabs" :aria-label="periodTabsLabel" />
      </div>
    </template>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PeriodTabs from '@/components/shell/PeriodTabs.vue'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { formatMonthTitle, formatWeekTitle } from '@/composables/useCalendarDates'
import { formatDateTitle } from '@/utils/date'
import { dashboardTabs, retrospectiveTabs } from '@/constants/period-tabs'

const route = useRoute()
const calendarNav = useCalendarNavStore()

const title = computed(() => {
  const unit = route.meta.dateUnit
  if (unit === 'month') return formatMonthTitle(calendarNav.currentDate)
  if (unit === 'week') return formatWeekTitle(calendarNav.currentDate)
  if (unit === 'day') return formatDateTitle(calendarNav.currentDateISO)
  return route.meta.title || ''
})

const periodTabs = computed(() => {
  if (route.meta.periodTabs === 'dashboard') return dashboardTabs
  if (route.meta.periodTabs === 'retrospective') return retrospectiveTabs
  return null
})

const periodTabsLabel = computed(() =>
  route.meta.periodTabs === 'retrospective' ? '주간/월간 회고 전환' : '월/주/일 전환',
)

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
  column-gap: 16px;
  padding: 0 32px;
  border-bottom: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
  background: var(--p-bg);
  position: sticky;
  top: 0;
  z-index: 20;
}
.title {
  grid-column: 1;
  justify-self: start;
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.01em;
}
.edge-slot {
  display: flex;
  align-items: center;
  min-width: 240px;
}
.edge-start {
  justify-self: start;
  justify-content: flex-start;
}
.edge-end {
  justify-self: end;
  justify-content: flex-end;
}
.date-nav {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.today-btn {
  appearance: none;
  border: none;
  cursor: pointer;
  background: var(--p-surface);
  box-shadow: var(--p-shadow-raised-sm);
  color: var(--p-ink-muted);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 18px;
  border-radius: 999px;
  transition: box-shadow 150ms ease;
}
.today-btn:hover {
  color: var(--p-ink);
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
  width: 200px;
  text-align: center;
  color: var(--p-ink-muted);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
</style>
