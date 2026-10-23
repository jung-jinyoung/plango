import { describe, expect, it } from 'vitest'
import seedDataSeyeon from '../../../docs/seed-data.json'
import seedDataDoyoon from '../../../docs/seed-data.doyoon.json'
import type { Task } from '../../entities/types'

// 하루 경계는 자정이다(CLAUDE.md 5절) — 시드 생성 스크립트가 날짜를 넘기지 않고
// "24:48" 같은 시각을 써서 월간 합계가 NaN이 된 적이 있다. 두 페르소나 시드의
// 모든 블록이 같은 날 00:00~23:59 안에서 시작·끝나는지 확인한다.
const VALID_ISO = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:00\+09:00$/

describe.each([
  ['이서연', seedDataSeyeon.tasks as Task[]],
  ['김도윤', seedDataDoyoon.tasks as Task[]],
])('%s 시드의 시간 블록', (_name, tasks) => {
  const blocks = tasks.flatMap((t) =>
    [t.plannedBlock, t.actualBlock].flatMap((b) => (b ? [{ id: t.id, ...b }] : [])),
  )

  it('모든 시각이 00:00~23:59 형식이다', () => {
    const invalid = blocks.filter((b) => !VALID_ISO.test(b.start) || !VALID_ISO.test(b.end))
    expect(invalid).toEqual([])
  })

  it('블록이 자정을 넘기지 않고 끝이 시작보다 뒤다', () => {
    const invalid = blocks.filter(
      (b) => b.start.slice(0, 10) !== b.end.slice(0, 10) || b.end <= b.start,
    )
    expect(invalid).toEqual([])
  })
})
