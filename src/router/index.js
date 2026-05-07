import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import SearchView from "../views/SearchView.vue"
import PlaceView from "../views/PlaceView.vue"
import LoginView from "../views/LoginView.vue"
import RegisterView from "../views/RegisterView.vue"
import ProfileView from "../views/ProfileView.vue"
import AddPlaceView from "../views/AddPlaceView.vue"
import BusinessView from "../views/BusinessView.vue"
import UserView from "../views/UserView.vue"

import AdminLayout from "../views/admin/AdminLayout.vue"
import AdminLoginView from "../views/admin/AdminLoginView.vue"
import AdminReportsView from "../views/admin/AdminReportsView.vue"
import AdminReportDetailView from "../views/admin/AdminReportDetailView.vue"
import AdminPlacesView from "../views/admin/AdminPlacesView.vue"
import AdminReviewsView from "../views/admin/AdminReviewsView.vue"
import AdminUsersView from "../views/admin/AdminUsersView.vue"
import AdminClaimsView from "../views/admin/AdminClaimsView.vue"
import AdminAdminsView from "../views/admin/AdminAdminsView.vue"
import AdminPlaceEditView from "../views/admin/AdminPlaceEditView.vue"
import BusinessPlaceEditView from "../views/BusinessPlaceEditView.vue"

import { adminStore } from "../store/adminStore.js"

const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/search", name: "search", component: SearchView },
  { path: "/place/:id", name: "place", component: PlaceView },
  { path: "/places/new", name: "place-new", component: AddPlaceView },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/profile", name: "profile", component: ProfileView },
  { path: "/business", name: "business", component: BusinessView },
  { path: "/business/:alias/edit", name: "business-place-edit", component: BusinessPlaceEditView },
  { path: "/u/:alias", name: "user", component: UserView },
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", redirect: "/admin/reports" },
      { path: "login", name: "admin-login", component: AdminLoginView },
      { path: "reports", name: "admin-reports", component: AdminReportsView },
      { path: "reports/:id", name: "admin-report-detail", component: AdminReportDetailView },
      { path: "places", name: "admin-places", component: AdminPlacesView },
      { path: "places/:alias/edit", name: "admin-place-edit", component: AdminPlaceEditView },
      { path: "reviews", name: "admin-reviews", component: AdminReviewsView },
      { path: "users", name: "admin-users", component: AdminUsersView },
      { path: "claims", name: "admin-claims", component: AdminClaimsView },
      { path: "admins", name: "admin-admins", component: AdminAdminsView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.path.startsWith("/admin")) return true

  const loggedIn = adminStore.isAdminLoggedIn

  if (to.name === "admin-login") {
    // Already logged in → go to reports
    if (loggedIn) return "/admin/reports"
    return true
  }

  // All other /admin/* require admin token
  if (!loggedIn) return "/admin/login"
  return true
})

export default router
