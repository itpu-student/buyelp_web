import { createRouter, createWebHistory } from "vue-router"
import { adminStore } from "../store/adminStore.js"

const routes = [
  { path: "/", name: "home", component: () => import("../views/HomeView.vue") },
  { path: "/search", name: "search", component: () => import("../views/SearchView.vue") },
  { path: "/place/:id", name: "place", component: () => import("../views/PlaceView.vue") },
  { path: "/places/new", name: "place-new", component: () => import("../views/AddPlaceView.vue") },
  { path: "/login", name: "login", component: () => import("../views/LoginView.vue") },
  { path: "/register", name: "register", component: () => import("../views/RegisterView.vue") },
  { path: "/profile", name: "profile", component: () => import("../views/ProfileView.vue") },
  { path: "/business", name: "business", component: () => import("../views/BusinessView.vue") },
  { path: "/business/:alias/edit", name: "business-place-edit", component: () => import("../views/BusinessPlaceEditView.vue") },
  { path: "/u/:alias", name: "user", component: () => import("../views/UserView.vue") },
  {
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    children: [
      { path: "", redirect: "/admin/reports" },
      { path: "login", name: "admin-login", component: () => import("../views/admin/AdminLoginView.vue") },
      { path: "reports", name: "admin-reports", component: () => import("../views/admin/AdminReportsView.vue") },
      { path: "reports/:id", name: "admin-report-detail", component: () => import("../views/admin/AdminReportDetailView.vue") },
      { path: "places", name: "admin-places", component: () => import("../views/admin/AdminPlacesView.vue") },
      { path: "places/:alias/edit", name: "admin-place-edit", component: () => import("../views/admin/AdminPlaceEditView.vue") },
      { path: "reviews", name: "admin-reviews", component: () => import("../views/admin/AdminReviewsView.vue") },
      { path: "users", name: "admin-users", component: () => import("../views/admin/AdminUsersView.vue") },
      { path: "claims", name: "admin-claims", component: () => import("../views/admin/AdminClaimsView.vue") },
      { path: "admins", name: "admin-admins", component: () => import("../views/admin/AdminAdminsView.vue") },
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
    if (loggedIn) return "/admin/reports"
    return true
  }

  if (!loggedIn) return "/admin/login"
  return true
})

export default router
