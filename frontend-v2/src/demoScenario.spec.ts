import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { useGoalStore } from './features/goal/stores/goalStore'
import { useTaskStore } from './features/task/stores/taskStore'
import MobileRunPage from './pages/MobileRunPage.vue'
import OnboardingPage from './pages/OnboardingPage.vue'
import ReflectDayPage from './pages/ReflectDayPage.vue'
import ReflectWeekPage from './pages/ReflectWeekPage.vue'
import TodayPage from './pages/TodayPage.vue'
import router from './router'

// product-spec.md 13절 데모 시나리오를 처음부터 끝까지 순서대로 밟는다.
// Playwright가 이 세션에 연결돼 있지 않아(claude-in-chrome 미연결, Chrome
// 읽기 전용 권한) 대신 실제 pages/*.vue + 실제 store + 실제 router를 하나의
// Pinia 인스턴스로 이어서 마운트하는 통합 테스트로 재현한다 — 단계 사이에
// setActivePinia를 다시 안 부르므로, 한 단계에서 만든 데이터가 다음 단계에
// 정말로 넘어가는지까지 검증된다(수동으로 브라우저에서 페이지를 옮겨 다니는
// 것과 같은 데이터 흐름).

describe('product-spec.md 13절 데모 시나리오 — 처음부터 끝까지', () => {
  let newMonthlyGoalTitle = ''

  beforeAll(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    // KST 13:09 — today-18(그래프 3개 다듬기, 13:00~14:00)이 "지금 하는 일"이
    // 되는 시각. UTC 04:09 = KST 13:09(nowIso()가 UTC+9h를 UTC getter로 읽음).
    vi.setSystemTime(new Date('2026-07-29T04:09:00.000Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('1. 온보딩 — 목표 1개 입력 → 4주 역산 확인 → 확정 → 오늘 할 일 확정', async () => {
    const wrapper = mount(OnboardingPage, { global: { plugins: [router] } })
    const goalStore = useGoalStore()
    const taskStore = useTaskStore()

    const monthlyBefore = goalStore.monthlyGoals.length
    const weeklyBefore = goalStore.weeklyGoals.length
    const tasksBefore = taskStore.tasks.length

    // ① 목표 입력
    await wrapper.find('input[type="text"]').setValue('데모 시나리오 목표')
    await wrapper.find('.cat-pick').trigger('click')
    const nextButton = wrapper.findAll('button').find((b) => b.text() === '다음')!
    await nextButton.trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick() // decomposeMonthlyGoal의 await 이후 렌더까지

    // ② 4주 역산 확인
    expect(wrapper.text()).toContain('네 주로 나눠봤어요')
    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore) // 아직 스토어 불변(R6)

    const confirmButton = wrapper.findAll('button').find((b) => b.text() === '이대로 시작하기')!
    await confirmButton.trigger('click')
    await wrapper.vm.$nextTick()

    expect(goalStore.monthlyGoals.length).toBe(monthlyBefore + 1)
    expect(goalStore.weeklyGoals.length).toBe(weeklyBefore + 4)
    newMonthlyGoalTitle = '데모 시나리오 목표'

    // ③ 오늘 할 일 확정 — 새 주간 목표(1주차)에 연결
    await wrapper.find('input[type="text"]').setValue('데모 할 일 90m #1주차')
    await wrapper.vm.$nextTick()
    const addButton = wrapper.findAll('button').find((b) => b.text() === '할 일 추가')!
    await addButton.trigger('click')
    const confirmTasksButton = wrapper.findAll('button').find((b) => b.text() === '오늘 할 일로 확정')!
    await confirmTasksButton.trigger('click')

    expect(taskStore.tasks.length).toBe(tasksBefore + 1)
    const newTask = taskStore.tasks.find((t) => t.title === '데모 할 일')
    expect(newTask).toBeDefined()
    expect(newTask?.plannedBlock).toBeNull() // 시간 미배정 — 오늘 뷰 인박스로
    expect(newTask?.weeklyGoalId).toContain(`-w1`)
  })

  it('2. 오늘 뷰 — 온보딩 task가 인박스에 이어지고, 계획·실제 병기 + 드래그 조정이 된다', async () => {
    const wrapper = mount(TodayPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    // 데이터 이어짐: 1단계에서 만든 task가 인박스에 그대로 보인다
    expect(wrapper.text()).toContain('데모 할 일')

    // 계획·실제 병기: today-16(논문 결과표 초안)은 계획 60분/실제 105분,
    // 차이 15분 이상이라 ghost(계획, 점선)+real(실제) pair로 렌더된다.
    expect(wrapper.find('.ghost').exists()).toBe(true)
    expect(wrapper.find('.real').exists()).toBe(true)

    // 드래그 조정: today-19(논문 서론 초안, 15:00~16:30, 아직 미확정)를
    // 30분 앞으로 옮긴다(14:30~16:00) — now(13:09)보다 미래 위치라
    // plannedBlock이 바뀌어야 한다. 뒤로 옮기면 today-20(헬스장 운동,
    // 17:00~18:00)과 겹쳐 hasScheduleConflict에 취소되므로 겹치지 않는
    // 방향으로 옮긴다.
    expect(taskStore.tasksById.get('today-19')?.plannedBlock).toEqual({
      start: '2026-07-29T15:00:00+09:00',
      end: '2026-07-29T16:30:00+09:00',
    })

    const target = wrapper.findAll('.block').find((b) => b.text().includes('논문 서론 초안'))!
    await target.trigger('pointerdown', { clientY: 0, pointerId: 501 })
    await target.trigger('pointermove', { clientY: -32, pointerId: 501 }) // 30분 = 0.5h * 64px/h
    await target.trigger('pointerup', { clientY: -32, pointerId: 501 })

    expect(taskStore.tasksById.get('today-19')?.plannedBlock).toEqual({
      start: '2026-07-29T14:30:00+09:00',
      end: '2026-07-29T16:00:00+09:00',
    })
  })

  it('3. 모바일 실행 뷰 — 지금 하는 일 체크(완료)', async () => {
    const wrapper = mount(MobileRunPage, { global: { plugins: [router] } })
    const taskStore = useTaskStore()

    // now=13:09에 걸리는 today-18(그래프 3개 다듬기, 13:00~14:00)이 "지금 하는 일"
    expect(wrapper.text()).toContain('그래프 3개 다듬기')
    expect(taskStore.tasksById.get('today-18')?.status).toBe('todo')

    const doneButton = wrapper.findAll('button').find((b) => b.text() === '다 했어요')!
    await doneButton.trigger('click')

    const after = taskStore.tasksById.get('today-18')
    expect(after?.status).toBe('done')
    expect(after?.actualBlock).toEqual({
      start: '2026-07-29T13:00:00+09:00',
      end: '2026-07-29T13:09:00+09:00',
    })
  })

  it('4. 오늘의 기록 — 방금 완료한 일이 자동 포착 값에 이어지고, 계획 대비 실제가 갱신된다', async () => {
    const wrapper = mount(ReflectDayPage, { global: { plugins: [router] } })

    // 데이터 이어짐: 3단계에서 완료한 today-18이 "끝낸 일" 목록에 보인다
    expect(wrapper.text()).toContain('그래프 3개 다듬기')
    expect(wrapper.text()).toContain('9분') // actualMin = 13:00~13:09

    // 계획 대비 실제: 기존 105+51분(today-16/17) + 새로 9분(today-18) = 165분 = 2h 45m
    // 계획 총합은 그대로 420분(7h) — 2단계 드래그는 시간만 옮겼지 길이는 안 바꿨다.
    expect(wrapper.text()).toContain('2h 45m 썼어요')
    expect(wrapper.text()).toContain('계획한 시간 7h')

    // 미완료 목록에서도 today-18이 빠지고 나머지 3개(논문 서론 초안·헬스장·저녁
    // 약속)만 남는다 — "내일로" 버튼 개수로 직접 센다(완료된 today-18은 빠져야 함).
    expect(wrapper.findAll('button').filter((b) => b.text() === '내일로')).toHaveLength(3)
    expect(wrapper.text()).toContain('헬스장 운동')

    const closeButton = wrapper.findAll('button').find((b) => b.text() === '오늘 마감하기')!
    await closeButton.trigger('click')
    expect(wrapper.text()).toContain('오늘 마감했어요')
  })

  it('5. 진입 라우팅 — 시각을 다음 주 월요일로 이동하면 reflect-week로 보낸다', async () => {
    // 주의: 다음 주(2026-08-03)는 건너뛴다 — 1단계 온보딩이 "데모 시나리오
    // 목표"의 4주치를 한 번에 만들면서 2026-08-03(2주차)에도 이미 weeklyGoal이
    // 생겼다(CLAUDE.md 11절 "월간 목표 등록 시 주간 목표 4개" JIT 원칙 — 버그
    // 아님, 온보딩 직후 4주는 원래 회고 유도가 안 걸리는 게 의도된 동작이다).
    // "새 주 진입 시 회고 유도"가 실제로 필요해지는 정상 사례를 보려면 그
    // 4주(2026-07-27~08-17)를 지난 다음 주(2026-08-24)로 가야 한다.
    vi.setSystemTime(new Date('2026-08-23T15:00:00.000Z')) // KST 2026-08-24T00:00 → 날짜만 08-24

    await router.push('/')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('reflect-week')
  })

  it('6. 주간 회고 — 재추정 → 다음 주 제안 → 월간 경고', async () => {
    const wrapper = mount(ReflectWeekPage, { global: { plugins: [router] } })
    const goalStore = useGoalStore()

    // 재추정: 이월 중인 목표(wg-carrying)의 "다시 잡기"
    const reestimateButton = wrapper.findAll('button').find((b) => b.text() === '다시 잡기')
    expect(reestimateButton).toBeDefined()
    await reestimateButton!.trigger('click')
    expect(wrapper.text()).toContain('다시 잡았어요')

    // 다음 주 제안 확정
    const suggestConfirmButton = wrapper
      .findAll('button')
      .find((b) => b.text() === '다음 주 목표로 확정하기')
    expect(suggestConfirmButton).toBeDefined()
    await suggestConfirmButton!.trigger('click')
    expect(wrapper.text()).toContain('다음 주 목표로 확정했어요')

    // 월간 경고 — mg-thesis는 baseline 초과 상태로 시드돼 있어 배너가 뜬다.
    // 1단계에서 새로 만든 월간 목표는 아직 진행 실적이 없어 경고 대상이 아니다.
    expect(wrapper.text()).toContain('예상보다 많이 썼어요')
    expect(wrapper.text()).not.toContain(newMonthlyGoalTitle)

    // 1단계에서 만든 새 월간 목표도 여전히 스토어에 살아있다(전체 시나리오 동안 데이터 유지 확인)
    expect(goalStore.monthlyGoals.some((g) => g.title === newMonthlyGoalTitle)).toBe(true)
  })
})
