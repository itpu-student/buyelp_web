<template>
  <article class="place-row" :class="{ 'place-row--closed': !place.isOpen }">
    <!-- ① Carousel of images -->
    <RouterLink :to="`/place/${place.id}`" class="place-row__carousel">
      <!-- Sliding track: all images in a row, translated to show the active one -->
      <div
        class="carousel__track"
        :style="{ transform: `translateX(-${activeSlide * 100}%)` }"
      >
        <div
          v-for="(img, i) in images"
          :key="i"
          class="carousel__slide"
        >
          <img :src="img" :alt="`${placeName} photo ${i + 1}`" loading="lazy" />
        </div>
      </div>

      <!-- Nav arrows (only when >1 image) -->
      <template v-if="images.length > 1">
        <button
          class="carousel__btn carousel__btn--prev"
          aria-label="Previous photo"
          @click.prevent.stop="prev"
        >&#8592;</button>
        <button
          class="carousel__btn carousel__btn--next"
          aria-label="Next photo"
          @click.prevent.stop="next"
        >&#8594;</button>

        <!-- Dots -->
        <div class="carousel__dots">
          <button
            v-for="(_, i) in images"
            :key="i"
            class="carousel__dot"
            :class="{ 'carousel__dot--active': i === activeSlide }"
            :aria-label="`Photo ${i + 1}`"
            @click.prevent.stop="activeSlide = i"
          />
        </div>
      </template>
    </RouterLink>

    <!-- ② Text / info panel -->
    <RouterLink :to="`/place/${place.id}`" class="place-row__info">
      <div class="place-row__info-inner">
        <div class="place-row__header">
          <h3 class="place-row__name">{{ placeName }}</h3>
          <div class="place-row__rating">
            <StarRating :rating="place.rating" :size="15" />
            <span class="place-row__rating-val">{{ place.rating.toFixed(1) }}</span>
            <span class="place-row__review-count">({{ place.reviewCount }} {{ t('common.reviews_count') }})</span>
          </div>
        </div>

        <!-- Status + Category tags -->
        <div class="place-row__tags">
          <span
            class="place-row__tag place-row__tag--status"
            :class="place.isOpen ? 'open' : 'closed'"
          >
            {{ place.isOpen ? t('place.open_now') : t('place.closed') }}
          </span>
          <span class="place-row__tag place-row__tag--category">
            {{ categoryIcon }} {{ t(`categories.${place.category}`) }}
          </span>
        </div>

        <p class="place-row__address">
          <span class="place-row__icon">📍</span>
          {{ placeAddress }}
        </p>

        <p class="place-row__desc">{{ placeDesc }}</p>

        <div class="place-row__meta">
          <span class="place-row__meta-item">
            <span class="place-row__icon">🕐</span>
            {{ hoursSummary }}
          </span>
          <span v-if="place.phone" class="place-row__meta-item">
            <span class="place-row__icon">📞</span>
            {{ place.phone }}
          </span>
        </div>


      </div>
    </RouterLink>

    <!-- ③ SVG map with marker -->
    <div class="place-row__map">
      <SvgMapItem
        :lat="place.lat ?? null"
        :lon="place.lon ?? null"
        :svgSrc="mapSrc"
        :show-coords="true"
      />
      <div v-if="place.lat == null" class="place-row__map-placeholder">
        <span>🗺️</span>
        <span>Map coming soon</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { t, i18nState } from '../i18n/index.js'
import { resolveTodayHours } from '../data/places.js'
import StarRating from './StarRating.vue'
import SvgMapItem from './SvgMapItem.vue'

const props = defineProps({
  place: { type: Object, required: true },

  /** SVG map source (can be overridden to make it dynamic per-place in the future). */
  mapSrc: {
    type: String,
    default: '/Tashkent_map_with_captions.svg',
  },
})

// ─── Localized computed text ──────────────────────────────────────────────────
const placeName = computed(() => props.place.name[i18nState.locale] || props.place.name.en)
const placeAddress = computed(() => props.place.address[i18nState.locale] || props.place.address.en)
const placeDesc = computed(() => props.place.description[i18nState.locale] || props.place.description.en)

// ─── Category icons ───────────────────────────────────────────────────────────
const categoryIcons = {
  restaurants: '🍽️', auto: '🚗', health: '🏥',
  activities: '🏔️', sports: '⚽', tabiat: '🌿',
}
const categoryIcon = computed(() => categoryIcons[props.place.category] || '📍')

const hoursSummary = computed(() => resolveTodayHours(props.place) ?? t('place.hours_unknown'))

// ─── Carousel ─────────────────────────────────────────────────────────────────
/**
 * Build an images array from place data.
 * Currently places only have one `image` field, but the data model
 * may later gain an `images[]` array – this handles both.
 */
const images = computed(() => props.place.images ?? [])

const activeSlide = ref(0)

function next() {
  activeSlide.value = (activeSlide.value + 1) % images.value.length
}
function prev() {
  activeSlide.value = (activeSlide.value - 1 + images.value.length) % images.value.length
}
</script>

<style scoped>
/* ─── Row container ──────────────────────────────────────────────────────────── */
.place-row {
  display: grid;
  grid-template-columns: 280px 1fr 220px;
  grid-template-rows: 240px; /* fixed row height — all items identical */
  gap: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease;
  height: 240px;
}

.place-row:hover {
  box-shadow:
    -6px 0 20px rgba(0, 0, 0, 0.08),
    -16px 0 48px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.04);
}

[data-theme="dark"] .place-row:hover {
  box-shadow:
    -6px 0 24px rgba(200, 200, 200, 0.08),
    -16px 0 48px rgba(180, 180, 180, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.place-row--closed {
  opacity: 0.85;
}

/* ─── ① Carousel ─────────────────────────────────────────────────────────────── */
.place-row__carousel {
  position: relative;
  display: block;
  height: 240px; /* matches row fixed height */
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

/* Sliding track — all slides in one horizontal row */
.carousel__track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.38s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.carousel__slide {
  flex: 0 0 100%;
  width: 100%;
  height: 240px;
}

.carousel__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* (carousel badges removed — info now shown in panel) */

/* Arrow buttons */
.carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
  border: none;
  cursor: pointer;
  line-height: 1;
}

.carousel__btn:hover { background: rgba(0, 0, 0, 0.7); }
.carousel__btn--prev { left: 8px; }
.carousel__btn--next { right: 8px; }

/* Dots */
.carousel__dots {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 5px;
  z-index: 3;
}

.carousel__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  transition: background var(--transition), transform var(--transition);
}

.carousel__dot--active {
  background: #fff;
  transform: scale(1.3);
}

/* ─── ② Info panel ───────────────────────────────────────────────────────────── */
.place-row__info {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  transition: background var(--transition);
}

.place-row__info:hover {
  background: var(--surface-1a);
}

.place-row__info-inner {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.place-row__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.place-row__name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.place-row__rating {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.place-row__rating-val {
  font-weight: 700;
  color: var(--text);
}

.place-row__review-count {
  color: var(--text-3);
  font-size: 0.78rem;
}

.place-row__address {
  font-size: 0.8rem;
  color: var(--text-2);
  display: flex;
  align-items: flex-start;
  gap: 5px;
  line-height: 1.4;
}

.place-row__desc {
  font-size: 0.82rem;
  color: var(--text-2);
  line-height: 1.55;
  /* always exactly 1 line with ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.place-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
}

.place-row__meta-item {
  font-size: 0.78rem;
  color: var(--text-2);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Status + Category tags ── */
.place-row__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.place-row__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
}

.place-row__tag--status.open   { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.place-row__tag--status.closed { background: rgba(239, 68, 68,  0.15); color: #dc2626; }

.place-row__tag--category {
  background: var(--surface-2);
  color: var(--text-2);
  border: 1px solid var(--border);
}

.place-row__icon {
  flex-shrink: 0;
}

/* ─── ③ Map panel ────────────────────────────────────────────────────────────── */
.place-row__map {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 220px;
  padding: 12px;
  background: var(--surface-2);
}

.place-row__map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-3);
  font-size: 0.78rem;
  pointer-events: none;
}

.place-row__map-placeholder span:first-child {
  font-size: 2rem;
}

/* ─── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .place-row {
    grid-template-columns: 240px 1fr 180px;
  }
}

@media (max-width: 768px) {
  .place-row {
    grid-template-columns: 1fr;
    grid-template-rows: 200px auto 180px;
  }

  .place-row__carousel {
    min-height: 200px;
  }

  .place-row__info {
    border-left: none;
    border-right: none;
    border-top: 1px solid var(--border);
  }

  .place-row__map {
    border-top: 1px solid var(--border);
    min-height: 180px;
  }
}

@media (max-width: 480px) {
  .place-row {
    grid-template-rows: 180px auto 160px;
  }
}
</style>
