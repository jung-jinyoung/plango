import { request } from './http'

function fromApi(g) {
  return { id: g.id, title: g.title, monthlyGoalId: g.monthly_goal_id, categoryId: g.category_id }
}

export async function listWeeklyGoals() {
  const rows = await request('/weekly-goals')
  return rows.map(fromApi)
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
