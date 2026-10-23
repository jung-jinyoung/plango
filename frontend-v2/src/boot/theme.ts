import { defineBoot } from '#q-app'
import { initTheme } from '../shared/lib/theme'

// 첫 화면을 그리기 전에 저장된 라이트·다크를 적용해 깜빡임을 줄인다
export default defineBoot(() => {
  initTheme()
})
