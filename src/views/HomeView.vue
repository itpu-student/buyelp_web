<template>
  <div>
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <img src="/home_bg.jpeg" alt="Do'stlar bilan vaqt o'tkazish" class="hero-image" />
      </div>
      <div class="container hero-content">
        <div class="hero-text">
          <div class="hero-eyebrow">🤝 Do'stlar, oila, hamkasblar bilan birga bo'ling</div>
          <h1 class="hero-title">
            {{ t('home.hero_title') }}<br />
            <span class="hero-title-accent">{{ t('home.hero_subtitle') }}</span>
          </h1>
          <p class="hero-desc">{{ t('home.hero_desc') }}</p>

          <div class="hero-search">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                :placeholder="t('home.hero_search_placeholder')"
                class="search-input"
                @keydown.enter="goSearch"
              />
              <button class="btn btn-primary search-btn" @click="goSearch">
                {{ t('home.hero_cta') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.categories_title') }}</h2>
        </div>
        <div class="categories-grid">
          <RouterLink
            v-for="cat in categoryCards"
            :key="cat.slug"
            :to="`/search?category=${cat.slug}`"
            class="category-card"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-label">{{ cat.label }}</span>
          </RouterLink>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.featured_title') }}</h2>
          <RouterLink to="/search" class="see-all-link">{{ t('home.see_all') }} →</RouterLink>
        </div>
        <div v-if="loading" class="loading-state">Loading…</div>
        <div v-else-if="loadError" class="error-state">{{ loadError }}</div>
        <div v-else-if="featured.length" class="grid-3">
          <PlaceCard v-for="place in featured" :key="place.id" :place="place" />
        </div>
        <p v-else class="text-muted text-sm">No places yet.</p>
      </section>

      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.toprated_title') }}</h2>
          <RouterLink to="/search" class="see-all-link">{{ t('home.see_all') }} →</RouterLink>
        </div>
        <div v-if="loading" class="loading-state">Loading…</div>
        <div v-else-if="topRated.length" class="top-rated-list">
          <RouterLink
            v-for="(place, idx) in topRated"
            :key="place.id"
            :to="`/place/${place.id}`"
            class="top-item card"
          >
            <span class="top-rank">#{{ idx + 1 }}</span>
            <img v-if="place.images[0]" :src="place.images[0]" :alt="place.name.en" class="top-image" />
            <div v-else class="top-image top-image-ph"></div>
            <div class="top-info">
              <span class="top-name">{{ place.name[locale.locale] || place.name.en }}</span>
              <span class="top-addr">{{ place.address[locale.locale] || place.address.en }}</span>
            </div>
            <div class="top-rating">
              <StarRating :rating="place.rating" :size="16" />
              <span class="rating-val">{{ place.rating.toFixed(1) }}</span>
            </div>
          </RouterLink>
        </div>
        <p v-else-if="!loadError" class="text-muted text-sm">No rated places yet.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { t, i18nState } from '../i18n/index.js'
import { listPlaces } from '../api/places.js'
import { normalizePlace } from '../api/normalize.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'
import PlaceCard from '../components/PlaceCard.vue'
import StarRating from '../components/StarRating.vue'

const router = useRouter()
const locale = i18nState
const searchQuery = ref('')

const featured = ref([])
const topRated = ref([])
const loading = ref(true)
const loadError = ref('')

function goSearch() {
  router.push({ path: '/search', query: searchQuery.value ? { q: searchQuery.value } : {} })
}

const categoryIcons = {
  restaurants: '🍽️', auto: '🚗', health: '🏥',
  activities: '🏔️', sports: '⚽', tabiat: '🌿',
}

const categoryCards = computed(() =>
  categoriesState.list.map((c) => ({
    slug: c.slug,
    icon: categoryIcons[c.slug] || '📍',
    label: c.name?.[locale.locale] || c.name?.en || c.slug,
  }))
)

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    await ensureCategoriesLoaded()
    const [top, rec] = await Promise.all([
      listPlaces({ sort: 'top', limit: 6 }),
      listPlaces({ sort: 'top', limit: 5 }),
    ])
    featured.value = (top.items || []).map(normalizePlace)
    topRated.value = (rec.items || []).map(normalizePlace)
  } catch (e) {
    loadError.value = e.message || 'Failed to load places'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  min-height: 600px;
  max-height: 800px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }
.hero-image { width: 100%; height: 100%; object-fit: cover; }
.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(3,7,18,0.88) 0%, rgba(3,7,18,0.65) 50%, rgba(3,7,18,0.3) 100%);
  z-index: 1;
}
.hero-content { position: relative; z-index: 2; padding-top: var(--nav-height); }
.hero-text { max-width: 620px; display: flex; flex-direction: column; gap: 20px; }
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.85rem; font-weight: 600; color: var(--accent);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.hero-title { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; line-height: 1.15; color: #fff; }
.hero-title-accent { color: var(--primary-light); }
.hero-desc { font-size: 1.05rem; color: rgba(255,255,255,0.75); line-height: 1.7; max-width: 480px; }
.hero-search { margin-top: 8px; }
.search-box {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  padding: 6px 6px 6px 18px;
}
.search-icon { font-size: 1.1rem; flex-shrink: 0; }
.search-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #fff; font-size: 0.95rem; min-width: 0;
}
.search-input::placeholder { color: rgba(255,255,255,0.5); }
.search-btn { flex-shrink: 0; }

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}
.category-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px 12px;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--border);
  background: var(--surface);
  transition: all 0.25s ease;
  cursor: pointer;
  text-align: center;
}
.category-card:hover {
  border-color: var(--primary);
  background: rgba(13,148,136,0.05);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.cat-icon { font-size: 2rem; }
.cat-label { font-size: 0.82rem; font-weight: 600; color: var(--text); }

.top-rated-list { display: flex; flex-direction: column; gap: 12px; }
.top-item {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  text-decoration: none; color: inherit;
  transition: all var(--transition);
}
.top-item:hover { transform: translateX(4px); box-shadow: var(--shadow-md); }
.top-rank { font-size: 1.1rem; font-weight: 800; color: var(--primary); min-width: 32px; }
.top-image {
  width: 52px; height: 52px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}
.top-image-ph { background: var(--surface-2); }
.top-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.top-name {
  font-weight: 600; font-size: 0.95rem; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.top-addr {
  font-size: 0.8rem; color: var(--text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.top-rating { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.rating-val { font-weight: 700; font-size: 0.95rem; }

.loading-state, .error-state {
  padding: 40px 16px;
  text-align: center;
  color: var(--text-2);
  font-size: 0.9rem;
}
.error-state { color: #dc2626; }

@media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 640px)  { .categories-grid { grid-template-columns: repeat(2, 1fr); } .search-btn span { display: none; } }
</style>
