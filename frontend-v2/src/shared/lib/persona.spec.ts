import { beforeEach, describe, expect, it } from 'vitest'
import { __setRawPersonaForTest, DEFAULT_PERSONA, getSelectedPersona, setSelectedPersona } from './persona'

describe('persona — 페르소나 선택 상태', () => {
  beforeEach(() => {
    __setRawPersonaForTest(null)
  })

  it('저장된 값이 없으면 기본값(이서연)이다 — 기존 단일 시드와 동일하게 동작', () => {
    expect(getSelectedPersona()).toBe(DEFAULT_PERSONA)
    expect(getSelectedPersona()).toBe('seyeon')
  })

  it('setSelectedPersona로 저장한 값을 getSelectedPersona가 그대로 읽는다', () => {
    setSelectedPersona('doyoon')
    expect(getSelectedPersona()).toBe('doyoon')
  })

  it('저장된 값이 유효하지 않으면 기본값으로 되돌아간다', () => {
    __setRawPersonaForTest('not-a-real-persona')
    expect(getSelectedPersona()).toBe(DEFAULT_PERSONA)
  })
})
