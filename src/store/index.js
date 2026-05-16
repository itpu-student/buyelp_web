import { reactive } from "vue"
import { setToken, getToken } from "../api/client.js"
import { listBookmarks, addBookmark, removeBookmark } from "../api/bookmarks.js"
import { normalizePlace } from "../api/normalize.js"
import { getMe } from "../api/auth.js"

const USER_KEY = "s101_user"
const SAVED_PLACES_KEY = "s101_saved_places"

// Read persisted state before the store is created so initial values are sync
const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null")
const hasToken = !!getToken()
const savedPlaces = JSON.parse(localStorage.getItem(SAVED_PLACES_KEY) || "[]")

function persistSaved(ids) {
  localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(ids))
}

export const store = reactive({
  // True if we have either a cached user object or a token — avoids a flash of "logged out" UI
  isLoggedIn: !!(savedUser || hasToken),
  user: savedUser,

  // savedPlaceIds — flat id list for fast lookup; savedPlaces — full objects for the saved-places page
  savedPlaceIds: Array.isArray(savedPlaces) ? savedPlaces : [],
  savedPlaces: [],

  // Called after login; sets everything in one shot and kicks off bookmark sync
  setSession({ token, user }) {
    setToken(token)
    this.user = user
    this.isLoggedIn = true
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    this.hydrateBookmarks()
  },

  setUser(user) {
    this.user = user
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  logout() {
    setToken(null)
    this.user = null
    this.isLoggedIn = false
    localStorage.removeItem(USER_KEY)
    this.savedPlaceIds = []
    this.savedPlaces = []
    persistSaved([])
  },

  isPlaceSaved(placeId) {
    return this.savedPlaceIds.includes(String(placeId))
  },

  async hydrateBookmarks() {
    if (!this.isLoggedIn) return
    try {
      const res = await listBookmarks({ limit: 100 })
      const items = res?.items || []
      const ids = items.map((b) => String(b.place_id))
      this.savedPlaceIds = ids
      persistSaved(ids)
      this.savedPlaces = items.map((b) => {
        if (!b.place) return null
        const p = normalizePlace(b.place)
        p._savedAt = b.created_at || null
        return p
      }).filter(Boolean)
    } catch (_) {
      // ignore — keep cached list
    }
  },

  async bootstrap() {
    if (!getToken()) return

    // During development the token is swapped often (testing different accounts).
    // Decode the JWT locally (no request) to get the user id it belongs to,
    // and if it doesn't match the cached user — re-fetch so the UI stays correct.
    let needsFetch = !this.user
    if (!needsFetch) {
      try {
        const payload = JSON.parse(atob(getToken().split('.')[1]))
        const sub = payload?.sub ? String(payload.sub) : null
        // sub mismatch means the token was replaced with a different account's token
        if (sub && String(this.user?.id) !== sub) needsFetch = true
      } catch (_) {
        // Malformed token or non-JWT — skip the check, keep existing user
      }
    }

    if (needsFetch) {
      try {
        const user = await getMe()
        this.user = user
        this.isLoggedIn = true
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch (_) {
        // Token is invalid/expired — clear everything so the app doesn't sit in a broken state
        this.logout()
        return
      }
    }

    this.hydrateBookmarks()
  },

  async toggleSavedPlace(placeId) {
    if (!this.isLoggedIn) return
    const id = String(placeId)
    const i = this.savedPlaceIds.indexOf(id)
    if (i === -1) {
      // Optimistic add — roll back if the request fails
      this.savedPlaceIds.push(id)
      persistSaved(this.savedPlaceIds)
      try { await addBookmark(id) } catch (e) {
        const j = this.savedPlaceIds.indexOf(id)
        if (j !== -1) this.savedPlaceIds.splice(j, 1)
        persistSaved(this.savedPlaceIds)
        throw e
      }
    } else {
      // Optimistic remove — roll back if the request fails
      this.savedPlaceIds.splice(i, 1)
      persistSaved(this.savedPlaceIds)
      const pi = this.savedPlaces.findIndex((p) => String(p._uuid) === id)
      if (pi !== -1) this.savedPlaces.splice(pi, 1)
      try { await removeBookmark(id) } catch (e) {
        this.savedPlaceIds.push(id)
        persistSaved(this.savedPlaceIds)
        throw e
      }
    }
  },
})

store.bootstrap()
