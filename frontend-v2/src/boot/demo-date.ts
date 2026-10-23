import { defineBoot } from '#q-app'
import { getDemoToday, isDemoFreshEnabled } from '../shared/lib/seedDateShift'
import { setNowDateOverride } from '../shared/lib/time'

// 체험 배포에서 현재 시각의 날짜를 화면의 "오늘"(이번 주 수요일)에 맞춘다 —
// 이유는 time.ts setNowDateOverride 참고. getDemoToday()는 이 호출 전에 실제
// 날짜로 이번 주를 계산하므로 순서가 중요하다.
export default defineBoot(() => {
  if (isDemoFreshEnabled()) setNowDateOverride(getDemoToday())
})
