import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { toISODate } from '@/utils/date'

// 월간/주간/일간 화면과 AppHeader가 함께 바라보는 하나의 날짜 커서.
// "다음"을 누르면 현재 화면의 단위(월/주/일)만큼 이 커서가 이동한다.
export const useCalendarNavStore = defineStore('calendarNav', () => {
  const currentDate = ref(dayjs())

  const currentDateISO = computed(() => toISODate(currentDate.value.toDate()))

  function goToday() {
    currentDate.value = dayjs()
  }

  function step(unit, delta) {
    currentDate.value = currentDate.value.add(delta, unit)
  }

  return { currentDate, currentDateISO, goToday, step }
})
