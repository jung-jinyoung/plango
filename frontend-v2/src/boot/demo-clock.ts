import { defineBoot } from '#q-app'
import { getSelectedPersona, PERSONA_META } from '../shared/lib/persona'
import { getDemoToday, isDemoFreshEnabled } from '../shared/lib/seedDateShift'
import { setNowOverride } from '../shared/lib/time'

// 체험 배포에서 "지금"을 선택된 페르소나의 장면 시각(화면의 오늘 + demoStartTime)에서
// 시작해 실제 시간만큼 흐르게 한다 — 이유는 time.ts setNowOverride 참고.
// getDemoToday()는 이 호출 전에 실제 날짜로 이번 주를 계산하므로 순서가 중요하다.
// 페르소나를 바꾸면 전체 새로고침이라 boot가 다시 돌며 새 장면 시각이 적용된다.
export default defineBoot(() => {
  if (!isDemoFreshEnabled()) return
  const { demoStartTime } = PERSONA_META[getSelectedPersona()]
  setNowOverride(`${getDemoToday()}T${demoStartTime}:00+09:00`)
})
