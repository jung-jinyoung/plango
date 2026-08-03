import { createRouter, createWebHistory } from 'vue-router'
import DesignPreview from '../DesignPreview.vue'
import ComponentGallery from '../ComponentGallery.vue'
import TodayPage from '../pages/TodayPage.vue'
import ReflectWeekPage from '../pages/ReflectWeekPage.vue'
import OnboardingPage from '../pages/OnboardingPage.vue'
import MobileRunPage from '../pages/MobileRunPage.vue'
import ReflectDayPage from '../pages/ReflectDayPage.vue'
import { useGoalStore } from '../features/goal/stores/goalStore'
import { resolveEntry } from '../features/reflect/lib/resolveEntry'
import { useReflectionStore } from '../features/reflect/stores/reflectionStore'
import { useTaskStore } from '../features/task/stores/taskStore'
import { nowIso, startOfWeek } from '../shared/lib/time'

// /gallery는 ComponentGallery.vue와 함께 병합 후 삭제할 임시 라우트.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'design-preview', component: DesignPreview },
    { path: '/gallery', name: 'component-gallery', component: ComponentGallery },
    { path: '/today', name: 'today', component: TodayPage },
    { path: '/reflect/week', name: 'reflect-week', component: ReflectWeekPage },
    { path: '/onboarding', name: 'onboarding', component: OnboardingPage },
    { path: '/mobile-run', name: 'mobile-run', component: MobileRunPage },
    { path: '/reflect/day', name: 'reflect-day', component: ReflectDayPage },
  ],
})

// 진입 라우팅(CLAUDE.md 12절) — 루트('/')로 들어올 때만 resolveEntry로 "기본
// 도착지"를 정해서 보낸다. 그 외 모든 네비게이션(사용자가 today에서
// reflect-week를 클릭하는 등 이미 특정 라우트를 명시한 이동)은 절대 가로채지
// 않는다 — "강제 이동이 아니다"(CLAUDE.md 12절).
//
// today는 실제 현재 시각(nowIso())에서 뽑는다 — 다른 페이지들(TodayPage 등)은
// 시드 데이터의 고정 날짜를 그대로 쓰지만, 진입 라우팅만큼은 "새 주로
// 넘어갔는지", "3일 이상 공백인지"를 실제 시간 흐름으로 판정해야 의미가 있다.
// 고정 날짜를 그대로 썼다면 이 판정들이 영원히 트리거될 수 없었다(실제로
// 데모 시나리오 통합 테스트로 이 버그를 발견했다 — demoScenario.spec.ts).
router.beforeEach((to) => {
  if (to.path !== '/') return true

  const goalStore = useGoalStore()
  const taskStore = useTaskStore()
  const reflectionStore = useReflectionStore()

  const now = nowIso()
  const today = now.slice(0, 10)

  const target = resolveEntry({
    monthlyGoals: goalStore.monthlyGoals,
    weeklyGoals: goalStore.weeklyGoals,
    tasks: taskStore.tasks,
    currentMonday: startOfWeek(today),
    today,
    nowIso: now,
    isTodayReflected: reflectionStore.isDayReflected(today),
  })

  return { name: target }
})

export default router
