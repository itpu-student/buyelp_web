import { apiFetch } from "./client.js"

export function getUser(id) {
  return apiFetch(`/api/users/${encodeURIComponent(id)}`)
}

export function listUserReviews(id, { page = 1, limit = 20 } = {}) {
  const q = new URLSearchParams({ page, limit }).toString()
  return apiFetch(`/api/users/${encodeURIComponent(id)}/reviews?${q}`)
}

export function updateMe(payload) {
  return apiFetch("/api/users/me", { method: "PUT", body: payload, auth: true })
}

export function deleteMe() {
  return apiFetch("/api/users/me", { method: "DELETE", auth: true })
}
