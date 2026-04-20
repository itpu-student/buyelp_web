import { reactive } from "vue"
import { setToken } from "../api/client.js"

const USER_KEY = "buyelp_user"
const SAVED_PLACES_KEY = "buyelp_saved_places"
const savedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null")
const savedPlaces = JSON.parse(localStorage.getItem(SAVED_PLACES_KEY) || "[]")

export const store = reactive({
  isLoggedIn: !!savedUser,
  user: savedUser,

  savedPlaceIds: Array.isArray(savedPlaces) ? savedPlaces : [],

  setSession({ token, user }) {
    setToken(token)
    this.user = user
    this.isLoggedIn = true
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  logout() {
    setToken(null)
    this.user = null
    this.isLoggedIn = false
    localStorage.removeItem(USER_KEY)
  },

  isPlaceSaved(placeId) {
    return this.savedPlaceIds.includes(String(placeId))
  },

  toggleSavedPlace(placeId) {
    const id = String(placeId)
    const i = this.savedPlaceIds.indexOf(id)
    if (i === -1) this.savedPlaceIds.push(id)
    else this.savedPlaceIds.splice(i, 1)
    localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(this.savedPlaceIds))
  },
})
