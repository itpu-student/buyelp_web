import { createApp } from "vue"
import App from "./App.vue"
import router from "./router/index.js"
import { setAdminUnauthorizedHandler } from "./api/client.js"
import { adminStore } from "./store/adminStore.js"
import "./assets/main.css"

// Any admin request that returns 401 means the session is dead: log out and
// send the admin back to the login page.
setAdminUnauthorizedHandler(() => {
  adminStore.adminLogout()
  if (router.currentRoute.value.name !== "admin-login") {
    router.push("/admin/login")
  }
})

if (!localStorage.getItem("s101__theme")) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark")
    localStorage.setItem("s101__theme", "dark")
  }
}

const app = createApp(App)
app.use(router)
router.isReady().then(() => app.mount('#app'))
