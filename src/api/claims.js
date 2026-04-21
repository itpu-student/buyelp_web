import { apiFetch } from "./client.js"

export function createClaim({ place_id, phone, note }) {
  const body = { place_id, phone }
  if (note) body.note = note
  return apiFetch("/api/claims", { method: "POST", body, auth: true })
}

export function listMyClaims() {
  return apiFetch("/api/claims/mine", { auth: true })
}
