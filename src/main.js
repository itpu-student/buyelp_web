import { createApp } from "vue"
import App from "./App.vue"
import router from "./router/index.js"
import "./assets/main.css"

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
