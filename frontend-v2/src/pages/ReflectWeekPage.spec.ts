import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGoalStore } from '../features/goal/stores/goalStore'
import ReflectWeekPage from './ReflectWeekPage.vue'

// R6(제안 → 사용자 수락 → 변경): 재추정 힌트는 스토어를 건드리지 않고,
// "다시 잡기" 확정 버튼을 눌러야만 goalStore.updateWeeklyGoal이 호출된다.
// CLAUDE.md 6-2절 재추정 스테퍼의 핵심 순서 보장 — 순서가 깨지면 힌트를
// 보여주는 시점에 이미 계획이 조용히 바뀌어버리는 사고가 난다.

describe('ReflectWeekPage — 재추정 확정 순서', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('힌트가 보이는 동안은 스토어가 그대로고, 확정 버튼을 눌러야만 estimatedHours가 바뀐다', async () => {
    const wrapper = mount(ReflectWeekPage)
    const goalStore = useGoalStore()

    const before = goalStore.weeklyGoalsById.get('wg-carrying')?.estimatedHours
    expect(before).toBeDefined()

    // 힌트 문구가 실제로 렌더된 상태 — 이 시점엔 스토어가 절대 바뀌어 있으면 안 된다.
    expect(wrapper.text()).toContain('배 길었어요')
    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.estimatedHours).toBe(before)

    // 스테퍼로 값을 조정해도(로컬 draft만 바뀜) 스토어는 그대로다.
    await wrapper.find('[aria-label="늘리기"]').trigger('click')
    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.estimatedHours).toBe(before)

    // "다시 잡기" 확정 버튼을 눌러야만 반영된다.
    const confirmButton = wrapper.findAll('button').find((btn) => btn.text() === '다시 잡기')
    expect(confirmButton).toBeDefined()
    await confirmButton!.trigger('click')

    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.estimatedHours).toBe(before! + 1)
    expect(wrapper.text()).toContain('다시 잡았어요')
  })
})

// R6: 다음 주 제안 목록도 같은 순서를 지킨다 — 후보를 보여주고 ✕로 빼는 동안엔
// 스토어가 그대로고, "확정하기" 버튼을 눌러야만 실제 WeeklyGoal이 생성된다.
describe('ReflectWeekPage — 다음 주 목표 제안 확정 순서', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('제안 목록이 보이는 동안은 스토어가 그대로고, 확정 버튼을 눌러야만 새 WeeklyGoal이 생긴다', async () => {
    const wrapper = mount(ReflectWeekPage)
    const goalStore = useGoalStore()

    const beforeCount = goalStore.weeklyGoals.length
    const carryingBefore = goalStore.weeklyGoalsById.get('wg-carrying')

    // 후보 목록이 실제로 렌더된 상태 — 이 시점엔 스토어가 절대 바뀌어 있으면 안 된다.
    expect(wrapper.text()).toContain('지난주에서 이어져요')
    expect(wrapper.text()).toContain('지난주에 잘 지켰어요')
    expect(goalStore.weeklyGoals.length).toBe(beforeCount)
    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.status).toBe(carryingBefore?.status)

    // ✕로 첫 번째 후보(이월 이어짐)를 뺀다 — 로컬 상태만 바뀌고 스토어는 그대로.
    const removeButtons = wrapper.findAll('[aria-label="빼기"]')
    expect(removeButtons.length).toBe(3) // 이월 + 습관 + 월간 다음 항목
    await removeButtons[0]!.trigger('click')
    expect(goalStore.weeklyGoals.length).toBe(beforeCount)

    // "다음 주 목표로 확정하기" 버튼을 눌러야만 실제로 생성된다.
    const confirmButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === '다음 주 목표로 확정하기')
    expect(confirmButton).toBeDefined()
    await confirmButton!.trigger('click')

    // 이월 후보를 빼고 확정했으니 습관+월간 2개만 새로 생기고, wg-carrying은
    // carried로 얼려지지 않는다(그 후보는 accepted 목록에서 빠졌으니까).
    expect(goalStore.weeklyGoals.length).toBe(beforeCount + 2)
    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.status).toBe(carryingBefore?.status)
    expect(wrapper.text()).toContain('다음 주 목표로 확정했어요')
  })

  it('이월 후보를 뺴지 않고 그대로 확정하면 wg-carrying이 carried로 얼려지고 후속 레코드가 생긴다', async () => {
    // 회귀 테스트 — 이 경로에서 carrying(computed)이 updateWeeklyGoal 직후
    // 재계산되며 null이 되는 버그가 실제로 있었다(에러가 나서 확정 버튼
    // 상태가 안 바뀌었었다). 이월 후보를 빼지 않은 채로 확정해야 그 코드
    // 경로를 실제로 통과한다.
    const wrapper = mount(ReflectWeekPage)
    const goalStore = useGoalStore()
    const carryingBefore = goalStore.weeklyGoalsById.get('wg-carrying')!

    const confirmButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === '다음 주 목표로 확정하기')
    expect(confirmButton).toBeDefined()
    await confirmButton!.trigger('click')

    expect(goalStore.weeklyGoalsById.get('wg-carrying')?.status).toBe('carried')
    const next = goalStore.weeklyGoalsById.get(`${carryingBefore.id}-next`)
    expect(next).toBeDefined()
    expect(next?.status).toBe('active')
    expect(next?.carryCount).toBe(carryingBefore.carryCount + 1)
    expect(next?.title).toBe(carryingBefore.title)
    expect(wrapper.text()).toContain('다음 주 목표로 확정했어요')
  })
})
