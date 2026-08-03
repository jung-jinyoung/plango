import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTaskStore } from '../features/task/stores/taskStore'
import ReflectDayPage from './ReflectDayPage.vue'

describe('ReflectDayPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('오늘(2026-07-29) 시드로 자동 포착 값·계획 대비 실제 요약을 재현한다', () => {
    const wrapper = mount(ReflectDayPage)

    // 끝낸 일 — today-16(논문 결과표 초안, 105분), today-17(팀 회의, 51분)
    expect(wrapper.text()).toContain('논문 결과표 초안')
    expect(wrapper.text()).toContain('105분')
    expect(wrapper.text()).toContain('팀 회의')
    expect(wrapper.text()).toContain('51분')

    // 계획 대비 실제: 계획 420분(7h) 중 실제 156분(2h 36m)
    expect(wrapper.text()).toContain('2h 36m 썼어요')
    expect(wrapper.text()).toContain('7h')

    // 아직 안 한 일 4개
    expect(wrapper.text()).toContain('그래프 3개 다듬기')
    expect(wrapper.text()).toContain('논문 서론 초안')
    expect(wrapper.text()).toContain('헬스장 운동')
    expect(wrapper.text()).toContain('저녁 약속')
  })

  it('duration 스테퍼는 15분 단위로 스냅되고, 바뀐 값이 바로 store와 요약에 반영된다', async () => {
    const wrapper = mount(ReflectDayPage)
    const taskStore = useTaskStore()

    // today-16(105분) 행의 "늘리기" 버튼 — 15분 단위 스텝이라 105 → 120
    const increaseButtons = wrapper.findAll('[aria-label="늘리기"]')
    await increaseButtons[0]!.trigger('click')

    const after = taskStore.tasksById.get('today-16')
    expect(after?.actualBlock).toEqual({
      start: '2026-07-29T09:00:00+09:00',
      end: '2026-07-29T11:00:00+09:00', // 09:00 + 120분
    })

    // 요약도 즉시 반영: 실제 총합 156 → 171분 = 2h 51m
    expect(wrapper.text()).toContain('2h 51m 썼어요')
  })

  it('"내일로"를 누르면 해당 할 일이 carried로 바뀌고 미완료 목록에서 사라진다', async () => {
    const wrapper = mount(ReflectDayPage)
    const taskStore = useTaskStore()

    expect(taskStore.tasksById.get('today-18')?.status).toBe('todo')

    const carryButtons = wrapper.findAll('button').filter((b) => b.text() === '내일로')
    await carryButtons[0]!.trigger('click')

    expect(taskStore.tasksById.get('today-18')?.status).toBe('carried')
    // plannedBlock은 그대로다(R4: 이월은 새 항목 생성이지 이동이 아니다 — 이번
    // 슬라이스는 새 항목을 만들지 않고 상태만 바꾼다)
    expect(taskStore.tasksById.get('today-18')?.plannedBlock).toEqual({
      start: '2026-07-29T13:00:00+09:00',
      end: '2026-07-29T14:00:00+09:00',
    })
    expect(wrapper.text()).not.toContain('그래프 3개 다듬기')
  })

  it('"이번 주 내로"는 아직 미구현이라 비활성 상태이고, 눌러도 아무 것도 바뀌지 않는다', async () => {
    const wrapper = mount(ReflectDayPage)
    const taskStore = useTaskStore()
    const before = taskStore.tasksById.get('today-18')?.status

    const thisWeekButton = wrapper.findAll('button').find((b) => b.text() === '이번 주 내로')!
    expect(thisWeekButton.attributes('disabled')).toBeDefined()

    await thisWeekButton.trigger('click')
    expect(taskStore.tasksById.get('today-18')?.status).toBe(before)
    expect(taskStore.tasksById.get('today-18')?.status).toBe('todo')

    // 미구현이라는 사실이 화면에도 드러난다
    expect(wrapper.text()).toContain('다음 슬라이스에서 지원해요')
  })

  it('미완료 할 일을 모두 처리하면 빈 상태 문구를 보여준다', async () => {
    const wrapper = mount(ReflectDayPage)

    const carryButtons = () => wrapper.findAll('button').filter((b) => b.text() === '내일로')
    while (carryButtons().length > 0) {
      await carryButtons()[0]!.trigger('click')
    }

    expect(wrapper.text()).toContain('오늘 남은 할 일이 없어요')
  })
})
