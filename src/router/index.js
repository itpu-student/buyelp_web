import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import SearchView from "../views/SearchView.vue"
import PlaceView from "../views/PlaceView.vue"
import LoginView from "../views/LoginView.vue"
import RegisterView from "../views/RegisterView.vue"
import ProfileView from "../views/ProfileView.vue"
import AdminView from "../views/AdminView.vue"
import AddPlaceView from "../views/AddPlaceView.vue"

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/search", name: "search", component: SearchView },
  { path: "/place/:id", name: "place", component: PlaceView },
  { path: "/places/new", name: "place-new", component: AddPlaceView },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/profile", name: "profile", component: ProfileView },
  { path: "/admin", name: "admin", component: AdminView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
