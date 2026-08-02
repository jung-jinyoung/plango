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
