<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')" @keydown.esc.window="$emit('close')">
      <div class="modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close" @click="$emit('close')">✕</button>

        <div class="modal-header">
          <img
            :src="review.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=0D9488&color=fff&size=64`"
            :alt="review.author"
            class="avatar"
            width="48"
            height="48"
          />
          <div class="meta">
            <span class="author-name">{{ review.author }}<span v-if="review.authorUsername" class="author-username"> @{{ review.authorUsername }}</span></span>
            <div class="meta-row">
              <span class="review-date">{{ formatDate(review.date) }}</span>
              <span v-if="review.prevCount > 0" class="edited-badge">{{ review.prevCount }}</span>
            </div>
          </div>
          <StarRating :rating="review.rating" :size="18" mode="simple" />
        </div>

        <div v-if="review.priceRating || review.qualityRating" class="sub-ratings">
          <span v-if="review.priceRating" class="sub-rating">Price: <strong>{{ review.priceRating.toFixed(1) }}</strong></span>
          <span v-if="review.qualityRating" class="sub-rating">Quality: <strong>{{ review.qualityRating.toFixed(1) }}</strong></span>
        </div>

        <p v-if="review.text" class="review-text">{{ review.text }}</p>

        <div v-if="reviewImages.length" class="images-strip">
          <img
            v-for="(src, i) in reviewImages"
            :key="i"
            :src="src"
            alt="Review photo"
            class="strip-img"
            loading="lazy"
            @click="openLightbox(i)"
          />
        </div>

        <div v-if="review.prevCount > 0" class="history-section">
          <button class="history-toggle" @click="toggleHistory">
            {{ historyOpen ? '▲' : '▼' }} {{ review.prevCount }} previous version{{ review.prevCount > 1 ? 's' : '' }}
          </button>
          <div v-if="historyOpen">
            <div v-if="historyLoading" class="text-muted text-sm">Loading history…</div>
            <div v-for="prev in history" :key="prev.id" class="prev-version">
              <span class="prev-date">{{ formatDate(prev.date) }}</span>
              <p class="prev-text">{{ prev.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Lightbox -->
  <Teleport to="body">
    <div
      v-if="lightboxOpen"
      class="lb-backdrop"
      @click.self="closeLightbox"
      @keydown.left.window.prevent="lbPrev"
      @keydown.right.window.prevent="lbNext"
      @keydown.esc.window.prevent="closeLightbox"
    >
      <button class="lb-close" aria-label="Close" @click="closeLightbox">✕</button>
      <div class="lb-counter">{{ lbIndex + 1 }} / {{ reviewImages.length }}</div>
      <div class="lb-track-wrap">
        <div class="lb-track" :style="lbTrackStyle">
          <div v-for="(src, i) in reviewImages" :key="i" class="lb-slide">
            <img :src="src" :alt="`Photo ${i + 1}`" class="lb-img" />
          </div>
        </div>
      </div>
      <button v-if="reviewImages.length > 1" class="lb-btn lb-btn--prev" @click="lbPrev">&#8592;</button>
      <button v-if="reviewImages.length > 1" class="lb-btn lb-btn--next" @click="lbNext">&#8594;</button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import StarRating from './StarRating.vue'
import { getReviewPrevs } from '../api/reviews.js'
import { normalizeReview } from '../api/normalize.js'

const props = defineProps({
  review: { type: Object, required: true },
})
defineEmits(['close'])

const reviewImages = computed(() => props.review.images || [])

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// History
const historyOpen = ref(false)
const historyLoading = ref(false)
const history = ref([])

async function toggleHistory() {
  historyOpen.value = !historyOpen.value
  if (historyOpen.value && history.value.length === 0) {
    historyLoading.value = true
    try {
      const res = await getReviewPrevs(props.review.id)
      history.value = (res?.items || []).map(normalizeReview)
    } catch (_) { history.value = [] }
    finally { historyLoading.value = false }
  }
}

// Lightbox
const lightboxOpen = ref(false)
const lbIndex = ref(0)

const lbTrackStyle = computed(() => ({
  transform: `translateX(-${lbIndex.value * 100}%)`,
  transition: 'transform 0.4s ease',
}))

function openLightbox(i) {
  lbIndex.value = i
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}
function lbPrev() { lbIndex.value = (lbIndex.value - 1 + reviewImages.value.length) % reviewImages.value.length }
function lbNext() { lbIndex.value = (lbIndex.value + 1) % reviewImages.value.length }

onMounted(() => { document.body.style.overflow = 'hidden' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: fade-in 0.12s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.modal-box {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  padding: 28px 24px 24px;
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.35));
}

.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; cursor: pointer;
  color: var(--text-3); font-size: 1rem;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), color var(--transition);
}
.modal-close:hover { background: var(--surface-2); color: var(--text); }

.modal-header {
  display: flex; align-items: center; gap: 12px;
}
.avatar { border-radius: 50%; flex-shrink: 0; object-fit: cover; }
.meta { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.author-name { font-weight: 700; font-size: 0.95rem; color: var(--text); }
.author-username { font-weight: 400; color: var(--text-3); font-size: 0.82rem; }
.meta-row { display: flex; align-items: center; gap: 6px; }
.review-date { font-size: 0.8rem; color: var(--text-3); }
.edited-badge {
  font-size: 0.72rem; color: var(--text-3);
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 4px; padding: 0 5px; line-height: 1.6;
}

.sub-ratings { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-2); }
.sub-rating strong { color: var(--text); }

.review-text { font-size: 0.9rem; color: var(--text-2); line-height: 1.65; margin: 0; }

.images-strip {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.strip-img {
  width: 90px; height: 80px; object-fit: cover;
  border-radius: var(--radius-sm); border: 1px solid var(--border);
  cursor: pointer; transition: opacity 0.12s;
}
.strip-img:hover { opacity: 0.85; }

.history-section { border-top: 1px solid var(--border); padding-top: 12px; display: flex; flex-direction: column; gap: 10px; }
.history-toggle {
  background: none; border: none; cursor: pointer;
  font-size: 0.82rem; color: var(--text-3); text-align: left;
  padding: 0; transition: color var(--transition);
}
.history-toggle:hover { color: var(--text); }

.prev-version { padding: 10px 12px; background: var(--surface-2); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
.prev-date { font-size: 0.75rem; color: var(--text-3); }
.prev-text { font-size: 0.85rem; color: var(--text-2); margin: 0; }

/* Lightbox */
.lb-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center;
}
.lb-track-wrap { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; }
.lb-track { display: flex; width: 100%; height: 100%; will-change: transform; }
.lb-slide { flex: 0 0 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 56px 10px 44px; box-sizing: border-box; }
.lb-img { width: 100%; height: 100%; object-fit: contain; border-radius: 6px; }
.lb-close { position: fixed; top: 18px; right: 22px; z-index: 10001; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; font-size: 1.1rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lb-close:hover { background: rgba(255,255,255,0.25); }
.lb-counter { position: fixed; top: 22px; left: 50%; transform: translateX(-50%); z-index: 10001; color: rgba(255,255,255,0.75); font-size: 0.82rem; pointer-events: none; }
.lb-btn { position: fixed; top: 50%; transform: translateY(-50%); z-index: 10001; width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.12); color: #fff; font-size: 1.3rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.lb-btn:hover { background: rgba(255,255,255,0.25); }
.lb-btn--prev { left: 18px; }
.lb-btn--next { right: 18px; }
</style>
