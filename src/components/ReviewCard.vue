<template>
  <div class="review-card">
    <div class="review-header" role="button" tabindex="0" @click="$emit('open', review)" @keydown.enter="$emit('open', review)">
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
    <div v-if="review.priceRating || review.qualityRating" class="sub-ratings-row">
      <span v-if="review.priceRating">Price: {{ review.priceRating }}</span>
      <span v-if="review.qualityRating">Quality: {{ review.qualityRating }}</span>
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
            @click="openLightbox(i)"
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
      @click="openSingleLightbox"
    />
  </div>

  <!-- ====== Fullscreen Lightbox ====== -->
  <Teleport to="body">
    <div
      v-if="lightboxOpen"
      class="lb-backdrop"
      @click.self="closeLightbox"
      @keydown.left.prevent="lbPrev"
      @keydown.right.prevent="lbNext"
      @keydown.esc.prevent="closeLightbox"
    >
      <!-- Close -->
      <button class="lb-close" aria-label="Close" @click="closeLightbox">✕</button>

      <!-- Counter -->
      <div class="lb-counter">{{ lbIndex + 1 }} / {{ lbImages.length }}</div>

      <!-- Track -->
      <div class="lb-track-wrap" @click.self="closeLightbox">
        <div class="lb-track" :style="lbTrackStyle">
          <div
            v-for="(src, i) in lbImages"
            :key="i"
            class="lb-slide"
            @click="closeLightbox"
          >
            <img :src="src" :alt="`Photo ${i + 1}`" class="lb-img" />
          </div>
        </div>
      </div>

      <!-- Arrows -->
      <button
        v-if="lbImages.length > 1"
        class="lb-btn lb-btn--prev"
        aria-label="Previous"
        @click="lbPrev"
      >&#8592;</button>
      <button
        v-if="lbImages.length > 1"
        class="lb-btn lb-btn--next"
        aria-label="Next"
        @click="lbNext"
      >&#8594;</button>

      <!-- Dot strip -->
      <div v-if="lbImages.length > 1" class="lb-dots">
        <button
          v-for="(_, i) in lbImages"
          :key="i"
          class="lb-dot"
          :class="{ 'lb-dot--active': i === lbIndex }"
          @click="lbIndex = i"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import StarRating from './StarRating.vue'
import { store } from '../store/index.js'

const props = defineProps({
  review: { type: Object, required: true },
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
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

// ─── Lightbox ──────────────────────────────────────────────────────
const lightboxOpen = ref(false)
const lbIndex = ref(0)
const lbImages = ref([])

const lbTrackStyle = computed(() => ({
  transform: `translateX(-${lbIndex.value * 100}%)`,
  transition: 'transform 0.5s ease',
}))

function openLightbox(i) {
  lbImages.value = reviewImages.value
  lbIndex.value = i
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => document.addEventListener('keydown', onKey))
}

function openSingleLightbox() {
  if (!props.review.image) return
  lbImages.value = [props.review.image]
  lbIndex.value = 0
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => document.addEventListener('keydown', onKey))
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
}

function lbPrev() {
  const n = lbImages.value.length
  lbIndex.value = (lbIndex.value - 1 + n) % n
}
function lbNext() {
  lbIndex.value = (lbIndex.value + 1) % lbImages.value.length
}

function onKey(e) {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); lbPrev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); lbNext() }
  if (e.key === 'Escape')     { e.preventDefault(); closeLightbox() }
}

// ─── Touch / swipe support for lightbox ───────────────────────────
let touchStartX = 0
onMounted(() => {
  document.addEventListener('touchstart', (e) => {
    if (!lightboxOpen.value) return
    touchStartX = e.touches[0].clientX
  }, { passive: true })
  document.addEventListener('touchend', (e) => {
    if (!lightboxOpen.value) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 40) dx < 0 ? lbNext() : lbPrev()
  }, { passive: true })
})

// ─── Helpers ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.review-card {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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

.sub-ratings-row { display: flex; gap: 10px; font-size: 0.78rem; color: var(--text-3); }

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

/* ── Fullscreen Lightbox ── */
.lb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lb-in 0.12s ease;
}

@keyframes lb-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lb-track-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.lb-track {
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.lb-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* top: clear close/counter   bottom: clear dots   sides: near-zero (arrows are fixed) */
  padding: 56px 10px 44px;
  box-sizing: border-box;
}

.lb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  user-select: none;
  -webkit-user-drag: none;
}

.lb-close {
  position: fixed;
  top: 18px;
  right: 22px;
  z-index: 10001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }

.lb-counter {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  color: rgba(255,255,255,0.75);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  pointer-events: none;
}

.lb-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10001;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-size: 1.3rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease;
}
.lb-btn:hover { background: rgba(255,255,255,0.25); }
.lb-btn--prev { left: 18px; }
.lb-btn--next { right: 18px; }

.lb-dots {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  display: flex;
  gap: 8px;
}

.lb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 0;
  transition: background 0.1s ease, transform 0.1s ease;
}
.lb-dot--active {
  background: #fff;
  transform: scale(1.35);
}
</style>
