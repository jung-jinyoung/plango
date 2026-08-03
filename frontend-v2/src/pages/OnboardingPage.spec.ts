import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { useTaskStore } from '../features/task/stores/taskStore'
import OnboardingPage from './OnboardingPage.vue'

// R6(제안 → 사용자 수락 → 변경): ①목표 입력, ②역산 결과 확인·조정, ③오늘 할 일
// 입력·큐잉 단계에서는 스토어가 전혀 바뀌지 않는다 — 각 단계의 확정 버튼을
// 눌러야만 goalStore.addMonthlyGoal + addWeeklyGoal(4개) / taskStore.addTask가
// 호출된다.

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

    // "이대로 시작하기" 확정 — 여기서 월간+주간 목표(4개)가 생기고 ③단계로 넘어간다
    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '이대로 시작하기')!
    await confirmButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore + 1)
    expect(goalStore.weeklyGoals.length).toBe(weeklyBefore + 4)
    expect(wrapper.text()).toContain('오늘 뭐부터 해볼까요?')

    const newMonthly = goalStore.monthlyGoals.find(
      (g) => g.title === '신규 목표 온보딩 테스트' && g.status === 'active',
    )
    expect(newMonthly).toBeDefined()
    const linkedWeekly = goalStore.weeklyGoals.filter((g) => g.monthlyGoalId === newMonthly!.id)
    expect(linkedWeekly).toHaveLength(4)
    const week1 = linkedWeekly.find((g) => g.id === `${newMonthly!.id}-w1`)!
    expect(wrapper.text()).toContain(week1.title)

    // ③ 오늘 할 일 — 입력·큐잉하는 동안엔 taskStore가 그대로다
    const taskStore = useTaskStore()
    const tasksBefore = taskStore.tasks.length

    await wrapper.find('input[type="text"]').setValue('온보딩 테스트 오늘 할 일 90m #1주차')
    await wrapper.vm.$nextTick()
    expect(taskStore.tasks.length).toBe(tasksBefore)

    const addButton = wrapper.findAll('button').find((b) => b.text() === '할 일 추가')!
    expect(addButton.attributes('disabled')).toBeUndefined()
    await addButton.trigger('click')
    expect(taskStore.tasks.length).toBe(tasksBefore) // 큐에만 들어가고 스토어는 아직 그대로

    // "오늘 할 일로 확정"을 눌러야만 실제로 taskStore.addTask가 호출된다
    const confirmTasksButton = wrapper.findAll('button').find((b) => b.text() === '오늘 할 일로 확정')!
    await confirmTasksButton.trigger('click')

    expect(taskStore.tasks.length).toBe(tasksBefore + 1)
    const newTask = taskStore.tasks.find((t) => t.title === '온보딩 테스트 오늘 할 일')
    expect(newTask).toBeDefined()
    // 파서가 반환한 weeklyGoalId가 방금 역산된 1주차 목표를 정확히 가리키는지 확인 —
    // candidateGoals를 "이번 주 목표 전체"가 아니라 week1 하나로 좁혔기 때문에
    // 다른 목표와 헷갈릴 여지가 없다.
    expect(newTask?.weeklyGoalId).toBe(week1.id)
    expect(newTask?.plannedBlock).toBeNull() // 시간 미배정 — 인박스로 들어간다
    expect(wrapper.text()).toContain('오늘 할 일을 확정했어요')
  })

  it('카테고리를 안 고르면 "다음" 버튼이 비활성 상태다', async () => {
    const wrapper = mount(OnboardingPage, { global: { plugins: [router] } })
    await wrapper.find('input[type="text"]').setValue('신규 목표 온보딩 테스트')
    const nextButton = wrapper.findAll('button').find((b) => b.text() === '다음')!
    expect(nextButton.attributes('disabled')).toBeDefined()
  })
})
