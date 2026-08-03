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

// 시드 데이터가 설계된 "오늘" 날짜로 고정 — 다른 페이지들과 같은 이유
// (scripts/generate-seed.mjs가 이 날짜를 중심으로 시드를 만든다).
const TODAY = '2026-07-29'

// 진입 라우팅(CLAUDE.md 12절) — 루트('/')로 들어올 때만 resolveEntry로 "기본
// 도착지"를 정해서 보낸다. 그 외 모든 네비게이션(사용자가 today에서
// reflect-week를 클릭하는 등 이미 특정 라우트를 명시한 이동)은 절대 가로채지
// 않는다 — "강제 이동이 아니다"(CLAUDE.md 12절).
router.beforeEach((to) => {
  if (to.path !== '/') return true

  const goalStore = useGoalStore()
  const taskStore = useTaskStore()
  const reflectionStore = useReflectionStore()

  const target = resolveEntry({
    monthlyGoals: goalStore.monthlyGoals,
    weeklyGoals: goalStore.weeklyGoals,
    tasks: taskStore.tasks,
    currentMonday: startOfWeek(TODAY),
    today: TODAY,
    nowIso: nowIso(),
    isTodayReflected: reflectionStore.isDayReflected(TODAY),
  })

  return { name: target }
})

export default router
