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
          <div v-for="h in hours" :key="h" class="hour-row" :style="{ height: `${hourRowHeight(h)}px` }">
            <span class="hour-label">{{ String(h).padStart(2, '0') }}:00</span>
          </div>
        </div>

        <div class="day-tracks">
          <div class="hour-lines">
            <div v-for="h in hours" :key="h" class="hour-line-row" :style="{ height: `${hourRowHeight(h)}px` }" />
          </div>
          <div v-for="day in days" :key="day.dateISO" class="day-track">
            <button
              v-for="s in schedulesFor(day.dateISO)"
              :key="s.id"
              type="button"
              class="slot"
              :class="`is-${s.categoryColor}`"
              :style="slotStyle(s, day.dateISO)"
              :title="`${minutesToLabel(s.startMinutes)} ${s.title}`"
              @click="openInfo(day.dateISO, s)"
            >
              <span class="slot-time">{{ minutesToLabel(s.startMinutes) }}</span>
              <span class="slot-title" :class="{ 'is-compact': isCompact(s) }">{{ s.title }}</span>
            </button>
          </div>
        </div>

        <div v-if="isCurrentWeek && nowLineTop !== null" class="now-line-full" :style="{ top: `${nowLineTop}px` }" />
      </div>
    </div>

    <ScheduleInfoModal v-model="showInfoModal" :schedule="selectedSchedule" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ScheduleInfoModal from './ScheduleInfoModal.vue'
import { getWeekDays } from '@/composables/useCalendarDates'
import { useScheduleStore } from '@/stores/schedule'
import { minutesToLabel } from '@/utils/date'

const props = defineProps({
  currentDate: { type: Object, required: true }, // dayjs
  startHour: { type: Number, default: 6 },
  endHour: { type: Number, default: 24 },
})
defineEmits(['select-day'])

const scheduleStore = useScheduleStore()
const days = computed(() => getWeekDays(props.currentDate))

const WEEKDAY_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const pxPerHour = 72
const pxPerMinute = pxPerHour / 60
const MIN_HEIGHT = 38
const COMPACT_DURATION_MINUTES = 45

function isCompact(schedule) {
  return schedule.durationMinutes < COMPACT_DURATION_MINUTES
}

const hours = computed(() => {
  const arr = []
  for (let h = props.startHour; h < props.endHour; h++) arr.push(h)
  return arr
})

function schedulesFor(dateISO) {
  return [...scheduleStore.list(dateISO)].sort((a, b) => a.startMinutes - b.startMinutes)
}

// 짧은 일정은 MIN_HEIGHT 때문에 실제 소요 시간보다 크게 그려진다 — 그 초과분만큼
// 시간대(hour) 행 자체가 늘어나야, 몰린 요일 기준으로 뒤 시간대들이 밀리면서도
// 모든 요일이 같은 시간축(라벨·그리드선)을 공유한 채 어긋나지 않는다 (DailyTimeline과 동일한 패턴을
// 요일 축으로 확장 — 행 높이·표시선 모두 '시간대(hour) 단위' 초과분을 기준으로 계산한다)
function pureTimeHeight(durationMinutes) {
  return durationMinutes * pxPerMinute
}
function effectiveHeightOf(schedule) {
  return Math.max(pureTimeHeight(schedule.durationMinutes), MIN_HEIGHT)
}
function extraHeightOf(schedule) {
  return Math.max(effectiveHeightOf(schedule) - pureTimeHeight(schedule.durationMinutes), 0)
}

// 특정 요일이 특정 시간대(hour)에 끝내는 일정들이 만드는 초과 높이 합
function dayExtraForHour(dateISO, h) {
  let extra = 0
  for (const s of schedulesFor(dateISO)) {
    const e = extraHeightOf(s)
    if (!e) continue
    const insertionMinute = s.startMinutes + s.durationMinutes
    if (Math.floor((insertionMinute - 1) / 60) === h) extra += e
  }
  return extra
}
// 그 시간대 행이 늘어나야 하는 높이 = 7일 중 가장 붐비는 요일 기준 (다른 요일은 그만큼 빈 공간)
function hourExtra(h) {
  return Math.max(0, ...days.value.map((d) => dayExtraForHour(d.dateISO, h)))
}
function hourRowHeight(h) {
  return pxPerHour + hourExtra(h)
}
// 대상 시각보다 완전히 앞선 시간대들의 누적 초과 높이 — 모든 요일이 공유하는 그리드 기준
function priorHoursExtra(minutes) {
  const targetHour = Math.floor(minutes / 60)
  let extra = 0
  for (const h of hours.value) {
    if (h < targetHour) extra += hourExtra(h)
  }
  return extra
}
// 같은 시간대(hour) 안에서, 이 요일 자신의 앞선 일정이 만든 초과 높이 (요일별 로컬)
function withinHourDisplacement(dateISO, minutes) {
  const h = Math.floor(minutes / 60)
  let extra = 0
  for (const s of schedulesFor(dateISO)) {
    const e = extraHeightOf(s)
    if (!e) continue
    const insertionMinute = s.startMinutes + s.durationMinutes
    if (Math.floor((insertionMinute - 1) / 60) === h && insertionMinute <= minutes) extra += e
  }
  return extra
}

const totalHeight = computed(() => hours.value.reduce((sum, h) => sum + hourRowHeight(h), 0))

function slotStyle(schedule, dateISO) {
  const top =
    (schedule.startMinutes - props.startHour * 60) * pxPerMinute +
    priorHoursExtra(schedule.startMinutes) +
    withinHourDisplacement(dateISO, schedule.startMinutes)
  const height = effectiveHeightOf(schedule)
  return { top: `${top}px`, height: `${height}px` }
}

const showInfoModal = ref(false)
const selectedSchedule = ref(null)
function openInfo(dateISO, schedule) {
  selectedSchedule.value = { ...schedule, dateISO }
  showInfoModal.value = true
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
  return (nowMinutes.value - min) * pxPerMinute + priorHoursExtra(nowMinutes.value)
})
const isCurrentWeek = computed(() => days.value.some((d) => d.isToday))
</script>

<style scoped>
.week-grid {
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
.hour-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hour-line-row {
  border-top: 1px solid color-mix(in srgb, var(--p-ink) 8%, transparent);
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
  display: flex;
  flex-direction: column;
  gap: 1px;
  appearance: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  padding: 4px 7px;
  border-radius: var(--p-radius-sm);
  border: 2.5px solid var(--card-accent, var(--p-ink-faint));
  background: color-mix(in srgb, var(--card-accent, var(--p-ink-faint)) 16%, var(--p-surface));
  overflow: hidden;
}
.slot.is-rose {
  --card-accent: var(--p-rose);
  --card-accent-ink: var(--p-rose-ink);
}
.slot.is-blue {
  --card-accent: var(--p-blue);
  --card-accent-ink: var(--p-blue-ink);
}
.slot.is-green {
  --card-accent: var(--p-green);
  --card-accent-ink: var(--p-green-ink);
}
.slot.is-lavender {
  --card-accent: var(--p-lavender);
  --card-accent-ink: var(--p-lavender-ink);
}
.slot.is-amber {
  --card-accent: var(--p-amber);
  --card-accent-ink: var(--p-amber-ink);
}
.slot.is-teal {
  --card-accent: var(--p-teal);
  --card-accent-ink: var(--p-teal-ink);
}
.slot.is-plum {
  --card-accent: var(--p-plum);
  --card-accent-ink: var(--p-plum-ink);
}
.slot.is-slate {
  --card-accent: var(--p-slate);
  --card-accent-ink: var(--p-slate-ink);
}
.slot-time {
  flex-shrink: 0;
  font-size: 0.66rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, 'SF Mono', monospace;
  color: var(--card-accent-ink, var(--p-ink-muted));
}
.slot-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--p-ink);
}
.slot-title.is-compact {
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
