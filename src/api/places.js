import { apiFetch } from "./client.js"

export function listPlaces({ query, category_id, sort, near, near_max_distance, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (query) params.set("query", query)
  if (category_id) params.set("category_id", category_id)
  if (sort) params.set("sort", sort)
  if (near) params.set("near", near)
  if (near_max_distance) params.set("near_max_distance", String(near_max_distance))
  params.set("page", String(page))
  params.set("limit", String(limit))
  return apiFetch(`/api/places?${params.toString()}`)
}

export function getPlace(idOrSlug) {
  return apiFetch(`/api/places/${encodeURIComponent(idOrSlug)}`, { auth: true })
}

export function createPlace(payload) {
  return apiFetch("/api/places/create", { method: "POST", body: payload, auth: true })
}

export function updatePlace(uuid, payload) {
  return apiFetch(`/api/places/${encodeURIComponent(uuid)}`, { method: "PUT", body: payload, auth: true })
}

export function listMyPlaces({ page = 1, limit = 50 } = {}) {
  return apiFetch(`/api/places/mine?page=${page}&limit=${limit}`, { auth: true })
}

export function getPlaceAISummary(uuid) {
  return apiFetch(`/api/places/${encodeURIComponent(uuid)}/ai-summary`)
}
