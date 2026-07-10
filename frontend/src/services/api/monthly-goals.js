import { request } from './http'

function fromApi(g) {
  return { id: g.id, title: g.title, categoryId: g.category_id }
}

export async function listMonthlyGoals() {
  // TEMP: dailytodo 목표 태그 기능 브라우저 테스트용 목업 (테스트 후 아래 2줄로 원복할 것)
  return [
    { id: 'mock-m1', title: '독서 습관 만들기', categoryId: 'mock-cat-rose' },
    { id: 'mock-m2', title: '체력 기르기', categoryId: 'mock-cat-blue' },
  ]
  // const rows = await request('/monthly-goals')
  // return rows.map(fromApi)
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
