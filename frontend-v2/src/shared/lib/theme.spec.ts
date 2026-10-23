import { afterEach, describe, expect, it } from 'vitest'
import { __resetThemeForTest, initTheme, useTheme } from './theme'

describe('theme', () => {
  afterEach(() => {
    __resetThemeForTest()
  })

  it('저장된 값이 없으면 라이트로 시작한다', () => {
    initTheme()
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('토글하면 <html data-theme>이 바뀌고 다음 방문에도 기억한다', () => {
    initTheme()
    useTheme().toggle()
    expect(document.documentElement.dataset.theme).toBe('dark')

    initTheme() // 새로 들어온 것처럼
    expect(useTheme().theme.value).toBe('dark')
  })
})
