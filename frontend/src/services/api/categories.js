import { request } from './http'

function fromApi(c) {
  return { id: c.id, name: c.name, color: c.color }
}

export async function listCategories() {
  const rows = await request('/categories')
  return rows.map(fromApi)
}

export async function createCategory({ name, color }) {
  const row = await request('/categories', { method: 'POST', body: { name, color } })
  return fromApi(row)
}

export async function updateCategory(id, { name, color }) {
  const row = await request(`/categories/${id}`, { method: 'PATCH', body: { name, color } })
  return fromApi(row)
}

export async function deleteCategory(id) {
  await request(`/categories/${id}`, { method: 'DELETE' })
}
