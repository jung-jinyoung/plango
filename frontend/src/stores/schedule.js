import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScheduleStore = defineStore('schedule', () => {
  const schedulesByDate = ref({}) // { [dateISO]: Schedule[] }

  function ensureDate(dateISO) {
    if (!schedulesByDate.value[dateISO]) schedulesByDate.value[dateISO] = []
  }

  function list(dateISO) {
    ensureDate(dateISO)
    return schedulesByDate.value[dateISO]
  }

  function addSchedule(dateISO, entry) {
    ensureDate(dateISO)
    const schedule = {
      id: crypto.randomUUID(),
      todoId: entry.todoId ?? null,
      title: entry.title,
      startMinutes: entry.startMinutes,
      durationMinutes: entry.durationMinutes,
      categoryColor: entry.categoryColor ?? null,
      reason: entry.reason ?? null,
      completed: false,
      note: '',
      source: entry.source ?? 'manual',
    }
    schedulesByDate.value[dateISO].push(schedule)
    return schedule
  }

  function applyRecommendations(dateISO, recommendations) {
    for (const rec of recommendations) {
      addSchedule(dateISO, { ...rec, source: 'ai' })
    }
  }

  function toggleComplete(dateISO, id) {
    const schedule = list(dateISO).find((s) => s.id === id)
    if (schedule) schedule.completed = !schedule.completed
  }

  function setNote(dateISO, id, text) {
    const schedule = list(dateISO).find((s) => s.id === id)
    if (schedule) schedule.note = text
  }

  function removeSchedule(dateISO, id) {
    ensureDate(dateISO)
    schedulesByDate.value[dateISO] = list(dateISO).filter((s) => s.id !== id)
  }

  function moveSchedule(dateISO, id, newStartMinutes) {
    const schedule = list(dateISO).find((s) => s.id === id)
    if (schedule) schedule.startMinutes = newStartMinutes
  }

  // 주어진 시간대와 겹치는 기존 일정을 찾는다 (excludeId는 자기 자신 재배치 시 제외용)
  function findConflict(dateISO, { startMinutes, durationMinutes }, excludeId = null) {
    const end = startMinutes + durationMinutes
    return (
      list(dateISO).find(
        (s) => s.id !== excludeId && startMinutes < s.startMinutes + s.durationMinutes && end > s.startMinutes,
      ) ?? null
    )
  }

  // D6 "자동 재배치": 겹치는 일정 바로 뒤(10분 간격)로 밀어 넣을 다음 빈 시간을 찾는다
  function nextFreeStart(dateISO, { startMinutes, durationMinutes }, excludeId = null) {
    const GAP = 10
    let start = startMinutes
    let conflict = findConflict(dateISO, { startMinutes: start, durationMinutes }, excludeId)
    while (conflict) {
      start = conflict.startMinutes + conflict.durationMinutes + GAP
      conflict = findConflict(dateISO, { startMinutes: start, durationMinutes }, excludeId)
    }
    return start
  }

  return {
    schedulesByDate,
    list,
    addSchedule,
    applyRecommendations,
    toggleComplete,
    setNote,
    removeSchedule,
    moveSchedule,
    findConflict,
    nextFreeStart,
  }
})
