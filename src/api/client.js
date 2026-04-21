export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"

export const TOKEN_KEY = "s101_token"

export function staticUrl(key) {
  if (!key) return ""
  if (/^https?:\/\//i.test(key)) return key
  if (key.startsWith("/static/")) return `${BASE_URL}${key}`
  return `${BASE_URL}/static/${key}`
}

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

export async function apiUpload(path, formData, { auth = true } = {}) {
  const headers = { "Accept": "application/json" }
  if (auth) {
    const token = getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: formData })
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
