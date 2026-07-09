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
            <span class="day-num">{{ cell.day }}</span>
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

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const MAX_DOTS = 3

function dotsFor(dateISO) {
  return scheduleStore.list(dateISO).slice(0, MAX_DOTS)
}
function overflowFor(dateISO) {
  return Math.max(0, scheduleStore.list(dateISO).length - MAX_DOTS)
}

// 오늘이 속한 주(週)만 박스로 강조한다
const currentWeekIndex = computed(() => weeks.value.findIndex((week) => week.some((cell) => cell.isToday)))
</script>

<style scoped>
.month-grid {
  padding: 16px;
}
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}
.weekday-row span {
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--p-ink-faint);
}
.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}
.week-block {
  position: relative;
}
.week-block.is-current-week {
  margin: 14px -8px 12px;
  padding: 10px 8px 4px;
  border: 1.5px solid var(--p-rose);
  border-radius: 14px;
  background: color-mix(in srgb, var(--p-rose) 5%, transparent);
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
  left: 50%;
  transform: translateX(-50%);
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
  min-height: 84px;
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
.day-cell.is-other-month .day-num {
  color: var(--p-ink-faint);
}
.day-cell.is-today .day-num {
  color: #fff;
  background: var(--p-rose);
  border-radius: 50%;
}
.day-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--p-ink);
  font-variant-numeric: tabular-nums;
}
.day-cell.is-current-week-cell .day-num {
  font-size: 0.94rem;
  font-weight: 800;
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
