import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTaskStore } from '../features/task/stores/taskStore'
import TodayPage from './TodayPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/today', name: 'today', component: TodayPage },
    { path: '/reflect/week', name: 'reflect-week', component: { template: '<div />' } },
  ],
})

describe('TodayPage — 오늘 확정', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/today')
    await router.isReady()
  })

  it('오늘 시드 task가 아직 미확정이면 버튼이 활성 상태다', () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    // 시드(2026-07-29)는 오늘 task 전부 confirmed: false로 만들어져 있다
    expect(taskStore.tasksById.get('today-18')?.confirmed).toBe(false)

    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '오늘 확정')!
    expect(confirmButton.attributes('disabled')).toBeUndefined()
  })

  it('"오늘 확정"을 누르면 오늘 task 전체가 confirmed: true가 되고 버튼이 비활성화된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
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

describe('TodayPage — 이월 배너 / 복귀 리셋', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/today')
    await router.isReady()
  })

  it('평소(활동 공백 없음)엔 3일 이내 carried task 개수로 이월 배너를 보여준다', () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })

    // 시드: carried-24/25가 어제(2026-07-28) 항목 — 3일 미만이라 그대로 보인다
    expect(wrapper.text()).toContain('어제 못 한 일 2개')
    expect(wrapper.text()).not.toContain('지난 5일 기록이 비어 있어요')
  })

  it('마지막 활동이 3일 이상 전이면 이월 배너 대신 복귀 배너를 보여준다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    // 최근(2026-07-25보다 이후) plannedBlock을 가진 task를 전부 4일 전으로
    // 옮겨서 활동 공백을 시뮬레이션한다 — 오늘 6개뿐 아니라 어제 carried
    // 2개(carried-24/25, 07-28)도 "최근 활동"으로 잡히므로 같이 옮겨야 한다.
    for (const task of [...taskStore.tasks]) {
      if (task.plannedBlock && task.plannedBlock.start.slice(0, 10) > '2026-07-25') {
        taskStore.updateTask(task.id, {
          plannedBlock: { start: '2026-07-25T09:00:00+09:00', end: '2026-07-25T10:00:00+09:00' },
        })
      }
    }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('지난 5일 기록이 비어 있어요')
    expect(wrapper.text()).not.toContain('어제 못 한 일')
  })

  it('복귀 배너의 "이번 주 목표 다시 잡기"를 누르면 reflect-week로 이동한다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    for (const task of [...taskStore.tasks]) {
      if (task.plannedBlock && task.plannedBlock.start.slice(0, 10) > '2026-07-25') {
        taskStore.updateTask(task.id, {
          plannedBlock: { start: '2026-07-25T09:00:00+09:00', end: '2026-07-25T10:00:00+09:00' },
        })
      }
    }
    await wrapper.vm.$nextTick()

    const acceptButton = wrapper.findAll('button').find((b) => b.text() === '이번 주 목표 다시 잡기')!
    await acceptButton.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('reflect-week')
  })
})
