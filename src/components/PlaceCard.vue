<template>
  <RouterLink :to="`/place/${place.id}`" class="place-card card">
    <div class="card-image-wrap">
      <img :src="place.images[0]" :alt="placeName" class="card-image" loading="lazy" />
      <div class="card-category-badge">
        <span>{{ categoryIcon }}</span>
        {{ t(`categories.${place.category}`) }}
      </div>
      <div
        class="card-open-badge"
        :class="place.isOpen === true ? 'open' : place.isOpen === false ? 'closed' : 'unknown'"
      >
        {{ place.isOpen === true ? t('place.open_now') : place.isOpen === false ? t('place.closed') : '?' }}
      </div>
    </div>
    <div class="card-body">
      <div class="card-name-row">
        <img v-if="place.logo" :src="place.logo" :alt="placeName" class="card-logo" />
        <h3 class="card-name">{{ placeName }}</h3>
      </div>
      <div class="card-rating">
        <StarRating :rating="place.rating" :size="16" />
        <span class="rating-value">{{ place.rating.toFixed(1) }}</span>
        <span class="review-count">({{ place.reviewCount }} {{ t('common.reviews_count') }})</span>
      </div>
      <p class="card-address">
        <span class="icon">📍</span> {{ placeAddress }}
      </p>
      <p class="card-desc">{{ placeDesc }}</p>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { t, i18nState } from '../i18n/index.js'
import StarRating from './StarRating.vue'

const props = defineProps({
  place: { type: Object, required: true },
})

const categoryIcons = {
  restaurants: '🍽️',
  auto: '🚗',
  health: '🏥',
  activities: '🏔️',
  sports: '⚽',
  tabiat: '🌿',
}

const placeName = computed(() => props.place.name[i18nState.locale] || props.place.name.en)
const placeAddress = computed(() => props.place.address[i18nState.locale] || props.place.address.en)
const placeDesc = computed(() => {
  const desc = props.place.description[i18nState.locale] || props.place.description.en
  return desc.length > 90 ? desc.substring(0, 90) + '…' : desc
})
const categoryIcon = computed(() => categoryIcons[props.place.category] || '📍')
</script>

<style scoped>
.place-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.card-image-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.place-card:hover .card-image { transform: scale(1.05); }

.card-category-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-open-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.card-open-badge.open    { background: rgba(34, 197, 94, 0.9);  color: #fff; }
.card-open-badge.closed  { background: rgba(239, 68, 68, 0.9);  color: #fff; }
.card-open-badge.unknown { background: rgba(107, 114, 128, 0.7); color: #fff; }

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-logo {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.card-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
}

.stars { color: var(--accent); letter-spacing: 1px; }
.rating-value { font-weight: 700; color: var(--text); }
.review-count { color: var(--text-3); font-size: 0.8rem; }

.card-address {
  font-size: 0.8rem;
  color: var(--text-2);
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.card-desc {
  font-size: 0.82rem;
  color: var(--text-2);
  line-height: 1.5;
}

.icon { flex-shrink: 0; }
</style>
