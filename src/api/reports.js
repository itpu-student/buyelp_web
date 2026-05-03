import { apiFetch } from "./client.js"

export function submitReport({ target_id, target_type, type, text }) {
  return apiFetch("/api/reports", { method: "POST", body: { target_id, target_type, type, text }, auth: true })
}

export function getReportMeta() {
  return apiFetch("/api/reports/meta")
}

export function listMyReports({ status, page = 1, limit = 10 } = {}) {
  const params = { page, limit }
  if (status) params.status = status
  return apiFetch(`/api/reports/mine?${new URLSearchParams(params)}`, { auth: true })
}

export function updateReport(id, payload) {
  return apiFetch(`/api/reports/${encodeURIComponent(id)}`, { method: "PUT", body: payload, auth: true })
}

export function deleteReport(id) {
  return apiFetch(`/api/reports/${encodeURIComponent(id)}`, { method: "DELETE", auth: true })
}
