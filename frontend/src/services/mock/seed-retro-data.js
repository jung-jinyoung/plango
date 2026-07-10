import dayjs from 'dayjs'
import { toISODate } from '@/utils/date'
import { formatWeekTitle, formatMonthTitle } from '@/composables/useCalendarDates'

// E3 히스토리 데모용 과거 리포트. 실제 todosByDate/schedulesByDate는 건드리지 않고
// 완성된 리포트 객체를 스토어에 직접 채워 넣는다 (화면 프리뷰 전용).
export function buildSeedReports() {
  const now = dayjs()
  const reports = []

  const weeks = [
    { offset: 1, completionRate: 72, breakdown: [8, 6, 5, 4, 4, 3, 3, 2] },
    { offset: 2, completionRate: 58, breakdown: [6, 4, 5, 3, 4, 2, 3, 1] },
    { offset: 3, completionRate: 81, breakdown: [7, 6, 4, 4, 3, 3, 2, 2] },
  ]
  weeks.forEach(({ offset, completionRate, breakdown }) => {
    const date = now.subtract(offset, 'week')
    const [roseTotal, roseDone, blueTotal, blueDone, greenTotal, greenDone, lavenderTotal, lavenderDone] = breakdown
    reports.push({
      periodType: 'week',
      periodKey: `week:${toISODate(date.startOf('week').toDate())}`,
      periodLabel: formatWeekTitle(date),
      completionRate,
      categoryBreakdown: [
        { color: 'rose', label: '운동', completed: roseDone, total: roseTotal },
        { color: 'blue', label: '자기계발', completed: blueDone, total: blueTotal },
        { color: 'green', label: '독서', completed: greenDone, total: greenTotal },
        { color: 'lavender', label: '취미', completed: lavenderDone, total: lavenderTotal },
      ],
      weeklyBreakdown: [],
      summary: `${formatWeekTitle(date)} 완료율은 ${completionRate}%였어요.`,
      generatedAt: date.valueOf(),
    })
  })

  const months = [
    { offset: 1, completionRate: 65, weekly: [58, 70, 62, 71] },
    { offset: 2, completionRate: 54, weekly: [48, 52, 55, 60] },
  ]
  months.forEach(({ offset, completionRate, weekly }) => {
    const date = now.subtract(offset, 'month')
    reports.push({
      periodType: 'month',
      periodKey: `month:${date.format('YYYY-MM')}`,
      periodLabel: formatMonthTitle(date),
      completionRate,
      categoryBreakdown: [
        { color: 'rose', label: '운동', completed: 18, total: 26 },
        { color: 'blue', label: '자기계발', completed: 12, total: 20 },
        { color: 'green', label: '독서', completed: 14, total: 18 },
        { color: 'lavender', label: '취미', completed: 8, total: 15 },
      ],
      weeklyBreakdown: weekly.map((value, i) => ({
        label: `${i + 1}주차`,
        value,
        color: ['rose', 'blue', 'green', 'lavender'][i],
      })),
      summary: `${formatMonthTitle(date)} 완료율은 ${completionRate}%였어요.`,
      generatedAt: date.valueOf(),
    })
  })

  return reports
}
