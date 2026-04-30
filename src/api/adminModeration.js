import { apiFetch } from "./client.js"

function buildQuery(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, v)
  }
  const s = q.toString()
  return s ? "?" + s : ""
}

// Places
export function adminListPlaces(params = {}) {
  return apiFetch(`/api/admin/places${buildQuery(params)}`, { adminAuth: true })
}

export function adminSetPlaceStatus(id, status) {
  return apiFetch(`/api/admin/places/${id}/status`, { method: "PUT", body: { status }, adminAuth: true })
}

export function adminUpdatePlace(id, payload) {
  return apiFetch(`/api/admin/places/${id}`, { method: "PUT", body: payload, adminAuth: true })
}

export function adminDeletePlace(id) {
  return apiFetch(`/api/admin/places/${id}`, { method: "DELETE", adminAuth: true })
}

// Reviews
export function adminListReviews(params = {}) {
  return apiFetch(`/api/admin/reviews${buildQuery(params)}`, { adminAuth: true })
}

export function adminDeleteReview(id) {
  return apiFetch(`/api/admin/reviews/${id}`, { method: "DELETE", adminAuth: true })
}

// Users
export function adminListUsers(params = {}) {
  return apiFetch(`/api/admin/users${buildQuery(params)}`, { adminAuth: true })
}

export function adminBlockUser(id) {
  return apiFetch(`/api/admin/users/${id}/block`, { method: "PUT", adminAuth: true })
}

// Claims
export function adminListClaims(params = {}) {
  return apiFetch(`/api/admin/claims${buildQuery(params)}`, { adminAuth: true })
}

export function adminReviewClaim(id, body) {
  return apiFetch(`/api/admin/claims/${id}`, { method: "PUT", body, adminAuth: true })
}
