<template>
  <div class="review-card" role="button" tabindex="0" :style="review.latest === false ? { background: '#101726' } : {}" @click="$emit('open', review)" @keydown.enter="$emit('open', review)">
    <span v-if="review.latest != null" class="latest-badge" :class="review.latest ? 'latest-badge--yes' : 'latest-badge--no'">
      {{ review.latest ? t('review.latest') : t('review.not_latest') }}
    </span>
    <!-- Place info row (profile/user context) -->
    <RouterLink
      v-if="showPlace && review.place"
      :to="`/place/${review.place.id}`"
      class="place-info"
      @click.stop
    >
      <img
        v-if="review.place.logo"
        :src="review.place.logo"
        :alt="review.place.name.en"
        class="place-logo"
      />
      <div v-else class="place-logo place-logo--empty">
        {{ categoriesState.byId[review.place._categoryId]?.emoji || '📍' }}
      </div>
      <div class="place-meta">
        <span class="place-name">{{ review.place.name.en }}</span>
        <span v-if="review.place.slug" class="place-slug">@{{ review.place.slug }}</span>
        <div class="place-stats">
          <span>⭐ {{ review.place.avgRating.toFixed(1) }}</span>
          <span>· {{ review.place.reviewCount }} {{ t('common.reviews_count') }}</span>
          <span v-if="categoriesState.byId[review.place._categoryId]">
            · {{ categoriesState.byId[review.place._categoryId].emoji }}
          </span>
        </div>
      </div>
    </RouterLink>

    <!-- Author row (place context) -->
    <div v-else class="review-header">
      <img
        :src="review.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=0D9488&color=fff&size=64`"
        :alt="review.author"
        class="avatar"
        width="40"
        height="40"
      />
      <div class="review-meta">
        <span class="author-name">{{ review.author }}<span v-if="review.authorUsername" class="author-username"> @{{ review.authorUsername }}</span></span>
        <div class="review-date-row">
          <span class="review-date">{{ formatDate(review.date) }}</span>
          <span v-if="review.prevCount > 0" class="edited-badge">{{ review.prevCount }}</span>
          <span v-if="review.priceRating" class="sub-rating">{{ t('review.price') }}: {{ review.priceRating }}</span>
          <span v-if="review.qualityRating" class="sub-rating">{{ t('review.quality') }}: {{ review.qualityRating }}</span>
        </div>
      </div>
      <StarRating :rating="review.rating" :size="15" mode="simple" />
      <button
        v-if="store.isLoggedIn && review._userId !== store.user?.id"
        type="button"
        class="report-btn"
        title="Report this review"
        @click.stop="$emit('report', review)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
      </button>
    </div>
    <div v-if="showPlace" class="place-rating-row">
      <StarRating :rating="review.rating" :size="15" mode="simple" />
      <span class="review-date">{{ formatDate(review.date) }}</span>
      <span v-if="review.prevCount > 0" class="edited-badge">{{ review.prevCount }}</span>
      <span v-if="review.priceRating" class="sub-rating">{{ t('review.price') }}: {{ review.priceRating }}</span>
      <span v-if="review.qualityRating" class="sub-rating">{{ t('review.quality') }}: {{ review.qualityRating }}</span>
    </div>
    <p class="review-text">{{ review.text }}</p>

    <!-- Review Images — small strip carousel -->
    <div v-if="reviewImages.length" class="review-carousel-outer">
      <div ref="viewportRef" class="carousel-viewport" role="region" aria-label="Review photos">
        <div class="carousel__track" :style="trackStyle">
          <div
            v-for="(src, i) in reviewImages"
            :key="i"
            class="carousel__slide"
            :style="{ width: `${slideWidthPx}px` }"
            @click.stop="openLightbox(i)"
          >
            <img :src="src" alt="Review photo" class="carousel__img" loading="lazy" />
            <div class="carousel__slide-overlay">
              
            </div>
          </div>
        </div>

        <template v-if="maxStart > 0">
          <button
            type="button"
            class="carousel__btn carousel__btn--prev"
            aria-label="Previous photo"
            @click.stop="prev"
          >
            &#8592;
          </button>
          <button
            type="button"
            class="carousel__btn carousel__btn--next"
            aria-label="Next photo"
            @click.stop="next"
          >
            &#8594;
          </button>
          <div class="carousel__dots">
            <button
              v-for="i in dotCount"
              :key="i - 1"
              type="button"
              class="carousel__dot"
              :class="{ 'carousel__dot--active': i - 1 === startIndex }"
              :aria-label="`Photo position ${i}`"
              @click.stop="startIndex = i - 1"
            />
          </div>
        </template>
      </div>
    </div>

    <img
      v-else-if="review.image"
      :src="review.image"
      alt=""
      class="review-photo"
      loading="lazy"
      @click.stop="openSingleLightbox"
    />
  </div>

  <ImageLightbox :images="lbImages" :start-index="lbStart" :open="lbOpen" @close="closeLightbox" />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import StarRating from './StarRating.vue'
import ImageLightbox from './ImageLightbox.vue'
import { store } from '../store/index.js'
import { categoriesState } from '../store/categories.js'
import { t } from '../i18n/index.js'

const props = defineProps({
  review: { type: Object, required: true },
  showPlace: { type: Boolean, default: false },
})

defineEmits(['open', 'report'])

// ─── Strip carousel ────────────────────────────────────────────────
const MIN_SLIDE = 110
const MAX_VISIBLE = 4

const viewportRef = ref(null)
const viewportWidth = ref(0)
const startIndex = ref(0)
let resizeObserver = null

const reviewImages = computed(() => (props.review.images || []).filter(Boolean))

const visibleCount = computed(() => {
  const n = reviewImages.value.length
  const w = viewportWidth.value
  if (!n || !w) return 1
  const raw = Math.floor(w / MIN_SLIDE)
  return Math.max(1, Math.min(MAX_VISIBLE, raw || 1, n))
})

const slideWidthPx = computed(() => {
  const w = viewportWidth.value
  const v = visibleCount.value
  if (!w || v < 1) return MIN_SLIDE
  return w / v
})

const maxStart = computed(() => Math.max(0, reviewImages.value.length - visibleCount.value))
const dotCount = computed(() => maxStart.value + 1)

const trackStyle = computed(() => ({
  transform: `translateX(-${startIndex.value * slideWidthPx.value}px)`,
  transition: 'transform 0.42s ease',
}))

function prev() {
  const n = maxStart.value + 1
  if (n <= 1) return
  startIndex.value = (startIndex.value - 1 + n) % n
}
function next() {
  const n = maxStart.value + 1
  if (n <= 1) return
  startIndex.value = (startIndex.value + 1) % n
}
function measureViewport() {
  const el = viewportRef.value
  viewportWidth.value = el ? el.clientWidth : 0
}
watch(maxStart, (max) => {
  if (startIndex.value > max) startIndex.value = max
})
onMounted(() => {
  nextTick(() => {
    measureViewport()
    const el = viewportRef.value
    if (el && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => measureViewport())
      resizeObserver.observe(el)
    }
  })
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (lbOpen.value) document.body.style.overflow = ''
})

// ─── Lightbox ──────────────────────────────────────────────────────
const lbImages = ref([])
const lbStart = ref(0)
const lbOpen = ref(false)

function openLightbox(i) {
  lbImages.value = reviewImages.value
  lbStart.value = i
  lbOpen.value = true
  document.body.style.overflow = 'hidden'
}

function openSingleLightbox() {
  if (!props.review.image) return
  lbImages.value = [props.review.image]
  lbStart.value = 0
  lbOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lbOpen.value = false
  document.body.style.overflow = ''
}

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.review-card {
  position: relative;
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.latest-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  pointer-events: none;
}
.latest-badge--yes {
  background: rgba(13, 148, 136, 0.12);
  color: var(--primary);
  border: 1px solid rgba(13, 148, 136, 0.3);
}
.latest-badge--no {
  background: rgba(255,255,255,0.05);
  color: var(--text-3);
  border: 1px solid var(--border);
}
/* card hover — signals "click opens modal" */
.review-card:not(:has(.place-info:hover)):hover {
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.1);
}

/* ── Place info row ── */
.place-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  padding: 6px 8px;
  margin: -6px -8px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: background var(--transition), border-color var(--transition);
}
/* place-info hover — signals "click navigates to place" */
.place-info:hover {
  background: rgba(13, 148, 136, 0.06);
  border-color: rgba(13, 148, 136, 0.25);
}
.place-info:hover .place-name { color: var(--primary); text-decoration: underline; }

.place-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.place-logo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  font-size: 1.2rem;
}

.place-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.place-name { font-weight: 700; font-size: 0.9rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.place-slug { font-size: 0.75rem; color: var(--text-3); }
.place-stats { font-size: 0.75rem; color: var(--text-3); display: flex; gap: 4px; flex-wrap: wrap; }

.place-rating-row { display: flex; align-items: center; gap: 8px; }


.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar { border-radius: 50%; flex-shrink: 0; object-fit: cover; }

.review-header { cursor: pointer; }
.review-header:hover .author-name { color: var(--primary); }

.review-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.author-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  transition: color var(--transition);
}
.author-username { font-weight: 400; color: var(--text-3); font-size: 0.82rem; }

.review-date-row { display: flex; align-items: center; gap: 6px; }

.review-date {
  font-size: 0.78rem;
  color: var(--text-3);
}

.edited-badge {
  font-size: 0.72rem;
  color: var(--text-3);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0 5px;
  line-height: 1.6;
}

.report-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: color var(--transition), background var(--transition);
}
.report-btn:hover { color: #dc2626; background: #fee2e2; }

.sub-rating { font-size: 0.78rem; color: var(--text-3); }

.review-text {
  font-size: 0.9rem;
  color: var(--text-2);
  line-height: 1.6;
}

.review-photo {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

/* ── Strip carousel ── */
.review-carousel-outer { width: 100%; }

.carousel-viewport {
  position: relative;
  overflow: hidden;
  width: 100%;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  border: 1px solid var(--border);
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
  height: 140px;
  overflow: hidden;
  background: var(--border);
  position: relative;
}

/* hover overlay hint */
.carousel__slide-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}
.carousel__slide:hover .carousel__slide-overlay {
  background: rgba(0,0,0,0.28);
}
.zoom-icon {
  color: #fff;
  font-size: 1.4rem;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.carousel__slide:hover .zoom-icon {
  opacity: 0;
  transform: scale(1);
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
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  line-height: 1;
}
.carousel__btn:hover { background: rgba(0,0,0,0.7); }
.carousel__btn--prev { left: 8px; }
.carousel__btn--next { right: 8px; }

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
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 0;
  transition: background 0.12s ease, transform 0.12s ease;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}
.carousel__dot--active {
  background: #fff;
  transform: scale(1.3);
}


</style>
