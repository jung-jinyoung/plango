// 실제 백엔드(FastAPI, backend 브랜치) 호출 지점. base URL은 VITE_API_BASE_URL로 덮어쓸 수 있고,
// 없으면 로컬 개발 서버 기본값(uvicorn 기본 포트)을 쓴다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('백엔드 서버에 연결할 수 없어요', 0, null)
  }

  if (res.status === 204) return null

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(payload?.detail ?? `요청이 실패했어요 (${res.status})`, res.status, payload?.detail)
  }
  return payload
}
