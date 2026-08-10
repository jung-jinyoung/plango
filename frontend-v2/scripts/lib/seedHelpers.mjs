// 시드 생성 스크립트 공용 헬퍼 — generate-seed.mjs(이서연)와
// generate-seed-doyoon.mjs(김도윤)가 공유한다. 저수준 날짜·ID 조립만
// 여기 두고, 페르소나별 서사(목표 제목·일정 배치)는 각 스크립트에 그대로 둔다.

const TZ = '+09:00'

/** 'YYYY-MM-DD' + 시:분 → ISO 8601(+09:00) 문자열 */
export function iso(dateStr, hh, mm = 0) {
  const h = String(hh).padStart(2, '0')
  const m = String(mm).padStart(2, '0')
  return `${dateStr}T${h}:${m}:00${TZ}`
}

/** 분(minute) 오프셋 → HH:MM 기준 TimeBlock */
export function block(dateStr, startMin, durationMin) {
  const sh = Math.floor(startMin / 60)
  const sm = startMin % 60
  const eh = Math.floor((startMin + durationMin) / 60)
  const em = (startMin + durationMin) % 60
  return { start: iso(dateStr, sh, sm), end: iso(dateStr, eh, em) }
}

/**
 * task id 채번기 — prefix는 라벨일 뿐, 번호는 전체에서 계속 이어진다
 * (wg-achieved-0-1, wg-achieved-0-2, wg-achieved-1-3, ...). 스크립트마다
 * 독립된 카운터가 필요하므로 팩토리로 내준다.
 */
export function createIdGenerator() {
  let seq = 0
  return (prefix) => `${prefix}-${(seq += 1)}`
}
