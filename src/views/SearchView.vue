<template>
  <div class="page-content">
    <div class="container">
      <div class="search-page-header">
        <h1 class="section-title">{{ t('search.title') }}</h1>
        <p class="text-muted text-sm mt-2">
          {{ filteredPlaces.length }} {{ filteredPlaces.length === 1 ? 'place' : 'places' }} found
        </p>
      </div>

      <!-- Search + filter bar -->
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

      <!-- Category chips -->
      <div class="cat-chips">
        <button
          v-for="cat in allCategories"
          :key="cat.key"
          class="chip"
          :class="{ active: selectedCategory === cat.key }"
          @click="selectedCategory = cat.key"
        >
          {{ cat.icon }} {{ t(`categories.${cat.key}`) }}
        </button>
      </div>

      <!-- Results — row layout: carousel | info | map -->
      <div v-if="filteredPlaces.length" class="place-row-list">
        <PlaceRow
          v-for="place in filteredPlaces"
          :key="place.id"
          :place="place"
        />
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon">🔍</span>
        <h3>{{ t('search.no_results') }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '../i18n/index.js'
import { searchPlaces } from '../data/places.js'
import PlaceRow from '../components/PlaceRow.vue'

const route = useRoute()
const query = ref('')
const selectedCategory = ref('all')

onMounted(() => {
  if (route.query.q) query.value = route.query.q
  if (route.query.category) selectedCategory.value = route.query.category
})

const allCategories = [
  { key: 'all', icon: '🗺️' },
  { key: 'restaurants', icon: '🍽️' },
  { key: 'auto', icon: '🚗' },
  { key: 'health', icon: '🏥' },
  { key: 'activities', icon: '🏔️' },
  { key: 'sports', icon: '⚽' },
  { key: 'tabiat', icon: '🌿' },
]

const filteredPlaces = computed(() =>
  searchPlaces(query.value, selectedCategory.value)
)
</script>

<style scoped>
.search-page-header { margin-bottom: 24px; }

.search-bar-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.s-icon {
  position: absolute;
  left: 14px;
  font-size: 1rem;
  pointer-events: none;
}

.s-input {
  padding-left: 40px;
  padding-right: 36px;
}

.clear-btn {
  position: absolute;
  right: 12px;
  color: var(--text-3);
  font-size: 0.85rem;
  transition: color var(--transition);
}

.clear-btn:hover { color: var(--text); }

.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}

.place-row-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-2);
}

.empty-icon { font-size: 3rem; }
</style>
