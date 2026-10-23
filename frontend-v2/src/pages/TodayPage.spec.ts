import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useTaskStore } from '../features/task/stores/taskStore'
import TodayPage from './TodayPage.vue'
import { useNow } from '../shared/lib/time'

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

describe('TodayPage — 입력·배치·이월', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/today')
    await router.isReady()
  })

  it('입력창에서 Enter를 누르면 시간이 적힌 할 일이 인박스에 추가된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const input = wrapper.find('.task-input-preview input')

    await input.setValue('서론 다시 읽기 30m')
    await input.trigger('keydown', { key: 'Enter' })

    const added = useTaskStore().tasks.find((t) => t.title === '서론 다시 읽기')
    expect(added).toMatchObject({ estimatedMin: 30, plannedBlock: null, status: 'todo' })
    expect(wrapper.find('.col-inbox').text()).toContain('서론 다시 읽기')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('오른쪽 추가 버튼으로도 추가된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })

    await wrapper.find('.task-input-preview input').setValue('참고 논문 훑기 45m')
    await wrapper.find('.task-input-preview .submit').trigger('click')

    expect(useTaskStore().tasks.some((t) => t.title === '참고 논문 훑기')).toBe(true)
  })

  it('#을 치면 이번 주 목표 자동완성이 뜨고, 고르면 그 목표에 연결된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const input = wrapper.find('.task-input-preview input')

    await input.setValue('표 다듬기 30m #')
    const options = wrapper.findAll('.suggestion')
    // 시드의 이번 주(2026-07-27) active 목표 3개만 — 지난주 목표는 섞이지 않는다
    expect(options.map((o) => o.text())).toEqual([
      '# 실험 데이터 분석 마무리',
      '# 결과 파트 작성',
      '# 운동 습관 잡기',
    ])

    await options[1]!.trigger('mousedown')
    expect(wrapper.find('.chips').text()).toContain('# 결과 파트 작성')
    expect(wrapper.findAll('.suggestion')).toHaveLength(0)
  })

  it('4시간이 넘으면 나눠서 적도록 제안한다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    await wrapper.find('.task-input-preview input').setValue('논문 전체 퇴고 300m')
    expect(wrapper.text()).toContain('4시간이 넘어요')
  })

  it('시간이 없으면 추가하지 않고 시간을 적어달라고 안내한다(R7)', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const input = wrapper.find('.task-input-preview input')

    await input.setValue('서론 다시 읽기')
    await input.trigger('keydown', { key: 'Enter' })

    expect(useTaskStore().tasks.some((t) => t.title === '서론 다시 읽기')).toBe(false)
    expect(wrapper.text()).toContain('45m처럼 시간을 같이 적으면 추가할 수 있어요')
  })

  it('"오늘로 옮기기"는 원래 항목을 두고 오늘 인박스에 새 항목을 만들며, 다시 열어도 또 권하지 않는다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    await wrapper.findAll('button').find((b) => b.text() === '오늘로 옮기기')!.trigger('click')

    // 시드: carried-24/25(2026-07-28)
    for (const id of ['carried-24', 'carried-25']) {
      expect(taskStore.tasksById.get(id)?.status).toBe('carried') // R4: 원래 항목은 그대로
      expect(taskStore.tasksById.get(`${id}-carry-2026-07-29`)).toMatchObject({
        plannedBlock: null,
        status: 'todo',
      })
    }

    const reopened = mount(TodayPage, { global: { plugins: [router] } })
    expect(reopened.text()).not.toContain('어제 못 한 일')
  })

  it('"비어 있는 시간에 놓기"는 지금 이후의 빈틈에 인박스 항목을 겹치지 않게 넣는다', async () => {
    const now = useNow()
    const realNow = now.value
    now.value = '2026-07-29T13:30:00+09:00'
    try {
      const wrapper = mount(TodayPage, { global: { plugins: [router] } })
      const taskStore = useTaskStore()

      await wrapper.find('.place-btn').trigger('click')

      // 시드 인박스: 참고문헌 정리 40분, 택배 부치기 20분 — 13시대엔 그래프(13~14),
      // 15시부턴 서론(15~16:30)이 있어서 14:00과 16:30 틈으로 들어간다
      const byTitle = (title: string) => taskStore.tasks.find((t) => t.title === title)!
      expect(byTitle('참고문헌 정리').plannedBlock).toEqual({
        start: '2026-07-29T14:00:00+09:00',
        end: '2026-07-29T14:40:00+09:00',
      })
      expect(byTitle('택배 부치기').plannedBlock).toEqual({
        start: '2026-07-29T16:30:00+09:00',
        end: '2026-07-29T16:50:00+09:00',
      })
      expect(wrapper.text()).toContain('2개를 놓았어요')
    } finally {
      now.value = realNow
    }
  })
})

describe('TodayPage — 블록 클릭: 기록할까요?와 편집', () => {
  const now = useNow()
  let realNow = ''

  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/today')
    await router.isReady()
    realNow = now.value
    now.value = '2026-07-29T14:30:00+09:00' // 그래프(13~14시)는 지났고, 헬스장(17시)은 앞으로
  })
  afterEach(() => {
    now.value = realNow
    document.body.innerHTML = ''
  })

  async function clickBlock(wrapper: ReturnType<typeof mount>, title: string) {
    const block = wrapper.findAll('.tl-block').find((b) => b.text().includes(title))!
    await block.trigger('pointerdown', { pointerId: 1, clientY: 100 })
    await block.trigger('pointerup', { pointerId: 1, clientY: 100 })
    await flushPromises()
  }
  const dialogButton = (text: string) =>
    [...document.body.querySelectorAll<HTMLButtonElement>('.dialog button')].find(
      (b) => b.textContent?.trim() === text,
    )!

  it('계획이 지났는데 기록이 없는 블록은 "기록할까요?"로 표시한다', () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const block = wrapper.findAll('.tl-block').find((b) => b.text().includes('그래프 3개 다듬기'))!
    expect(block.text()).toContain('기록할까요?')
    expect(block.classes()).toContain('is-needs-check')
  })

  it('"계획대로 했어요"를 누르면 계획 시간 그대로 실제가 기록된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    await clickBlock(wrapper, '그래프 3개 다듬기')

    dialogButton('계획대로 했어요').click()
    await flushPromises()

    const task = useTaskStore().tasksById.get('today-18')!
    expect(task.status).toBe('done')
    expect(task.actualBlock).toEqual(task.plannedBlock)
  })

  it('"다음으로 옮길게요"를 누르면 옮김 상태로 낮춰서 보여준다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    await clickBlock(wrapper, '그래프 3개 다듬기')

    dialogButton('다음으로 옮길게요').click()
    await flushPromises()

    expect(useTaskStore().tasksById.get('today-18')!.status).toBe('carried')
    const block = wrapper.findAll('.tl-block').find((b) => b.text().includes('그래프 3개 다듬기'))!
    expect(block.text()).toContain('다음으로 옮김')
  })

  it('앞으로 할 블록은 내용을 편집한다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    await clickBlock(wrapper, '헬스장 운동')

    const input = document.body.querySelector<HTMLInputElement>('.dialog input')!
    input.value = '헬스장 하체 운동'
    input.dispatchEvent(new Event('input'))
    dialogButton('저장하기').click()
    await flushPromises()

    expect(useTaskStore().tasks.some((t) => t.title === '헬스장 하체 운동')).toBe(true)
  })
})
