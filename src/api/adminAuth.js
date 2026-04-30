import { apiFetch } from "./client.js"

export function adminLogin({ username, password }) {
  return apiFetch("/api/admin/auth/login", { method: "POST", body: { username, password } })
}

export function adminGetMe() {
  return apiFetch("/api/admin/auth/me", { adminAuth: true })
}
