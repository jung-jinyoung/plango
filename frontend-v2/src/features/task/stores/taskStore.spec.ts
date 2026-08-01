import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { getSeedTasks } from '../lib/taskRepository'
import { useTaskStore } from './taskStore'

describe('useTaskStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('updateTask가 로컬 상태를 patch로 갱신한다', () => {
    const store = useTaskStore()
    const target = store.tasks[0]!

    store.updateTask(target.id, { title: '바뀐 제목' })

    expect(store.tasks[0]!.title).toBe('바뀐 제목')
    // patch에 없는 필드는 그대로 유지된다
    expect(store.tasks[0]!.id).toBe(target.id)
  })

  it('존재하지 않는 id면 아무 것도 바뀌지 않는다', () => {
    const store = useTaskStore()
    const before = [...store.tasks]

    store.updateTask('no-such-id', { title: '무시됨' })

    expect(store.tasks).toEqual(before)
  })

  it('seed-data.json에서 가져온 원본 배열을 직접 공유하지 않는다(얕은 복사)', () => {
    const store = useTaskStore()
    const target = store.tasks[0]!
    const originalTitle = target.title

    store.updateTask(target.id, { title: '스토어 전용 변경' })

    expect(store.tasks.find((t) => t.id === target.id)?.title).toBe('스토어 전용 변경')
    // repository에서 다시 읽은 원본(별도 배열)은 영향을 받지 않아야 한다
    const fromRepository = getSeedTasks().find((t) => t.id === target.id)
    expect(fromRepository?.title).toBe(originalTitle)
  })
})
