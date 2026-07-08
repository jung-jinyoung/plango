// Timeline/Todo 도메인을 모르는 범용 포인터 드래그 배선.
// 시작점(핸들)에 onPointerDown만 바인딩하면 move/up 리스너 부착·해제를 대신 처리한다.
export function usePointerDrag({ onStart, onMove, onEnd }) {
  function onPointerDown(e) {
    e.preventDefault()
    e.target.setPointerCapture?.(e.pointerId)
    onStart?.(e)

    function handleMove(ev) {
      onMove?.(ev)
    }
    function handleUp(ev) {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      onEnd?.(ev)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return { onPointerDown }
}
