<template>
  <div class="page-content">
    <div v-if="!place" class="place-container not-found">
      <h2>Place not found</h2>
      <RouterLink to="/search" class="btn btn-primary mt-4">Back to Search</RouterLink>
    </div>

    <template v-else>
      <div class="place-header-wrap">
        <div v-if="galleryImages.length" class="carousel-outer">
          <div ref="carouselViewportRef" class="carousel-viewport" role="region" aria-label="Place photos">
            <div class="carousel__track" :style="galleryTrackStyle">
              <div
                v-for="(src, i) in galleryImages"
                :key="i"
                class="carousel__slide"
                :style="{ width: `${gallerySlideWidthPx}px` }"
              >
                <img :src="src" :alt="`${placeName} — ${i + 1}`" class="carousel__img" loading="lazy" />
              </div>
            </div>

            <template v-if="galleryMaxStart > 0">
              <button
                type="button"
                class="carousel__btn carousel__btn--prev"
                aria-label="Previous photo"
                @click="galleryPrev"
              >
                &#8592;
              </button>
              <button
                type="button"
                class="carousel__btn carousel__btn--next"
                aria-label="Next photo"
                @click="galleryNext"
              >
                &#8594;
              </button>
              <div class="carousel__dots">
                <button
                  v-for="i in galleryDotCount"
                  :key="i - 1"
                  type="button"
                  class="carousel__dot"
                  :class="{ 'carousel__dot--active': i - 1 === galleryStartIndex }"
                  :aria-label="`Photo position ${i}`"
                  @click="galleryStartIndex = i - 1"
                />
              </div>
            </template>
          </div>
        </div>

        <div v-else class="carousel-placeholder">No photos</div>

        <div class="place-container place-header-inner">
          <!-- <RouterLink to="/search" class="back-link">← {{ t("common.back") }}</RouterLink> -->

          <div class="place-title-block">
            <h1 class="place-title">{{ placeName }}</h1>
            <div class="place-title-meta">
              <span class="cat-pill">{{ categoryIcon }} {{ t(`categories.${place.category}`) }}</span>
            </div>
            <div class="place-rating-row">
              <StarRating :rating="place.rating" :size="22" />
              <span class="rating-num">{{ place.rating.toFixed(1) }}</span>
              <span class="review-count">({{ place.reviewCount }} {{ t("common.reviews_count") }})</span>
              <span class="meta-dot" aria-hidden="true">·</span>
              <span class="status-pill" :class="place.isOpen ? 'open' : 'closed'">
                {{ place.isOpen ? t("place.open_now") : t("place.closed") }}
              </span>
              <span class="meta-dot" aria-hidden="true">·</span>
              <span class="today-line">
                <span class="today-label">{{ t("place.today_hours") }}:</span>
                {{ todayHoursDisplay }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="place-container place-body">
        <div class="place-grid">
          <div class="place-main">
            <section class="info-section">
              <div class="section-title-row">
                <h2 class="section-title">{{ t("place.reviews") }}</h2>
                <ReviewInput v-if="store.isLoggedIn" @submit="handleReviewSubmit" />
              </div>

              <div v-if="reviewSubmitted" class="submitted-msg">
                ✅ Review submitted! (Demo mode — not persisted)
              </div>
              <div v-if="!store.isLoggedIn" class="review-login-nudge">
                <p>
                  <RouterLink to="/login" class="text-primary font-semibold">{{ t("auth.signin_link") }}</RouterLink>
                  to write a review.
                </p>
              </div>

              <div v-if="place.reviews.length" class="reviews-list">
                <ReviewCard v-for="r in allReviews" :key="r.id" :review="r" />
              </div>
              <p v-else class="text-muted text-sm">{{ t("place.no_reviews") }}</p>
            </section>
          </div>

          <aside class="place-sidebar">
            <div class="sidebar-card card">
              <div class="sidebar-rating">
                <StarRating :rating="place.rating" :size="20" />
                <span class="rating-num">{{ place.rating.toFixed(1) }}</span>
                <span class="review-count">({{ place.reviewCount }} {{ t("common.reviews_count") }})</span>
                <ReviewInput v-if="store.isLoggedIn" class="sidebar-review-input" @submit="handleReviewSubmit" />
              </div>
              <div class="divider-sidebar"></div>

              <div v-if="placeDesc" class="sidebar-desc">
                {{ placeDesc }}
              </div>
              <div v-if="placeDesc" class="divider-sidebar"></div>

              <a :href="telHref" class="sidebar-line is-link">
                <span class="side-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    />
                  </svg>
                </span>
                <span class="side-text">{{ place.phone }}</span>
              </a>

              <a
                :href="mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="sidebar-line is-link"
                :aria-label="t('place.directions')"
              >
                <span class="side-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span class="side-text address-multiline">{{ placeAddress }}</span>
              </a>

              <SidebarHours :place="place" />
              
              <div class="sidebar-map-wrap">
                <SvgMapItem
                  :lat="place.lat ?? null"
                  :lon="place.lon ?? null"
                  svgSrc="/Tashkent_map_with_captions.svg"
                  :show-coords="false"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue"
import { useRoute } from "vue-router"
import { t, i18nState } from "../i18n/index.js"
import { getPlaceById, resolveTodayHours } from "../data/places.js"
import { store } from "../store/index.js"
import ReviewCard from "../components/ReviewCard.vue"
import ReviewInput from "../components/ReviewInput.vue"
import StarRating from "../components/StarRating.vue"
import SidebarHours from "../components/SidebarHours.vue"
import SvgMapItem from "../components/SvgMapItem.vue"

const route = useRoute()
const place = computed(() => getPlaceById(route.params.id))

const reviewSubmitted = ref(false)
const extraReviews = ref([])

const carouselViewportRef = ref(null)
const viewportWidth = ref(0)
/** Leftmost visible image index (Yelp-style strip). */
const galleryStartIndex = ref(0)

/** Min width per visible tile; viewport splits evenly with no gaps (flush strip, like PlaceRow / Instagram). */
const GALLERY_MIN_SLIDE = 196
const GALLERY_MAX_VISIBLE = 4

let galleryResizeObserver = null

const locale = i18nState
const placeName = computed(() => {
  const p = place.value
  return p?.name[locale.locale] || p?.name.en
})
const placeAddress = computed(() => {
  const p = place.value
  return p?.address[locale.locale] || p?.address.en
})
const placeDesc = computed(() => {
  const p = place.value
  return p?.description[locale.locale] || p?.description.en
})

const galleryImages = computed(() => place.value?.images?.filter(Boolean) || [])

const galleryVisibleCount = computed(() => {
  const n = galleryImages.value.length
  const w = viewportWidth.value
  if (!n) return 1
  if (!w) return 1
  const raw = Math.floor(w / GALLERY_MIN_SLIDE)
  const v = Math.max(1, Math.min(GALLERY_MAX_VISIBLE, raw || 1, n))
  return v
})

const gallerySlideWidthPx = computed(() => {
  const w = viewportWidth.value
  const v = galleryVisibleCount.value
  if (!w || v < 1) return 280
  return w / v
})

const galleryMaxStart = computed(() =>
  Math.max(0, galleryImages.value.length - galleryVisibleCount.value)
)

const galleryDotCount = computed(() => galleryMaxStart.value + 1)

const galleryTrackStyle = computed(() => ({
  transform: `translateX(-${galleryStartIndex.value * gallerySlideWidthPx.value}px)`,
  transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
}))

const telHref = computed(() => {
  const raw = place.value?.phone || ""
  return `tel:${raw.replace(/\s/g, "")}`
})

const mapsUrl = computed(() => {
  const p = place.value
  if (!p) return "#"
  const q = encodeURIComponent(placeAddress.value || "")
  if (p.lat != null && p.lon != null) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${q}`
})

const categoryIcons = {
  restaurants: "🍽️",
  auto: "🚗",
  health: "🏥",
  activities: "🏔️",
  sports: "⚽",
  tabiat: "🌿",
}
const categoryIcon = computed(() => categoryIcons[place.value?.category] || "📍")

const allReviews = computed(() => [...(place.value?.reviews || []), ...extraReviews.value])

const todayHoursDisplay = computed(() => {
  const line = resolveTodayHours(place.value)
  return line ?? t("place.hours_unknown")
})

function measureGalleryViewport() {
  const el = carouselViewportRef.value
  viewportWidth.value = el ? el.clientWidth : 0
}

/** Number of scroll positions (wraps: last ↔ first). */
function galleryPositionCount() {
  return galleryMaxStart.value + 1
}

function galleryPrev() {
  const n = galleryPositionCount()
  if (n <= 1) return
  galleryStartIndex.value = (galleryStartIndex.value - 1 + n) % n
}

function galleryNext() {
  const n = galleryPositionCount()
  if (n <= 1) return
  galleryStartIndex.value = (galleryStartIndex.value + 1) % n
}

watch(galleryMaxStart, (max) => {
  if (galleryStartIndex.value > max) galleryStartIndex.value = max
})

watch(
  () => route.params.id,
  () => {
    galleryStartIndex.value = 0
    nextTick(measureGalleryViewport)
  }
)

onMounted(() => {
  nextTick(() => {
    measureGalleryViewport()
    const el = carouselViewportRef.value
    if (el && typeof ResizeObserver !== "undefined") {
      galleryResizeObserver = new ResizeObserver(() => measureGalleryViewport())
      galleryResizeObserver.observe(el)
    }
  })
})

onBeforeUnmount(() => {
  galleryResizeObserver?.disconnect()
  galleryResizeObserver = null
})

function handleReviewSubmit(payload) {
  extraReviews.value.unshift({
    id: `new-${Date.now()}`,
    author: store.user?.name || "You",
    rating: payload.rating,
    text: payload.text,
    date: new Date().toISOString().split("T")[0],
  })
  reviewSubmitted.value = true
  setTimeout(() => (reviewSubmitted.value = false), 3000)
}
</script>

<style scoped>

.place-container {
  width: 100%;
  max-width: 90%;
  margin: 0 auto;
  padding: 0 24px;
}


.place-header-wrap {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.place-header-inner {
  padding-top: 20px;
  padding-bottom: 20px;
}

.back-link {
  display: inline-block;
  color: var(--text-2);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 16px;
  transition: color var(--transition);
}

.back-link:hover {
  color: var(--primary);
}

.place-title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
  margin-bottom: 8px;
}

.cat-pill {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 12px;
}

.place-rating-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  font-size: 0.9rem;
  color: var(--text-2);
}

.rating-num {
  font-weight: 800;
  color: var(--text);
}

.review-count {
  color: var(--text-3);
}

.meta-dot {
  color: var(--text-3);
  user-select: none;
}

.status-pill.open {
  color: #16a34a;
  font-weight: 700;
}

.status-pill.closed {
  color: #dc2626;
  font-weight: 700;
}

.today-line {
  color: var(--text-2);
}

.today-label {
  font-weight: 600;
  color: var(--text);
}

/* Carousel — full-bleed left/right (like PlaceView_new.vue photo-carousel-wrapper) */
.carousel-outer {
  width: 100%;
  max-width: none;
  margin-inline: 0;
  padding-inline: 0;
  padding-top: 12px;
  padding-bottom: 16px;
}

.carousel-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: 0;
  background: var(--surface-2);
}

.carousel__track {
  display: flex;
  width: max-content;
  height: 100%;
  will-change: transform;
}

.carousel__slide {
  flex: 0 0 auto;
  flex-shrink: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--border);
}

.carousel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel__btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
  border: none;
  cursor: pointer;
  line-height: 1;
}

.carousel__btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel__btn--prev {
  left: 10px;
}

.carousel__btn--next {
  right: 10px;
}

.carousel__dots {
  position: absolute;
  bottom: 10px;
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
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.carousel__dot--active {
  background: #fff;
  transform: scale(1.3);
}

.carousel-placeholder {
  width: 100%;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-3);
}

/* Body */
.place-body {
  padding-top: 32px;
  padding-bottom: 80px;
}

.place-grid {
  display: grid;
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  gap: 40px;
  align-items: start;
}

.info-section {
  margin-bottom: 32px;
}

.sidebar-desc {
  color: var(--text-2);
  line-height: 1.6;
  font-size: 0.95rem;
  padding-bottom: 4px;
}

.divider-sidebar {
  height: 1px;
  background: var(--border-light);
  margin: 8px 0 12px;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-right: 8px;
  margin-bottom: 12px;
}

.sidebar-review-input {
  margin-left: auto;
  padding-right: 4px;
}

.submitted-msg {
  font-size: 0.875rem;
  color: #16a34a;
  font-weight: 500;
}

.review-login-nudge {
  margin: 16px 0;
  font-size: 0.9rem;
  color: var(--text-2);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

/* Sidebar */
.place-sidebar {
  position: sticky;
  top: calc(var(--nav-height) + 20px);
}

.sidebar-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.sidebar-rating {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  font-size: 0.9rem;
  color: var(--text-2);
  padding-bottom: 4px;
}

.sidebar-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-light);
}

.sidebar-line:last-of-type {
  border-bottom: none;
}

.sidebar-line.is-link {
  text-decoration: none;
  color: inherit;
  transition: background var(--transition);
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: var(--radius-sm);
}

.sidebar-line.is-link:hover {
  background: var(--surface-2);
}

.side-icon {
  flex-shrink: 0;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.side-icon.sm {
  margin-top: 0;
}

.side-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  line-height: 1.45;
}

.sidebar-line.is-link .side-text {
  color: var(--primary);
  font-weight: 600;
}

.address-multiline {
  color: var(--text);
  font-weight: 500;
}

.sidebar-map-wrap {
  margin-top: 16px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.not-found {
  text-align: center;
  padding: 80px 0;
}

@media (max-width: 900px) {
  .place-grid {
    grid-template-columns: 1fr;
  }

  .place-sidebar {
    position: static;
  }

  .carousel__btn {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
  }

  .carousel__btn--prev {
    left: 6px;
  }

  .carousel__btn--next {
    right: 6px;
  }
}
</style>
