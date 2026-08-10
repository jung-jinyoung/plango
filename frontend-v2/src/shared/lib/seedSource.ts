// 두 페르소나 시드를 모두 번들에 정적으로 담아두고, 선택된 페르소나 하나만
// (필요하면 날짜 이동까지 적용해) 골라 내준다. goalRepository/taskRepository가
// 공통으로 거치는 단일 지점 — 페르소나 선택 로직을 리포지토리마다 중복하지 않는다.

import seedDataSeyeon from '../../../docs/seed-data.json'
import seedDataDoyoon from '../../../docs/seed-data.doyoon.json'
import { getSelectedPersona } from './persona'
import { getDemoToday, shiftSeedForDemo, type SeedData } from './seedDateShift'

const seedByPersona: Record<'seyeon' | 'doyoon', SeedData> = {
  seyeon: seedDataSeyeon as SeedData,
  doyoon: seedDataDoyoon as SeedData,
}

export function getActiveSeedData(): SeedData {
  const raw = seedByPersona[getSelectedPersona()]
  return shiftSeedForDemo(raw)
}

export { getDemoToday }
export type { SeedData }
