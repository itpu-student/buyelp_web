import { apiFetch } from "./client.js"

function buildQuery(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, v)
  }
  const s = q.toString()
  return s ? "?" + s : ""
}

export function adminListAdmins(params = {}) {
  return apiFetch(`/api/admin/admins${buildQuery(params)}`, { adminAuth: true })
}

export function adminGetAdmin(id) {
  return apiFetch(`/api/admin/admins/${id}`, { adminAuth: true })
}

export function adminCreateAdmin(body) {
  return apiFetch('/api/admin/admins', { method: 'POST', body, adminAuth: true })
}

export function adminEditAdmin(id, body) {
  return apiFetch(`/api/admin/admins/${id}`, { method: 'PUT', body, adminAuth: true })
}
