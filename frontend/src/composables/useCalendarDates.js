import dayjs from 'dayjs'
import { toISODate } from '@/utils/date'

// dayjs 기본 주 시작은 일요일 — 프로젝트 전역 WEEKDAY 배열(utils/date.js)과 맞춘다.

export function getMonthMatrix(current) {
  const startOfMonth = current.startOf('month')
  const endOfMonth = current.endOf('month')
  const startOfGrid = startOfMonth.startOf('week')
  const endOfGrid = endOfMonth.endOf('week')

  const weeks = []
  let cursor = startOfGrid
  while (cursor.isBefore(endOfGrid) || cursor.isSame(endOfGrid, 'day')) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(toCell(cursor, current))
      cursor = cursor.add(1, 'day')
    }
    weeks.push(week)
  }
  return weeks
}

export function getWeekDays(current) {
  const start = current.startOf('week')
  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(toCell(start.add(i, 'day'), current))
  }
  return days
}

function toCell(date, monthReference) {
  return {
    date,
    dateISO: toISODate(date.toDate()),
    day: date.date(),
    isCurrentMonth: date.month() === monthReference.month(),
    isToday: date.isSame(dayjs(), 'day'),
  }
}

export function formatMonthTitle(current) {
  return `${current.year()}년 ${current.month() + 1}월`
}

export function formatWeekTitle(current) {
  const start = current.startOf('week')
  const end = current.endOf('week')
  if (start.month() === end.month()) {
    return `${start.month() + 1}월 ${start.date()}일~${end.date()}일`
  }
  return `${start.month() + 1}월 ${start.date()}일~${end.month() + 1}월 ${end.date()}일`
}
