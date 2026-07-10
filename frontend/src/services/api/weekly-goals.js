import { request } from './http'

function fromApi(g) {
  return { id: g.id, title: g.title, monthlyGoalId: g.monthly_goal_id, categoryId: g.category_id }
}

export async function listWeeklyGoals() {
  // TEMP: dailytodo 목표 태그 기능 브라우저 테스트용 목업 (테스트 후 아래 2줄로 원복할 것)
  return [
    { id: 'mock-w1', title: '주 3회 독서 30분', monthlyGoalId: 'mock-m1', categoryId: 'mock-cat-rose' },
    { id: 'mock-w2', title: '홈트 루틴 정착', monthlyGoalId: 'mock-m2', categoryId: 'mock-cat-blue' },
  ]
  // const rows = await request('/weekly-goals')
  // return rows.map(fromApi)
}

export async function createWeeklyGoal({ title, monthlyGoalId }) {
  const row = await request('/weekly-goals', {
    method: 'POST',
    body: { title, monthly_goal_id: monthlyGoalId ?? null },
  })
  return fromApi(row)
}

export async function updateWeeklyGoal(id, { title, monthlyGoalId }) {
  const row = await request(`/weekly-goals/${id}`, {
    method: 'PATCH',
    body: { title, monthly_goal_id: monthlyGoalId },
  })
  return fromApi(row)
}

export async function deleteWeeklyGoal(id) {
  await request(`/weekly-goals/${id}`, { method: 'DELETE' })
}
