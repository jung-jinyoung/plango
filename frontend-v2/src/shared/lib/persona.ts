// 포트폴리오 데모용 페르소나 선택 — product-spec.md 2절의 주 타겟(이서연)·
// 부 타겟(김도윤)을 QR/URL로 골라 체험할 수 있게 한다. 제품 도메인이 아니라
// 데모 배포 인프라라 features/*가 아니라 shared/lib에 둔다.

export type PersonaId = 'seyeon' | 'doyoon'

export const DEFAULT_PERSONA: PersonaId = 'seyeon'

const STORAGE_KEY = 'plango-demo-persona'

export interface PersonaMeta {
  id: PersonaId
  name: string
  role: string
  description: string
  // 소개 랜딩용 — 이름보다 상황을 먼저 보여준다(처음 온 방문자에게 이름은 의미가 없다)
  situation: string
  // 들어가면 보게 될 것 — 시드 데이터에 실제로 있는 장면만 쓴다
  preview: string[]
}

export const PERSONA_META: Record<PersonaId, PersonaMeta> = {
  seyeon: {
    id: 'seyeon',
    name: '이서연',
    role: '27세 · 대학원생',
    description: '논문을 쓰는 중이에요. 진도가 안 보여 불안하고, 스스로 계획을 쪼개고 있어요.',
    situation: '논문 마감이 다가오는 대학원생의 한 주',
    preview: ['처음 예상보다 늘어난 논문 작업량', '3주째 밀리고 있는 분석 작업'],
  },
  doyoon: {
    id: 'doyoon',
    name: '김도윤',
    role: '32세 · 재택 직장인',
    description: '회사 일과 사이드 프로젝트를 같이 굴리고 있어요. 저녁과 주말에 몰아서 확인해요.',
    situation: '회사 일과 사이드 프로젝트를 같이 하는 직장인의 한 주',
    preview: ['약속 3개 사이에 끼워 넣은 작업 시간', '3주째 밀리고 있는 대시보드 작업'],
  },
}

function isPersonaId(value: unknown): value is PersonaId {
  return value === 'seyeon' || value === 'doyoon'
}

// 실제 배포(브라우저)에서는 window.localStorage를 쓴다. 테스트 환경(happy-dom)에서
// window.localStorage가 undefined로 나오는 조합이 있어(vitest ↔ happy-dom 버전
// 조합 이슈, 브라우저 자체 문제는 아니다) 메모리 폴백을 둔다 — 새로고침 사이
// 유지는 안 되지만 get/set 왕복 동작은 테스트에서 그대로 검증할 수 있다.
const memoryStore = new Map<string, string>()

function storage(): Pick<Storage, 'getItem' | 'setItem'> {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => {
      memoryStore.set(key, value)
    },
  }
}

/** 저장된 값이 없거나 유효하지 않으면 DEFAULT_PERSONA(이서연) — 기존 단일 시드와 동일하게 동작한다 */
export function getSelectedPersona(): PersonaId {
  const stored = storage().getItem(STORAGE_KEY)
  return isPersonaId(stored) ? stored : DEFAULT_PERSONA
}

export function setSelectedPersona(id: PersonaId): void {
  storage().setItem(STORAGE_KEY, id)
}

/**
 * 테스트 전용 — 저장소를 초기화하거나(null) 임의의 원시 값을 직접 써넣는다
 * (유효하지 않은 저장값 fallback을 검증하려면 PersonaId가 아닌 값을 써야 한다).
 */
export function __setRawPersonaForTest(value: string | null): void {
  if (value === null) {
    memoryStore.delete(STORAGE_KEY)
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  storage().setItem(STORAGE_KEY, value)
}
