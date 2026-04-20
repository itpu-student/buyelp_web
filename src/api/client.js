const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

export const TOKEN_KEY = "s101_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ""
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code || `HTTP ${status}`)
    this.status = status
    this.code = code
  }
}

export async function apiFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Accept": "application/json" }
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const code = data?.error || "error"
    const message = data?.message || res.statusText
    throw new ApiError(res.status, code, message)
  }
  return data
}
