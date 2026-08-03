import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTaskStore } from '../features/task/stores/taskStore'
import TodayPage from './TodayPage.vue'

describe('TodayPage — 오늘 확정', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('오늘 시드 task가 아직 미확정이면 버튼이 활성 상태다', () => {
    const wrapper = mount(TodayPage)
    const taskStore = useTaskStore()

    // 시드(2026-07-29)는 오늘 task 전부 confirmed: false로 만들어져 있다
    expect(taskStore.tasksById.get('today-18')?.confirmed).toBe(false)

    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '오늘 확정')!
    expect(confirmButton.attributes('disabled')).toBeUndefined()
  })

  it('"오늘 확정"을 누르면 오늘 task 전체가 confirmed: true가 되고 버튼이 비활성화된다', async () => {
    const wrapper = mount(TodayPage)
    const taskStore = useTaskStore()

    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '오늘 확정')!
    await confirmButton.trigger('click')

    for (const id of ['today-16', 'today-17', 'today-18', 'today-19', 'today-20', 'today-21']) {
      expect(taskStore.tasksById.get(id)?.confirmed).toBe(true)
    }

    const after = wrapper.findAll('button').find((b) => b.text() === '오늘 확정했어요')!
    expect(after.attributes('disabled')).toBeDefined()
  })
})
