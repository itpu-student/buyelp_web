import { apiFetch } from "./client.js"

export function listPlaces({ query, category, sort, near, page = 1, limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (query) params.set("query", query)
  if (category && category !== "all") params.set("category", category)
  if (sort) params.set("sort", sort)
  if (near) params.set("near", near)
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
