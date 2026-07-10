import { request } from './http'

function fromApi(c) {
  return { id: c.id, name: c.name, color: c.color }
}

export async function listCategories() {
  // TEMP: dailytodo 목표 태그 기능 브라우저 테스트용 목업 (테스트 후 아래 2줄로 원복할 것)
  return [
    { id: 'mock-cat-rose', name: '자기계발', color: 'rose' },
    { id: 'mock-cat-blue', name: '건강', color: 'blue' },
  ]
  // const rows = await request('/categories')
  // return rows.map(fromApi)
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
