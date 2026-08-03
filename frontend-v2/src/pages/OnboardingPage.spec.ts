import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGoalStore } from '../features/goal/stores/goalStore'
import OnboardingPage from './OnboardingPage.vue'

// R6(제안 → 사용자 수락 → 변경): ①목표 입력, ②역산 결과 확인·조정 단계에서는
// 스토어가 전혀 바뀌지 않는다 — "이대로 시작하기"를 눌러야만
// goalStore.addMonthlyGoal + addWeeklyGoal(4개)가 호출된다.

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/today', name: 'today', component: { template: '<div />' } },
    { path: '/onboarding', name: 'onboarding', component: OnboardingPage },
  ],
})

describe('OnboardingPage — 목표 입력 → 역산 확인 → 확정 순서', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await router.push('/onboarding')
    await router.isReady()
  })

  it('①②단계에서는 스토어가 그대로고, "이대로 시작하기"를 눌러야만 월간+주간 목표가 생긴다', async () => {
    const wrapper = mount(OnboardingPage, { global: { plugins: [router] } })
    const goalStore = useGoalStore()

    const monthlyBefore = goalStore.monthlyGoals.length
    const weeklyBefore = goalStore.weeklyGoals.length

    // ① 목표 입력
    await wrapper.find('input[type="text"]').setValue('신규 목표 온보딩 테스트')
    await wrapper.find('.cat-pick').trigger('click') // 첫 번째 카테고리 선택
    const nextButton = wrapper.findAll('button').find((b) => b.text() === '다음')!
    expect(nextButton.attributes('disabled')).toBeUndefined()
    await nextButton.trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // decomposeMonthlyGoal의 await 이후 렌더까지 기다림

    // ② 역산 확인 — 아직 스토어 불변
    expect(wrapper.text()).toContain('네 주로 나눠봤어요')
    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore)
    expect(goalStore.weeklyGoals.length).toBe(weeklyBefore)

    // 스테퍼 조작도 로컬 상태만 바꾼다
    const increaseButtons = wrapper.findAll('[aria-label="늘리기"]')
    expect(increaseButtons.length).toBe(4) // 4주치
    await increaseButtons[0]!.trigger('click')
    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore)

    // "이대로 시작하기" 확정
    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '이대로 시작하기')!
    await confirmButton.trigger('click')

    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore + 1)
    expect(goalStore.weeklyGoals.length).toBe(weeklyBefore + 4)
    expect(wrapper.text()).toContain('이번 달 목표를 시작했어요')

    const newMonthly = goalStore.monthlyGoals.find(
      (g) => g.title === '신규 목표 온보딩 테스트' && g.status === 'active',
    )
    expect(newMonthly).toBeDefined()
    const linkedWeekly = goalStore.weeklyGoals.filter((g) => g.monthlyGoalId === newMonthly!.id)
    expect(linkedWeekly).toHaveLength(4)
  })

  it('카테고리를 안 고르면 "다음" 버튼이 비활성 상태다', async () => {
    const wrapper = mount(OnboardingPage, { global: { plugins: [router] } })
    await wrapper.find('input[type="text"]').setValue('신규 목표 온보딩 테스트')
    const nextButton = wrapper.findAll('button').find((b) => b.text() === '다음')!
    expect(nextButton.attributes('disabled')).toBeDefined()
  })
})
