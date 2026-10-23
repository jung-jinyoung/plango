import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PersonaPickerPage from './PersonaPickerPage.vue'
import { __setRawPersonaForTest, getSelectedPersona } from '../shared/lib/persona'

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/demo', name: 'persona-picker', component: PersonaPickerPage },
      { path: '/today', name: 'today', component: { template: '<div />' } },
      { path: '/mobile-run', name: 'mobile-run', component: { template: '<div />' } },
    ],
  })
}

describe('PersonaPickerPage', () => {
  let assignSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    __setRawPersonaForTest(null)
    assignSpy = vi.spyOn(window.location, 'assign').mockImplementation(() => {})
  })

  afterEach(() => {
    assignSpy.mockRestore()
  })

  it('쿼리 파라미터 없이 들어오면 페르소나 카드 2개를 보여준다', async () => {
    const router = makeRouter()
    await router.push('/demo')
    await router.isReady()

    const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('이서연')
    expect(wrapper.text()).toContain('김도윤')
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('카드의 "체험해보기"를 누르면 그 페르소나가 저장되고 today로 리로드한다', async () => {
    const router = makeRouter()
    await router.push('/demo')
    await router.isReady()

    const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })
    const buttons = wrapper.findAll('.persona-card button')
    expect(buttons).toHaveLength(2)

    await buttons[1]!.trigger('click') // 두 번째 카드 = 김도윤(PERSONA_META 등록 순서)

    expect(getSelectedPersona()).toBe('doyoon')
    expect(assignSpy).toHaveBeenCalledWith('/today')
  })

  it('히어로의 "체험해보기"는 페르소나를 고르지 않고 선택 섹션으로 스크롤만 한다', async () => {
    const router = makeRouter()
    await router.push('/demo')
    await router.isReady()

    const scrollSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollSpy
    const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })
    await wrapper.find('.hero button').trigger('click')

    expect(scrollSpy).toHaveBeenCalled()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('폰 폭에서 고르면 오늘 화면(3열 캘린더) 대신 모바일 실행으로 간다', async () => {
    const matchMedia = vi
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList)
    try {
      const router = makeRouter()
      await router.push('/demo')
      await router.isReady()

      const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })
      await wrapper.findAll('.persona-card button')[0]!.trigger('click')

      expect(assignSpy).toHaveBeenCalledWith('/mobile-run')
    } finally {
      matchMedia.mockRestore()
    }
  })

  it('?p=doyoon으로 들어오면 카드를 보여주지 않고 즉시 페르소나를 선택해 리로드한다', async () => {
    const router = makeRouter()
    await router.push('/demo?p=doyoon')
    await router.isReady()

    const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(getSelectedPersona()).toBe('doyoon')
    expect(assignSpy).toHaveBeenCalledWith('/today')
  })

  it('유효하지 않은 ?p= 값은 무시하고 카드를 보여준다', async () => {
    const router = makeRouter()
    await router.push('/demo?p=nobody')
    await router.isReady()

    const wrapper = mount(PersonaPickerPage, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('이서연')
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
