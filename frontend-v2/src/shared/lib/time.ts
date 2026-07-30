// 시간 계산 유틸 — 이 파일 한 곳에만 둔다. 컴포넌트·entities에서 직접 날짜 연산 금지 (CLAUDE.md 5절)

/** 두 ISO 8601 문자열 사이의 분(minute) 차이 */
export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000)
}
