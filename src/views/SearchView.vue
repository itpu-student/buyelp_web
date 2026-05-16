<template>
  <div class="page-content">
    <div class="container">
      <div class="search-page-header">
        <h1 class="section-title">{{ t('search.title') }}</h1>
        <p class="text-muted text-sm mt-2">
          <span v-if="loading">Loading…</span>
          <span v-else-if="loadError" class="error-text">{{ loadError }}</span>
          <span v-else>{{ total }} {{ total === 1 ? 'place' : 'places' }} found</span>
        </p>
      </div>

      <div class="search-bar-row">
        <div class="search-input-wrap">
          <span class="s-icon">🔍</span>
          <input
            v-model="query"
            :placeholder="t('search.placeholder')"
            class="form-input s-input"
          />
          <button v-if="query" class="clear-btn" @click="query = ''">✕</button>
        </div>
      </div>

      <div class="cat-chips">
        <button
          v-for="cat in allCategories"
          :key="cat.id || 'all'"
          class="chip"
          :class="{ active: selectedCategoryId === cat.id }"
          @click="selectedCategoryId = cat.id"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <div v-if="places.length" class="place-row-list">
        <PlaceRow v-for="place in places" :key="place.id" :place="place" />
        <Pagination v-if="totalPages > 1" :current="page" :total="totalPages" @go="goToPage" />
      </div>
      <div v-else-if="!loading" class="empty-state">
        <span class="empty-icon">🔍</span>
        <h3>{{ t('search.no_results') }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { t, i18nState } from '../i18n/index.js'
import { listPlaces } from '../api/places.js'
import { normalizePlace } from '../api/normalize.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'
import PlaceRow from '../components/PlaceRow.vue'
import Pagination from '../components/Pagination.vue'

const route = useRoute()
const query = ref('')
const selectedCategoryId = ref('')
const places = ref([])
const total = ref(0)
const loading = ref(true)
const loadError = ref('')
const page = ref(1)

const LIMIT = 20
const totalPages = computed(() => Math.ceil(total.value / LIMIT) || 1)

const categoryIcons = {
  all: '🗺️', restaurants: '🍽️', auto: '🚗', health: '🏥',
  activities: '🎡', sports: '⚽', tabiat: '🏔️',
}

const allCategories = computed(() =>
  categoriesState.list.map((c) => ({
    id: c.id || '',
    icon: c.emoji || categoryIcons[c.slug] || '📍',
    label: c.name?.[i18nState.locale] || c.name?.en || c.slug,
  }))
)

let fetchToken = 0
async function runFetch(p = page.value) {
  const myToken = ++fetchToken
  loading.value = true
  loadError.value = ''
  try {
    const res = await listPlaces({
      query: query.value.trim() || undefined,
      category_id: selectedCategoryId.value,
      sort: 'top',
      page: p,
      limit: LIMIT,
    })
    if (myToken !== fetchToken) return
    places.value = (res.items || []).map(normalizePlace)
    total.value = res.total ?? places.value.length
    page.value = p
  } catch (e) {
    if (myToken !== fetchToken) return
    loadError.value = e.message || 'Failed to load places'
    places.value = []
    total.value = 0
  } finally {
    if (myToken === fetchToken) loading.value = false
  }
}

function goToPage(n) { runFetch(n) }

let debounceTimer = null
function resetAndFetch() {
  page.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => runFetch(1), 300)
}

watch(query, resetAndFetch)
watch(selectedCategoryId, () => { page.value = 1; runFetch(1) })

onMounted(async () => {
  if (route.query.q) query.value = String(route.query.q)
  await ensureCategoriesLoaded()
  const rq = route.query.category ? String(route.query.category) : ''
  if (rq) {
    const bySlug = categoriesState.bySlug[rq]
    selectedCategoryId.value = bySlug ? (bySlug.id || '') : rq
  }
  runFetch()
})
</script>

<style scoped>
.search-page-header { margin-bottom: 24px; }
.error-text { color: #dc2626; }
.search-bar-row { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input-wrap { position: relative; flex: 1; display: flex; align-items: center; }
.s-icon { position: absolute; left: 14px; font-size: 1rem; pointer-events: none; }
.s-input { padding-left: 40px; padding-right: 36px; }
.clear-btn {
  position: absolute; right: 12px;
  color: var(--text-3); font-size: 0.85rem;
  transition: color var(--transition);
}
.clear-btn:hover { color: var(--text); }
.cat-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.place-row-list { display: flex; flex-direction: column; gap: 20px; }
.empty-state {
  text-align: center; padding: 80px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  color: var(--text-2);
}
.empty-icon { font-size: 3rem; }
</style>
