<template>
  <div class="week-grid neu-raised">
    <div class="header-row">
      <div class="hour-gutter-spacer" />
      <div class="day-headers">
        <button
          v-for="day in days"
          :key="day.dateISO"
          type="button"
          class="day-header"
          :class="{ 'is-today': day.isToday }"
          @click="$emit('select-day', day.dateISO)"
        >
          <span class="weekday">{{ WEEKDAY_LABELS[day.date.day()] }}</span>
          <span class="day-num">{{ day.day }}</span>
        </button>
      </div>
    </div>

    <div class="timeline-scroll">
      <div class="grid" :style="{ height: `${totalHeight}px` }">
        <div class="hours">
          <div v-for="h in hours" :key="h" class="hour-row" :style="{ height: `${pxPerHour}px` }">
            <span class="hour-label">{{ String(h).padStart(2, '0') }}:00</span>
          </div>
        </div>

        <div class="day-tracks" :style="tracksBackgroundStyle">
          <div v-for="day in days" :key="day.dateISO" class="day-track">
            <div
              v-for="s in schedulesFor(day.dateISO)"
              :key="s.id"
              class="slot"
              :class="`is-${s.categoryColor}`"
              :style="slotStyle(s)"
            >
              <ScheduleCard
                :schedule="s"
                compact
                :draggable="false"
                @toggle-complete="scheduleStore.toggleComplete(day.dateISO, $event)"
              />
            </div>
          </div>
        </div>

        <div v-if="isCurrentWeek && nowLineTop !== null" class="now-line-full" :style="{ top: `${nowLineTop}px` }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import { getWeekDays } from '@/composables/useCalendarDates'
import { useScheduleStore } from '@/stores/schedule'

const props = defineProps({
  currentDate: { type: Object, required: true }, // dayjs
  startHour: { type: Number, default: 6 },
  endHour: { type: Number, default: 24 },
})
defineEmits(['select-day'])

const scheduleStore = useScheduleStore()
const days = computed(() => getWeekDays(props.currentDate))

const WEEKDAY_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const pxPerHour = 56
const pxPerMinute = pxPerHour / 60
const MIN_HEIGHT = 30

const hours = computed(() => {
  const arr = []
  for (let h = props.startHour; h < props.endHour; h++) arr.push(h)
  return arr
})
const totalHeight = computed(() => (props.endHour - props.startHour) * pxPerHour)

const tracksBackgroundStyle = computed(() => ({
  backgroundImage: `repeating-linear-gradient(to bottom, color-mix(in srgb, var(--p-ink) 8%, transparent) 0, color-mix(in srgb, var(--p-ink) 8%, transparent) 1px, transparent 1px, transparent ${pxPerHour}px)`,
}))

function schedulesFor(dateISO) {
  return [...scheduleStore.list(dateISO)].sort((a, b) => a.startMinutes - b.startMinutes)
}

function slotStyle(schedule) {
  const top = (schedule.startMinutes - props.startHour * 60) * pxPerMinute
  const height = Math.max(schedule.durationMinutes * pxPerMinute, MIN_HEIGHT)
  return { top: `${top}px`, height: `${height}px` }
}

// "현재 시각" 표시선 — 1분 단위로 갱신하기엔 과하니 1분 간격이면 충분
const nowMinutes = ref(new Date().getHours() * 60 + new Date().getMinutes())
let nowTimer = null
onMounted(() => {
  nowTimer = setInterval(() => {
    nowMinutes.value = new Date().getHours() * 60 + new Date().getMinutes()
  }, 60000)
})
onUnmounted(() => {
  if (nowTimer) clearInterval(nowTimer)
})

const nowLineTop = computed(() => {
  const min = props.startHour * 60
  const max = props.endHour * 60
  if (nowMinutes.value < min || nowMinutes.value > max) return null
  return (nowMinutes.value - min) * pxPerMinute
})
const isCurrentWeek = computed(() => days.value.some((d) => d.isToday))
</script>

<style scoped>
.week-grid {
  max-width: 960px;
  padding: 12px;
}
.header-row {
  display: flex;
}
.hour-gutter-spacer {
  width: 50px;
  flex-shrink: 0;
}
.day-headers {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.day-header {
  appearance: none;
  border: none;
  cursor: pointer;
  background: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 0 10px;
  border-radius: var(--p-radius-sm);
}
.weekday {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--p-rose);
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
.day-header.is-today .day-num {
  color: #fff;
  background: var(--p-rose);
  border-radius: 50%;
  box-shadow: var(--p-shadow-raised-sm);
}

.timeline-scroll {
  margin-top: 8px;
  padding-top: 12px;
}
.grid {
  position: relative;
  display: flex;
}
.hours {
  width: 50px;
  flex-shrink: 0;
  position: relative;
}
.hour-row {
  position: relative;
}
.hour-label {
  position: absolute;
  top: -8px;
  left: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--p-ink-muted);
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  background: var(--p-surface);
  padding: 0 4px 0 0;
}
.day-tracks {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
}
.day-track {
  position: relative;
  border-left: 1px solid color-mix(in srgb, var(--p-ink) 6%, transparent);
}
.now-line-full {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 2px solid var(--p-rose);
  z-index: 4;
  pointer-events: none;
}
.now-line-full::before,
.now-line-full::after {
  content: '';
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-rose);
}
.now-line-full::before {
  left: -3px;
}
.now-line-full::after {
  right: -3px;
}
.slot {
  position: absolute;
  left: 3px;
  right: 3px;
  padding: 3px;
  border-radius: calc(var(--p-radius-sm) + 3px);
}
.slot.is-rose {
  background: color-mix(in srgb, var(--p-rose) 16%, transparent);
}
.slot.is-blue {
  background: color-mix(in srgb, var(--p-blue) 16%, transparent);
}
.slot.is-green {
  background: color-mix(in srgb, var(--p-green) 16%, transparent);
}
.slot.is-lavender {
  background: color-mix(in srgb, var(--p-lavender) 16%, transparent);
}

/* 좁은 요일 컬럼 폭에 맞춰 ScheduleCard의 시간/제목 줄을 필요시 줄바꿈 (컴포넌트 자체는 안 건드림) */
.slot :deep(.row-1) {
  flex-wrap: wrap;
  row-gap: 2px;
}
.slot :deep(.time) {
  flex-shrink: 1;
}
.slot :deep(.title) {
  white-space: normal;
}
</style>
