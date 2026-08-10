// .quasar/quasar.d.ts의 ImportMetaEnv는 quasar prepare가 감지한 환경변수만
// 자동 생성한다 — 배포 환경에만 설정하는 VITE_DEMO_FRESH는 로컬에 없을 수
// 있으므로 여기서 선언을 보강한다(전역 인터페이스 병합).

interface ImportMetaEnv {
  readonly VITE_DEMO_FRESH?: string
}
