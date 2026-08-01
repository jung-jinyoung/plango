// 할 일·약속 스토어. 데이터는 taskRepository를 통해서만 읽고 쓴다.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSeedTasks, updateTask as updateTaskInRepository } from '../lib/taskRepository'
import type { Task } from '../../../entities/types'

export const useTaskStore = defineStore('task', () => {
  // getSeedTasks()가 반환하는 배열은 seed-data.json import의 공유 참조라,
  // 그대로 들고 있으면 이 스토어의 로컬 수정이 다른 곳에도 새어나간다 —
  // 얕은 복사로 스토어 자신만의 반응형 상태를 갖는다.
  const tasks = ref<Task[]>([...getSeedTasks()])

  function updateTask(id: string, patch: Partial<Task>) {
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index === -1) return
    tasks.value[index] = { ...tasks.value[index], ...patch }
    updateTaskInRepository(id, patch)
  }

  return { tasks, updateTask }
})
