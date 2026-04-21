import { apiFetch } from "./client.js"

export function listBookmarks({ page = 1, limit = 100 } = {}) {
  const q = new URLSearchParams({ page, limit }).toString()
  return apiFetch(`/api/bookmarks?${q}`, { auth: true })
}

export function addBookmark(placeId) {
  return apiFetch(`/api/bookmarks/${encodeURIComponent(placeId)}`, { method: "POST", auth: true })
}

export function removeBookmark(placeId) {
  return apiFetch(`/api/bookmarks/${encodeURIComponent(placeId)}`, { method: "DELETE", auth: true })
}
