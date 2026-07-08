<template>
  <div class="week-grid neu-raised">
    <div v-for="day in days" :key="day.dateISO" class="day-column" :class="{ 'is-today': day.isToday }">
      <button type="button" class="day-header" @click="$emit('select-day', day.dateISO)">
        <span class="weekday">{{ WEEKDAY_LABELS[day.date.day()] }}</span>
        <span class="day-num">{{ day.day }}</span>
      </button>

      <div class="day-body">
        <ScheduleCard
          v-for="s in schedulesFor(day.dateISO)"
          :key="s.id"
          :schedule="s"
          :draggable="false"
          compact
          @toggle-complete="scheduleStore.toggleComplete(day.dateISO, $event)"
        />
        <p v-if="schedulesFor(day.dateISO).length === 0" class="empty">일정 없음</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ScheduleCard from '@/components/daily-plan/ScheduleCard.vue'
import { getWeekDays } from '@/composables/useCalendarDates'
import { useScheduleStore } from '@/stores/schedule'

const props = defineProps({
  currentDate: { type: Object, required: true }, // dayjs
})
defineEmits(['select-day'])

const scheduleStore = useScheduleStore()
const days = computed(() => getWeekDays(props.currentDate))

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function schedulesFor(dateISO) {
  return [...scheduleStore.list(dateISO)].sort((a, b) => a.startMinutes - b.startMinutes)
}
</script>

<style scoped>
.week-grid {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}
.day-column {
  min-width: 0;
  border-radius: var(--p-radius-sm);
  padding: 8px;
}
.day-column.is-today {
  background: color-mix(in srgb, var(--p-rose) 8%, transparent);
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
}
.weekday {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--p-ink-faint);
}
.day-num {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--p-ink);
  font-variant-numeric: tabular-nums;
}
.is-today .day-num {
  color: var(--p-rose-ink);
}
.day-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 60px;
}
.empty {
  text-align: center;
  font-size: 0.72rem;
  color: var(--p-ink-faint);
  margin: 8px 0 0;
}
</style>
