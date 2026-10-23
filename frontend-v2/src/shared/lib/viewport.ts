// 좁은 화면(폰) 판정 — 오늘 화면(3열 캘린더)은 넓은 화면 전용이다. 모바일에는 캘린더 전체를
// 넣지 않는다(CLAUDE.md 13절) — 폰에서는 모바일 실행 화면으로 안내한다.

import { onBeforeUnmount, ref, type Ref } from 'vue'

const NARROW_QUERY = '(max-width: 767px)'

function mediaQuery(): MediaQueryList | null {
  return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(NARROW_QUERY) : null
}

export function isNarrowViewport(): boolean {
  return mediaQuery()?.matches ?? false
}

/** 화면 폭이 바뀌면(회전 등) 따라 바뀌는 좁은 화면 여부 */
export function useNarrowViewport(): Ref<boolean> {
  const narrow = ref(isNarrowViewport())
  const query = mediaQuery()
  const onChange = (event: MediaQueryListEvent) => {
    narrow.value = event.matches
  }
  query?.addEventListener('change', onChange)
  onBeforeUnmount(() => query?.removeEventListener('change', onChange))
  return narrow
}
