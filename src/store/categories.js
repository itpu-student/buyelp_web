import { reactive } from "vue"
import { listCategories } from "../api/categories.js"

export const categoriesState = reactive({
  loaded: false,
  loading: false,
  error: null,
  list: [],
  byId: {},
  bySlug: {},
})

const CATS_KEY = "s101__categories"

function applyCategories(cats) {
  categoriesState.list = cats
  categoriesState.byId = Object.fromEntries(cats.map((c) => [c.id, c]))
  categoriesState.bySlug = Object.fromEntries(cats.map((c) => [c.slug, c]))
}

// Sync hydrate from localStorage on module init
try {
  const cached = JSON.parse(localStorage.getItem(CATS_KEY))
  if (Array.isArray(cached) && cached.length) {
    applyCategories(cached)
    categoriesState.loaded = true
  }
} catch (_) {}

// One background fetch per session to keep cache fresh
let loadPromise = null

export function ensureCategoriesLoaded() {
  if (!loadPromise) {
    if (!categoriesState.loaded) categoriesState.loading = true
    loadPromise = listCategories()
      .then((cats) => {
        if (cats?.length) {
          applyCategories(cats)
          categoriesState.loaded = true
          localStorage.setItem(CATS_KEY, JSON.stringify(cats))
        }
      })
      .catch((e) => {
        if (!categoriesState.loaded) categoriesState.error = e
      })
      .finally(() => {
        categoriesState.loading = false
      })
  }

  if (categoriesState.loaded) return Promise.resolve()
  return loadPromise
}

export function slugForCategoryId(id) {
  return categoriesState.byId[id]?.slug || id || ""
}
