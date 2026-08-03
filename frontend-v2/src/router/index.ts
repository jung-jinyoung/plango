import { createRouter, createWebHistory } from 'vue-router'
import DesignPreview from '../DesignPreview.vue'
import ComponentGallery from '../ComponentGallery.vue'
import TodayPage from '../pages/TodayPage.vue'
import ReflectWeekPage from '../pages/ReflectWeekPage.vue'
import OnboardingPage from '../pages/OnboardingPage.vue'
import MobileRunPage from '../pages/MobileRunPage.vue'
import ReflectDayPage from '../pages/ReflectDayPage.vue'

// 임시 라우트 — 실제 진입 라우팅(초기 도착 페이지 결정)은 CLAUDE.md 14절
// 10단계에서 구성한다. /today 자체는 실제 페이지(pages/TodayPage.vue)이고,
// 여기 등록만 지금 임시로 해둔 것 — CLAUDE.md 3절 route name("today")을 그대로 씀.
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

export default router
