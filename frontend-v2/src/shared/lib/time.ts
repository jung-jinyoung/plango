// 시간 계산 유틸 — 이 파일 한 곳에만 둔다. 컴포넌트·entities·스크립트에서
// 직접 날짜 연산 금지, 예외 없음 (CLAUDE.md 5절)

import { ref, type Ref } from 'vue'

/** 두 ISO 8601 문자열 사이의 분(minute) 차이 */
export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
}

/** ISO 8601 문자열에서 그 날의 자정 기준 분(minute)을 뽑는다.
 * 문자열에 박힌 시:분을 그대로 읽는다 — Date로 바꿔서 실행 머신의 로컬
 * 타임존에 의존하지 않는다(addDays/startOfWeek과 같은 이유). */
export function minutesOfDay(iso: string): number {
  const hh = Number(iso.slice(11, 13))
  const mm = Number(iso.slice(14, 16))
  return hh * 60 + mm
}

/**
 * 지금 이 순간을 KST(+09:00) ISO 8601 문자열로 만든다. UTC 타임스탬프에
 * 9시간을 더해 UTC getter로 읽는 방식이라, 실행 머신의 시스템 타임존과
 * 무관하게 항상 한국 표준시 기준으로 나온다 — new Date().getHours() 같은
 * 로컬 getter에 의존하면 머신 타임존에 따라 결과가 달라진다.
 */
export function nowIso(): string {
  const shifted = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const y = shifted.getUTCFullYear()
  const mo = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const d = String(shifted.getUTCDate()).padStart(2, '0')
  const h = String(shifted.getUTCHours()).padStart(2, '0')
  const mi = String(shifted.getUTCMinutes()).padStart(2, '0')
  const s = String(shifted.getUTCSeconds()).padStart(2, '0')
  return `${y}-${mo}-${d}T${h}:${mi}:${s}+09:00`
}

let sharedNow: Ref<string> | null = null

/**
 * 현재 시각을 KST ISO 문자열로 반응형 제공한다. 1분마다 갱신 — 컴포넌트에서
 * new Date()를 직접 부르지 않고 이 훅 하나만 쓴다(CLAUDE.md 5절). 모듈 스코프의
 * 같은 ref를 공유하므로, 여러 컴포넌트(TodayPage·타임라인 등)가 각자 불러도
 * 항상 동일한 인스턴스를 받는다 — 현재 시각 바 위치와 (드래그 등) 시점 분기가
 * 컴포넌트마다 미세하게 어긋나는 일이 없다.
 */
export function useNow(): Ref<string> {
  if (!sharedNow) {
    sharedNow = ref(nowIso())
    setInterval(() => {
      sharedNow!.value = nowIso()
    }, 60_000)
  }
  return sharedNow
}

/**
 * 'YYYY-MM-DD' 계산은 전부 UTC로만 한다 — 로컬 타임존이나 toISOString()의
 * 자정 오프셋에 좌우되지 않도록. 이 함수를 거치지 않고 직접
 * `new Date(...).toISOString().slice(0,10)` 식으로 계산하면, 로컬 자정이
 * UTC 기준으로 전날로 밀리는 버그가 난다(실제로 시드 스크립트에서 발생했었다).
 */
function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

/** 'YYYY-MM-DD'에 일수를 더한 새 'YYYY-MM-DD' */
export function addDays(dateKey: string, days: number): string {
  const dt = parseDateKey(dateKey)
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/** 그 날짜가 속한 주의 월요일 'YYYY-MM-DD' (CLAUDE.md 5절: 주의 시작은 월요일) */
export function startOfWeek(dateKey: string): string {
  const dt = parseDateKey(dateKey)
  const day = dt.getUTCDay() // 0=일 ... 6=토
  const diff = day === 0 ? -6 : 1 - day
  dt.setUTCDate(dt.getUTCDate() + diff)
  return dt.toISOString().slice(0, 10)
}

/** WeeklyGoal.weekOf 값 계산 — startOfWeek의 별칭. "이 날짜가 속한 주간 목표의 weekOf"라는 의미로 쓸 때 */
export const weekOfKey = startOfWeek

/** Date 객체를 'YYYY-MM-DD'로. 순수 계산용 Date(위 parseDateKey로 만든 것)에만 쓴다 */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** 분(minute)을 "8h 20m" 형태로. 정각이면 분은 생략("6h") */
export function formatMinutesAsHours(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

/** ISO 8601 문자열에서 'HH:MM'만 뽑는다 — minutesOfDay와 같은 이유로 문자열을 그대로 읽는다 */
export function formatHHMM(iso: string): string {
  return iso.slice(11, 16)
}
