// Quasar가 자동으로 감지하는 Pinia 인스턴스 생성 지점 (src/stores/index).
// frontend/(v1)의 같은 패턴을 그대로 따른다. features/*/stores/의 개별
// 스토어(goalStore 등)와는 다른 파일 — 이건 Pinia 자체를 부트스트랩한다.

import { defineStore } from '#q-app'
import { createPinia } from 'pinia'

export default defineStore(() => {
  const pinia = createPinia()
  return pinia
})
