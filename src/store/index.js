import { reactive } from "vue"
import { setToken, getToken } from "../api/client.js"
import { listBookmarks, addBookmark, removeBookmark } from "../api/bookmarks.js"
import { normalizePlace } from "../api/normalize.js"
import { getMe } from "../api/auth.js"

const USER_KEY = "s101_user"
const SAVED_PLACES_KEY = "s101_saved_places"
const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null")
const hasToken = !!getToken()
const savedPlaces = JSON.parse(localStorage.getItem(SAVED_PLACES_KEY) || "[]")

function persistSaved(ids) {
  localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(ids))
}

export const store = reactive({
  isLoggedIn: !!(savedUser || hasToken),
  user: savedUser,

  savedPlaceIds: Array.isArray(savedPlaces) ? savedPlaces : [],
  savedPlaces: [],

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
    if (!this.user) {
      try {
        const user = await getMe()
        this.user = user
        this.isLoggedIn = true
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch (_) {
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
      this.savedPlaceIds.push(id)
      persistSaved(this.savedPlaceIds)
      try { await addBookmark(id) } catch (e) {
        const j = this.savedPlaceIds.indexOf(id)
        if (j !== -1) this.savedPlaceIds.splice(j, 1)
        persistSaved(this.savedPlaceIds)
        throw e
      }
    } else {
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
