<template>
  <div class="page-content">
    <div class="container">
      <div class="search-page-header">
        <h1 class="section-title">{{ t('search.title') }}</h1>
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

      <div class="results-bar">
        <div class="sort-segment" role="group" :aria-label="t('search.sort_by')">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            class="sort-btn"
            :class="{ active: sortBy === opt.value }"
            :disabled="geoLoading"
            @click="setSort(opt.value)"
          >
            <span class="sort-icon">{{ opt.icon }}</span>
            {{ geoLoading && opt.value === 'nearest' ? t('search.locating') : t(`search.${opt.key}`) }}
          </button>
        </div>
        <p class="results-count text-muted text-sm">
          <span v-if="loading">{{ t('common.loading') }}</span>
          <span v-else-if="loadError" class="error-text">{{ loadError }}</span>
          <span v-else>{{ t('search.places_found', { count: total }) }}</span>
        </p>
      </div>
      <p v-if="geoError" class="geo-error">📍 {{ geoError }}</p>

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

const sortBy = ref('top')
const coords = ref(null)        // cached {lat, lon} once granted — avoids re-prompting
const geoLoading = ref(false)
const geoError = ref('')

const sortOptions = [
  { value: 'top', icon: '⭐', key: 'sort_top' },
  { value: 'recent', icon: '🕒', key: 'sort_recent' },
  { value: 'nearest', icon: '📍', key: 'sort_nearest' },
]

const LIMIT = 20
const totalPages = computed(() => Math.ceil(total.value / LIMIT) || 1)

function getCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error(t('search.geo_error'))); return }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => reject(new Error(t('search.geo_error'))),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}

async function setSort(value) {
  if (value === sortBy.value || geoLoading.value) return
  geoError.value = ''
  if (value === 'nearest' && !coords.value) {
    geoLoading.value = true
    try {
      coords.value = await getCoords()
    } catch (e) {
      geoError.value = e.message
      return
    } finally {
      geoLoading.value = false
    }
  }
  sortBy.value = value
}

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
      sort: sortBy.value,
      near: sortBy.value === 'nearest' && coords.value
        ? `${coords.value.lat},${coords.value.lon}`
        : undefined,
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
watch(sortBy, () => { page.value = 1; runFetch(1) })

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
.cat-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }

.results-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;  /* sort left, count centered to the list below */
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.sort-segment { justify-self: start; }
.results-count { grid-column: 2; margin: 0; text-align: center; }

@media (max-width: 640px) {
  .results-bar { grid-template-columns: 1fr; justify-items: center; gap: 14px; }
  .sort-segment { justify-self: center; }
  .results-count { grid-column: auto; }
}

.sort-segment {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
}
.sort-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  font-size: 0.82rem; font-weight: 600;
  color: var(--text-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--transition), background var(--transition), box-shadow var(--transition);
}
.sort-btn:hover:not(.active):not(:disabled) { color: var(--text); }
.sort-btn.active {
  background: var(--surface);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.sort-btn:disabled { cursor: wait; opacity: 0.7; }
.sort-icon { font-size: 0.9rem; line-height: 1; }

.geo-error {
  margin: -12px 0 20px;
  font-size: 0.82rem;
  color: #dc2626;
}

.place-row-list { display: flex; flex-direction: column; gap: 20px; }
.empty-state {
  text-align: center; padding: 80px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  color: var(--text-2);
}
.empty-icon { font-size: 3rem; }
</style>
