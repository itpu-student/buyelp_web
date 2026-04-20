import { apiFetch } from "./client.js"

export function listCategories() {
  return apiFetch("/api/categories")
}
