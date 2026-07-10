import { request } from './http'

function fromApi(g) {
  return { id: g.id, title: g.title, categoryId: g.category_id }
}

export async function listMonthlyGoals() {
  const rows = await request('/monthly-goals')
  return rows.map(fromApi)
}

export async function createMonthlyGoal({ title, categoryId }) {
  const row = await request('/monthly-goals', {
    method: 'POST',
    body: { title, category_id: categoryId },
  })
  return fromApi(row)
}

export async function updateMonthlyGoal(id, { title, categoryId }) {
  const row = await request(`/monthly-goals/${id}`, {
    method: 'PATCH',
    body: { title, category_id: categoryId },
  })
  return fromApi(row)
}

export async function deleteMonthlyGoal(id) {
  await request(`/monthly-goals/${id}`, { method: 'DELETE' })
}
