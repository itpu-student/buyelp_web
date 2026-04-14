<template>
  <div class="review-card">
    <div class="review-header">
      <img
        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=0D9488&color=fff&size=64`"
        :alt="review.author"
        class="avatar"
        width="40"
        height="40"
      />
      <div class="review-meta">
        <span class="author-name">{{ review.author }}</span>
        <span class="review-date">{{ formatDate(review.date) }}</span>
      </div>
      <StarRating :rating="review.rating" :size="15" mode="simple" />
    </div>
    <p class="review-text">{{ review.text }}</p>

    <!-- Review Images — carousel viewport (matches place-header-wrap.carousel-viewport) -->
    <div v-if="reviewImages.length" class="review-carousel-outer">
      <div ref="viewportRef" class="carousel-viewport" role="region" aria-label="Review photos">
        <div class="carousel__track" :style="trackStyle">
          <div
            v-for="(src, i) in reviewImages"
            :key="i"
            class="carousel__slide"
            :style="{ width: `${slideWidthPx}px` }"
          >
            <img :src="src" alt="Review photo" class="carousel__img" loading="lazy" />
          </div>
        </div>

        <template v-if="maxStart > 0">
          <button
            type="button"
            class="carousel__btn carousel__btn--prev"
            aria-label="Previous photo"
            @click="prev"
          >
            &#8592;
          </button>
          <button
            type="button"
            class="carousel__btn carousel__btn--next"
            aria-label="Next photo"
            @click="next"
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
              @click="startIndex = i - 1"
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
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  review: { type: Object, required: true },
})

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
  transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
}))

function positionCount() {
  return maxStart.value + 1
}

function prev() {
  const n = positionCount()
  if (n <= 1) return
  startIndex.value = (startIndex.value - 1 + n) % n
}

function next() {
  const n = positionCount()
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
})

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

.avatar { border-radius: 50%; flex-shrink: 0; }

.review-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.author-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.review-date {
  font-size: 0.78rem;
  color: var(--text-3);
}

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

/* Carousel — mirrors place-header-wrap.carousel-viewport pattern */
.review-carousel-outer {
  width: 100%;
}

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
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.85rem;
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
</style>
