import { apiFetch } from "./client.js"

export function listPlaceReviews(idOrSlug, { page = 1, limit = 50 } = {}) {
  const q = new URLSearchParams({ page, limit }).toString()
  return apiFetch(`/api/places/${encodeURIComponent(idOrSlug)}/reviews?${q}`)
}

export function createReview(idOrSlug, payload) {
  return apiFetch(`/api/places/${encodeURIComponent(idOrSlug)}/reviews`, {
    method: "POST",
    body: payload,
    auth: true,
  })
}

export function deleteReview(reviewId) {
  return apiFetch(`/api/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE", auth: true })
}
