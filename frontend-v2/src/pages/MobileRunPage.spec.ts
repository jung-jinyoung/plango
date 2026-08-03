import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTaskStore } from '../features/task/stores/taskStore'
import MobileRunPage from './MobileRunPage.vue'

// "지금 하는 일" 카드의 "다 했어요"/"미루기"는 R6이 적용되는 AI 제안이 아니라
// 사용자가 직접 누르는 확정 액션이다 — 클릭 전까지 스토어가 그대로인지,
// 클릭해야만 taskStore.updateTask가 호출되는지를 확인한다.

describe('MobileRunPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 시드의 "오늘"(2026-07-29) 13:09 KST — today-18(그래프 3개 다듬기, 13:00~14:00)이
    // "지금 하는 일"이 되는 시각. nowIso()는 UTC+9h를 UTC getter로 읽으므로
    // UTC 04:09가 KST 13:09로 계산된다(time.spec.ts의 nowIso 테스트와 동일한 계산 방식).
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-29T04:09:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('지금 하는 일 카드가 plannedBlock이 현재 시각을 걸치는 할 일을 보여준다', () => {
    const wrapper = mount(MobileRunPage)

    expect(wrapper.text()).toContain('그래프 3개 다듬기')
    expect(wrapper.text()).toContain('결과 파트 작성') // 연결된 주간 목표 제목
    expect(wrapper.text()).toContain('13:00부터 하고 있어요')
    expect(wrapper.text()).toContain('0h 9m') // 경과 = 13:00~13:09
  })

  it('"다 했어요"를 누르기 전엔 스토어가 그대로고, 눌러야만 완료 처리된다', async () => {
    const wrapper = mount(MobileRunPage)
    const taskStore = useTaskStore()
    const before = taskStore.tasksById.get('today-18')

    expect(before?.status).toBe('todo')
    expect(before?.actualBlock).toBeNull()

    const doneButton = wrapper.findAll('button').find((b) => b.text() === '다 했어요')!
    await doneButton.trigger('click')

    const after = taskStore.tasksById.get('today-18')
    expect(after?.status).toBe('done')
    // 자동 포착(CLAUDE.md 5-4절, captureActualStart): 오늘 이미 끝난 today-16/17의
    // actualBlock.end(10:45, 11:51)가 today-18의 plannedBlock.start(13:00)보다
    // 이르므로 직전 완료를 반영할 게 없다 — plannedBlock.start 그대로, 끝은 완료
    // 시점(현재 시각)
    expect(after?.actualBlock).toEqual({
      start: '2026-07-29T13:00:00+09:00',
      end: '2026-07-29T13:09:00+09:00',
    })
  })

  it('직전 작업이 밀려서 늦게 끝났으면, 다음 작업의 자동 포착 시작 시각도 그 시각을 따라간다', async () => {
    const wrapper = mount(MobileRunPage)
    const taskStore = useTaskStore()

    // today-16(논문 결과표 초안)이 실제로는 13:05까지 밀려서 끝난 상황을 시뮬레이션
    taskStore.updateTask('today-16', {
      actualBlock: { start: '2026-07-29T09:00:00+09:00', end: '2026-07-29T13:05:00+09:00' },
    })

    const doneButton = wrapper.findAll('button').find((b) => b.text() === '다 했어요')!
    await doneButton.trigger('click')

    const after = taskStore.tasksById.get('today-18')
    // plannedBlock.start(13:00)가 아니라 직전 완료 시각(13:05)을 시작으로 쓴다
    expect(after?.actualBlock).toEqual({
      start: '2026-07-29T13:05:00+09:00',
      end: '2026-07-29T13:09:00+09:00',
    })
  })

  it('"미루기"를 누르면 status만 carried로 바뀌고 plannedBlock은 그대로다(드래그 없음)', async () => {
    const wrapper = mount(MobileRunPage)
    const taskStore = useTaskStore()
    const originalPlannedBlock = taskStore.tasksById.get('today-18')?.plannedBlock

    // 오늘(2026-07-29) 시드엔 처음부터 carried인 할 일이 없다(carried-24/25는 어제
    // 07-28 항목) — "다음으로 옮긴 일" 섹션은 초기 렌더에선 비어 있어야 한다.
    expect(wrapper.text()).not.toContain('다음으로 옮긴 일')

    const postponeButton = wrapper.findAll('button').find((b) => b.text() === '미루기')!
    await postponeButton.trigger('click')

    const after = taskStore.tasksById.get('today-18')
    expect(after?.status).toBe('carried')
    expect(after?.plannedBlock).toEqual(originalPlannedBlock)
    expect(after?.actualBlock).toBeNull()

    // 미루기를 누른 뒤에야 "다음으로 옮긴 일" 섹션이 실제 항목으로 채워진다.
    expect(wrapper.text()).toContain('다음으로 옮긴 일')
    expect(wrapper.text()).toContain('그래프 3개 다듬기')
  })

  it('이따 할 일·끝낸 일 목록을 시간순으로 보여준다', () => {
    const wrapper = mount(MobileRunPage)

    expect(wrapper.text()).toContain('논문 서론 초안')
    expect(wrapper.text()).toContain('헬스장 운동')
    expect(wrapper.text()).toContain('저녁 약속')
    expect(wrapper.text()).toContain('논문 결과표 초안')
    expect(wrapper.text()).toContain('팀 회의')
    expect(wrapper.text()).toContain('6개 중 2개 했어요')
  })
})
