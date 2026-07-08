<template>
  <div>
    <div class="head-row">
      <div class="tabs neu-sunken">
        <button
          type="button"
          class="tab"
          :class="{ 'is-active': activeTab === 'week' }"
          @click="activeTab = 'week'"
        >
          주간 회고
        </button>
        <button
          type="button"
          class="tab"
          :class="{ 'is-active': activeTab === 'month' }"
          @click="activeTab = 'month'"
        >
          월간 회고
        </button>
      </div>
      <BaseSelect v-model="periodFilter" :options="periodOptions" />
    </div>

    <div class="list">
      <RetroHistoryCard
        v-for="report in filteredReports"
        :key="report.periodKey"
        :report="report"
        @click="openReport(report)"
      />
      <p v-if="filteredReports.length === 0" class="empty">아직 회고 기록이 없어요.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import RetroHistoryCard from '@/components/retrospective/RetroHistoryCard.vue'
import { useRetrospectiveStore } from '@/stores/retrospective'
import { useCalendarNavStore } from '@/stores/calendar-nav'
import { buildSeedReports } from '@/services/mock/seed-retro-data'

const router = useRouter()
const retrospectiveStore = useRetrospectiveStore()
const calendarNav = useCalendarNavStore()

const activeTab = ref('week')
const periodFilter = ref('all')
const periodOptions = [
  { label: '전체 기간', value: 'all' },
  { label: '최근 1개월', value: '1m' },
  { label: '최근 3개월', value: '3m' },
]

onMounted(() => {
  retrospectiveStore.seedReports(buildSeedReports())
})

const sourceList = computed(() =>
  activeTab.value === 'week' ? retrospectiveStore.weeklyReportsList : retrospectiveStore.monthlyReportsList,
)

const filteredReports = computed(() => {
  if (periodFilter.value === 'all') return sourceList.value
  const months = periodFilter.value === '1m' ? 1 : 3
  const cutoff = dayjs().subtract(months, 'month').valueOf()
  return sourceList.value.filter((r) => r.generatedAt >= cutoff)
})

function openReport(report) {
  if (report.periodType === 'week') {
    calendarNav.currentDate = dayjs(report.periodKey.replace('week:', ''))
    router.push('/app/retrospective/weekly')
  } else {
    calendarNav.currentDate = dayjs(`${report.periodKey.replace('month:', '')}-01`)
    router.push('/app/retrospective/monthly')
  }
}
</script>

<style scoped>
.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
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
  transition: all 180ms ease;
}
.tab.is-active {
  background: var(--p-surface);
  color: var(--p-ink);
  box-shadow: var(--p-shadow-raised-sm);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.empty {
  color: var(--p-ink-faint);
  font-size: 0.9rem;
}
</style>
