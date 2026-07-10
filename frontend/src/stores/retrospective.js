import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateRetrospective } from '@/services/ai/generate-retrospective'
import { useTodoStore } from './todos'
import { useScheduleStore } from './schedule'
import { toISODate } from '@/utils/date'
import { getWeekDays, formatWeekTitle, formatMonthTitle } from '@/composables/useCalendarDates'

export const useRetrospectiveStore = defineStore('retrospective', () => {
  const status = ref('idle') // idle | loading | ready | error
  const reportsByKey = ref({}) // { 'week:2026-06-29': Report, 'month:2026-07': Report }
  const reflectionsByDate = ref({}) // { [dateISO]: string } — F 데일리 저널의 한 줄 회고

  function keyFor(periodType, currentDate) {
    if (periodType === 'week') return `week:${toISODate(currentDate.startOf('week').toDate())}`
    return `month:${currentDate.format('YYYY-MM')}`
  }

  function datesFor(periodType, currentDate) {
    if (periodType === 'week') return getWeekDays(currentDate).map((d) => d.dateISO)
    const start = currentDate.startOf('month')
    const days = []
    for (let i = 0; i < currentDate.daysInMonth(); i++) {
      days.push(toISODate(start.add(i, 'day').toDate()))
    }
    return days
  }

  async function loadReport(periodType, currentDate, { force = false } = {}) {
    const key = keyFor(periodType, currentDate)
    if (!force && reportsByKey.value[key]) return reportsByKey.value[key]

    status.value = 'loading'
    const todoStore = useTodoStore()
    const scheduleStore = useScheduleStore()
    const dates = datesFor(periodType, currentDate)

    const todosByDate = {}
    const schedulesByDate = {}
    dates.forEach((d) => {
      todosByDate[d] = todoStore.list(d)
      schedulesByDate[d] = scheduleStore.list(d)
    })

    const periodLabel = periodType === 'week' ? formatWeekTitle(currentDate) : formatMonthTitle(currentDate)
    const result = await generateRetrospective({ periodType, periodLabel, dates, todosByDate, schedulesByDate })

    const report = {
      periodType,
      periodKey: key,
      periodLabel,
      ...result,
      generatedAt: Date.now(),
    }
    reportsByKey.value[key] = report
    status.value = 'ready'
    return report
  }

  function seedReports(reports) {
    reports.forEach((report) => {
      if (!reportsByKey.value[report.periodKey]) reportsByKey.value[report.periodKey] = report
    })
  }

  function setReflection(dateISO, text) {
    reflectionsByDate.value[dateISO] = text
  }

  const weeklyReportsList = computed(() =>
    Object.values(reportsByKey.value)
      .filter((r) => r.periodType === 'week')
      .sort((a, b) => b.generatedAt - a.generatedAt),
  )
  const monthlyReportsList = computed(() =>
    Object.values(reportsByKey.value)
      .filter((r) => r.periodType === 'month')
      .sort((a, b) => b.generatedAt - a.generatedAt),
  )

  return {
    status,
    reportsByKey,
    reflectionsByDate,
    loadReport,
    seedReports,
    setReflection,
    weeklyReportsList,
    monthlyReportsList,
  }
})
