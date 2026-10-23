// 라이트·다크 전환 — 헤더 토글이 전체 화면에 적용한다. <html data-theme>만 바꾸고
// 색은 tokens.css의 html[data-theme='dark'] 블록이 맡는다. 기본은 라이트.
// 고른 값은 브라우저에 기억하되, 저장소를 못 쓰는 환경(시크릿 모드 등)에서도 동작한다.

import { ref } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'plango-theme'

// persona.ts와 같은 이유로 메모리 폴백을 둔다 — 테스트 환경(happy-dom)에선
// window.localStorage가 없을 수 있고, 시크릿 모드 등에선 접근이 막힐 수 있다.
const memoryStore = new Map<string, string>()

function storage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch {
    // 접근 자체가 막힌 환경 — 아래 메모리 폴백
  }
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => void memoryStore.set(key, value),
    removeItem: (key) => void memoryStore.delete(key),
  }
}

function readStored(): Theme {
  try {
    return storage().getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const theme = ref<Theme>('light')

function apply(value: Theme) {
  document.documentElement.dataset.theme = value
}

/** 앱 시작 시 한 번 — 저장된 값을 적용한다(boot/theme.ts) */
export function initTheme(): void {
  theme.value = readStored()
  apply(theme.value)
}

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    apply(theme.value)
    try {
      storage().setItem(STORAGE_KEY, theme.value)
    } catch {
      // 저장 못 해도 이번 방문 동안은 전환된 채로 둔다
    }
  }
  return { theme, toggle }
}

/** 테스트 전용 — 저장값과 상태를 처음으로 되돌린다 */
export function __resetThemeForTest(): void {
  storage().removeItem(STORAGE_KEY)
  theme.value = 'light'
  delete document.documentElement.dataset.theme
}
