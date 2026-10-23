import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // node 조건이면 quasar가 SSR 빌드로 잡혀 플러그인 설치가 실패한다 — 브라우저 빌드를 쓴다
    alias: { quasar: 'quasar/dist/quasar.client.js' },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
})
