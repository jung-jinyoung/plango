// 할 일·약속 스토어. 데이터는 taskRepository를 통해서만 읽는다.

import { defineStore } from 'pinia'
import { getSeedTasks } from '../lib/taskRepository'

export const useTaskStore = defineStore('task', () => {
  const tasks = getSeedTasks()

  return { tasks }
})
