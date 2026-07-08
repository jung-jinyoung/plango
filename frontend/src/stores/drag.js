import { defineStore } from 'pinia'
import { ref } from 'vue'

// Todo 목록과 Timeline은 형제 컴포넌트라 상태를 끌어올릴 부모가 마땅치 않다.
// 드래그 중에만 존재하는 아주 짧은 수명의 상태를 담는 store.
export const useDragStore = defineStore('drag', () => {
  const isDragging = ref(false)
  const type = ref(null) // 'todo' | 'schedule'
  const payload = ref(null)
  const pointerX = ref(0)
  const pointerY = ref(0)

  function start(dragType, data, e) {
    isDragging.value = true
    type.value = dragType
    payload.value = data
    pointerX.value = e.clientX
    pointerY.value = e.clientY
  }

  function move(e) {
    pointerX.value = e.clientX
    pointerY.value = e.clientY
  }

  function end() {
    isDragging.value = false
    type.value = null
    payload.value = null
  }

  return { isDragging, type, payload, pointerX, pointerY, start, move, end }
})
