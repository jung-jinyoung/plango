// 시간 계산 유틸 — 이 파일 한 곳에만 둔다. 컴포넌트·entities·스크립트에서
// 직접 날짜 연산 금지, 예외 없음 (CLAUDE.md 5절)

/** 두 ISO 8601 문자열 사이의 분(minute) 차이 */
export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
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
