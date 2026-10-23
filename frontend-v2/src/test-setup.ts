import { config, RouterLinkStub } from '@vue/test-utils'

// 페이지 테스트 대부분이 라우터 없이 마운트한다 — 공통 헤더(AppHeader)의 화면 이동
// 링크가 route name 해석 때문에 깨지지 않도록 RouterLink를 전역으로 대체한다.
config.global.stubs = { ...config.global.stubs, RouterLink: RouterLinkStub }
