import { apiFetch } from "./client.js"

export function verifyCode(code) {
  return apiFetch("/api/auth/verify-code", { method: "POST", body: { code } })
}

export function getMe() {
  return apiFetch("/api/auth/me", { auth: true })
}
