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

  it('addTask가 새 task를 추가한다', () => {
    const store = useTaskStore()
    const before = store.tasks.length

    store.addTask({
      id: 'task-test',
      title: '테스트 할 일',
      weeklyGoalId: null,
      categoryId: null,
      estimatedMin: 30,
      plannedBlock: null,
      actualBlock: null,
      status: 'todo',
      confirmed: false,
    })

    expect(store.tasks.length).toBe(before + 1)
    expect(store.tasksById.get('task-test')?.title).toBe('테스트 할 일')
  })

  it('addTask는 이미 있는 id면 중복 추가하지 않는다', () => {
    const store = useTaskStore()
    const existing = store.tasks[0]!
    const before = store.tasks.length

    store.addTask({ ...existing, id: existing.id, title: '중복 시도' })

    expect(store.tasks.length).toBe(before)
    expect(store.tasksById.get(existing.id)?.title).toBe(existing.title)
  })
})
