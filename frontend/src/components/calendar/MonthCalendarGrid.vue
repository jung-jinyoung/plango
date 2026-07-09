<template>
  <div class="month-grid neu-raised">
    <div class="weekday-row">
      <span v-for="w in WEEKDAY_LABELS" :key="w">{{ w }}</span>
    </div>
    <template v-for="(week, wi) in weeks" :key="wi">
      <div class="week-block" :class="{ 'is-current-week': wi === currentWeekIndex }">
        <button
          v-if="wi === currentWeekIndex"
          type="button"
          class="week-label"
          @click="$emit('select-week', week[0].dateISO)"
        >
          Week {{ wi + 1 }}
        </button>
        <div class="week-row">
          <button
            v-for="cell in week"
            :key="cell.dateISO"
            type="button"
            class="day-cell"
            :class="{
              'is-other-month': !cell.isCurrentMonth,
              'is-today': cell.isToday,
              'is-current-week-cell': wi === currentWeekIndex,
            }"
            @click="$emit('select-day', cell.dateISO)"
          >
            <span class="day-num-row">
              <span v-if="monthLabelFor(cell)" class="month-label">{{ monthLabelFor(cell) }}</span>
              <span class="day-num">{{ cell.day }}</span>
            </span>
            <span class="dots">
              <span
                v-for="s in dotsFor(cell.dateISO)"
                :key="s.id"
                class="dot"
                :class="`is-${s.categoryColor}`"
              />
              <span v-if="overflowFor(cell.dateISO) > 0" class="more">+{{ overflowFor(cell.dateISO) }}</span>
            </span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getMonthMatrix } from '@/composables/useCalendarDates'
import { useScheduleStore } from '@/stores/schedule'

const props = defineProps({
  currentDate: { type: Object, required: true }, // dayjs
})
defineEmits(['select-day', 'select-week'])

const scheduleStore = useScheduleStore()
const weeks = computed(() => getMonthMatrix(props.currentDate))

const WEEKDAY_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const MAX_DOTS = 3

function dotsFor(dateISO) {
  return scheduleStore.list(dateISO).slice(0, MAX_DOTS)
}
function overflowFor(dateISO) {
  return Math.max(0, scheduleStore.list(dateISO).length - MAX_DOTS)
}

// 오늘이 속한 주(週)만 박스로 강조한다
const currentWeekIndex = computed(() => weeks.value.findIndex((week) => week.some((cell) => cell.isToday)))

// 달이 바뀌는 경계의 첫 날짜에만 영문 월 이름을 붙인다 (예: june/28, july/1)
const MONTH_LABELS_EN = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]
const monthBoundaryDates = computed(() => {
  const set = new Set()
  let prevMonth = null
  for (const week of weeks.value) {
    for (const cell of week) {
      const month = cell.date.month()
      if (month !== prevMonth) {
        set.add(cell.dateISO)
        prevMonth = month
      }
    }
  }
  return set
})
function monthLabelFor(cell) {
  if (!monthBoundaryDates.value.has(cell.dateISO)) return ''
  return MONTH_LABELS_EN[cell.date.month()]
}
</script>

<style scoped>
.month-grid {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 20px;
}
.weekday-row span {
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--p-rose);
}
.week-row {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}
.week-block {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.week-block.is-current-week {
  margin: 18px -10px 16px;
  padding: 16px 12px 8px;
  border: 1.5px solid var(--p-rose);
  border-radius: 18px;
  background: color-mix(in srgb, var(--p-rose) 6%, var(--p-surface));
  box-shadow: var(--p-shadow-raised);
}
.week-block.is-current-week .week-row {
  margin-bottom: 0;
}
.week-label {
  appearance: none;
  border: none;
  cursor: pointer;
  position: absolute;
  top: -12px;
  left: 14px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: var(--p-rose);
  box-shadow: var(--p-shadow-raised-sm);
  z-index: 2;
}
.day-cell {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  border-radius: var(--p-radius-xs);
  min-height: 96px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  transition: background 150ms ease;
}
.day-cell:hover {
  background: var(--p-bg);
}
.day-cell.is-current-week-cell {
  min-height: 108px;
}
.day-cell.is-current-week-cell:hover {
  background: color-mix(in srgb, var(--p-rose) 14%, transparent);
}
.day-num-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.month-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--p-ink-faint);
}
.day-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--p-ink-muted);
  font-variant-numeric: tabular-nums;
}
.day-cell.is-current-week-cell .day-num {
  font-size: 0.94rem;
  font-weight: 800;
  color: var(--p-ink);
}
.day-cell.is-other-month .day-num {
  color: var(--p-ink-faint);
}
.day-cell.is-today .day-num {
  color: #fff;
  background: var(--p-rose);
  border-radius: 50%;
  box-shadow: var(--p-shadow-raised-sm);
}
.dots {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-rose);
}
.dot.is-blue {
  background: var(--p-blue);
}
.dot.is-green {
  background: var(--p-green);
}
.dot.is-lavender {
  background: var(--p-lavender);
}
.more {
  font-size: 0.66rem;
  color: var(--p-ink-faint);
  font-weight: 600;
}
</style>
