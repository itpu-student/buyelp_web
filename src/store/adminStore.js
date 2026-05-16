import { reactive } from "vue"
import { setAdminToken } from "../api/client.js"

const ADMIN_KEY = "_s101_admin"
const savedAdmin = JSON.parse(localStorage.getItem(ADMIN_KEY) || "null")

export const adminStore = reactive({
  isAdminLoggedIn: !!savedAdmin,
  admin: savedAdmin,

  setAdminSession({ token, admin }) {
    setAdminToken(token)
    this.admin = admin
    this.isAdminLoggedIn = true
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  },

  adminLogout() {
    setAdminToken(null)
    this.admin = null
    this.isAdminLoggedIn = false
    localStorage.removeItem(ADMIN_KEY)
  },
})
