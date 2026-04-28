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

let loadPromise = null

export function ensureCategoriesLoaded() {
  if (categoriesState.loaded) return Promise.resolve()
  if (loadPromise) return loadPromise
  categoriesState.loading = true
  categoriesState.error = null
  loadPromise = listCategories()
    .then((cats) => {
      categoriesState.list = cats || []
      categoriesState.byId = {}
      categoriesState.bySlug = {}
      for (const c of categoriesState.list) {
        categoriesState.byId[c.id] = c
        categoriesState.bySlug[c.slug] = c
      }
      categoriesState.loaded = true
    })
    .catch((e) => {
      categoriesState.error = e
    })
    .finally(() => {
      categoriesState.loading = false
      loadPromise = null
    })
  return loadPromise
}

export function slugForCategoryId(id) {
  return categoriesState.byId[id]?.slug || id || ""
}
