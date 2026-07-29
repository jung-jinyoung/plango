import { createRouter, createWebHistory } from 'vue-router'
import DesignPreview from '../DesignPreview.vue'

// 임시 라우트 — 실제 페이지 라우팅은 CLAUDE.md 14절 10단계("진입 라우팅 연결")에서 구성한다.
// 지금은 1단계(토큰 + 기본 컴포넌트)를 눈으로 확인하기 위한 프리뷰만 연결.
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'design-preview', component: DesignPreview }],
})

export default router
