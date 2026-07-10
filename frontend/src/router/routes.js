const routes = [
  // --- 비로그인 영역 (A1~A3) ---
  { path: '/', component: () => import('@/pages/LandingPage.vue') },
  { path: '/login', component: () => import('@/pages/AuthPage.vue') },
  { path: '/onboarding', component: () => import('@/pages/OnboardingPage.vue') },

  // --- 로그인 영역 (B~G), AppShellLayout(Sidebar+Header) 공유 ---
  {
    path: '/app',
    component: () => import('@/layouts/AppShellLayout.vue'),
    children: [
      { path: '', redirect: '/app/dashboard' },

      // B. 대시보드 (월/주/일 탭 전환)
      { path: 'dashboard', redirect: '/app/dashboard/monthly' },
      {
        path: 'dashboard/monthly',
        component: () => import('@/pages/app/DashboardMonthlyPage.vue'),
        meta: { showDateNav: true, dateUnit: 'month', periodTabs: 'dashboard' },
      },
      {
        path: 'dashboard/weekly',
        component: () => import('@/pages/app/DashboardWeeklyPage.vue'),
        meta: { showDateNav: true, dateUnit: 'week', periodTabs: 'dashboard' },
      },
      {
        path: 'dashboard/daily',
        component: () => import('@/pages/app/DashboardDailyPage.vue'),
        meta: { showDateNav: true, dateUnit: 'day', periodTabs: 'dashboard' },
      },

      // C. 목표 관리 (C3 트리 뷰만 라우트, C1/C2는 모달)
      {
        path: 'goals',
        component: () => import('@/pages/app/GoalsTreePage.vue'),
        meta: { title: '목표 관리' },
      },

      // E. 회고 (E1/E2 탭 전환 + E3 아카이브)
      { path: 'retrospective', redirect: '/app/retrospective/weekly' },
      {
        path: 'retrospective/weekly',
        component: () => import('@/pages/app/RetroWeeklyPage.vue'),
        meta: { showDateNav: true, dateUnit: 'week', periodTabs: 'retrospective' },
      },
      {
        path: 'retrospective/monthly',
        component: () => import('@/pages/app/RetroMonthlyPage.vue'),
        meta: { showDateNav: true, dateUnit: 'month', periodTabs: 'retrospective' },
      },
      {
        path: 'retrospective/archive',
        component: () => import('@/pages/app/RetroArchivePage.vue'),
        meta: { title: '회고 히스토리' },
      },

      // F. 데일리 저널
      {
        path: 'records',
        component: () => import('@/pages/app/RecordsPage.vue'),
        meta: { showDateNav: true, dateUnit: 'day' },
      },

      // G. 설정 (G1 계정/알림, G2 카테고리는 모달)
      {
        path: 'settings',
        component: () => import('@/layouts/SettingsLayout.vue'),
        meta: { title: '설정' },
        children: [
          { path: '', redirect: '/app/settings/account' },
          { path: 'account', component: () => import('@/pages/app/SettingsAccountPage.vue') },
          {
            path: 'notifications',
            component: () => import('@/pages/app/SettingsNotificationsPage.vue'),
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
