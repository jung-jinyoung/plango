import { createRouter, createWebHistory } from 'vue-router'
import DesignPreview from '../DesignPreview.vue'
import ComponentGallery from '../ComponentGallery.vue'

// 임시 라우트 — 실제 페이지 라우팅은 CLAUDE.md 14절 10단계("진입 라우팅 연결")에서 구성한다.
// 지금은 1단계(토큰 + 기본 컴포넌트)를 눈으로 확인하기 위한 프리뷰만 연결.
// /gallery는 ComponentGallery.vue와 함께 병합 후 삭제할 임시 라우트.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'design-preview', component: DesignPreview },
    { path: '/gallery', name: 'component-gallery', component: ComponentGallery },
  ],
})

export default router
