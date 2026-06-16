import { reactive } from "vue"
import { t } from "../i18n/index.js"

// Shared "Show me" location state: the on/off toggle persists across views and
// sessions (localStorage); the actual coords fix is cached per session only.
const SHOW_ME_KEY = "s101__show_me"

export const locationState = reactive({
  showMe: false,
  coords: null,        // {lat, lon} once granted — avoids re-prompting
  geoLoading: false,
  geoError: "",
})

// Hydrate the toggle from localStorage on module init
try {
  locationState.showMe = localStorage.getItem(SHOW_ME_KEY) === "1"
} catch (_) {}

function getCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error(t("search.geo_error"))); return }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => reject(new Error(t("search.geo_error"))),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}

// Request geolocation once and cache it. Reuses any cached fix; throws on
// denial/failure (with geoError set).
export async function ensureCoords() {
  if (locationState.coords) return locationState.coords
  locationState.geoLoading = true
  locationState.geoError = ""
  try {
    locationState.coords = await getCoords()
    return locationState.coords
  } catch (e) {
    locationState.geoError = e.message
    throw e
  } finally {
    locationState.geoLoading = false
  }
}

// Turn "Show me" on/off. Turning on requests geolocation once; a denied/failed
// request reverts the toggle to off.
export async function setShowMe(on) {
  locationState.showMe = on
  try { localStorage.setItem(SHOW_ME_KEY, on ? "1" : "0") } catch (_) {}
  if (!on) return
  try {
    await ensureCoords()
  } catch (_) {
    locationState.showMe = false
    try { localStorage.setItem(SHOW_ME_KEY, "0") } catch (_) {}
  }
}

export function toggleShowMe() {
  return setShowMe(!locationState.showMe)
}

// Ensure coords are loaded when "Show me" is already on (e.g. a fresh page load
// where the toggle was persisted as on but coords aren't cached yet).
export function ensureCoordsIfShowing() {
  if (locationState.showMe && !locationState.coords && !locationState.geoLoading) {
    return ensureCoords().catch(() => {})
  }
  return Promise.resolve()
}
