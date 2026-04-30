import { apiFetch } from "./client.js"

function buildQuery(params) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, v)
  }
  const s = q.toString()
  return s ? "?" + s : ""
}

export function listAdminReports(params = {}) {
  return apiFetch(`/api/admin/reports${buildQuery(params)}`, { adminAuth: true })
}

export function getAdminReport(id) {
  return apiFetch(`/api/admin/reports/${id}`, { adminAuth: true })
}

export function reviewAdminReport(id, body) {
  return apiFetch(`/api/admin/reports/${id}`, { method: "PUT", body, adminAuth: true })
}
