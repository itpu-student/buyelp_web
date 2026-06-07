<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')" @keydown.esc.window="$emit('close')">
      <div class="modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close" @click="$emit('close')">✕</button>
        <button class="modal-share" :title="copied ? t('review.copied') : t('review.copy_link')" @click="copyShareLink">
          <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span v-else style="font-size:0.75rem;font-weight:700;">✓</span>
        </button>

        <div class="modal-header">
          <RouterLink
            :to="`/u/${review.authorUsername || review._userId}`"
            class="user-link"
            @click.stop="$emit('close')"
          >
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
          </RouterLink>
        </div>

        <StarRating :rating="review.rating" :size="18" mode="simple" />

        <div v-if="review.priceRating || review.qualityRating" class="sub-ratings">
          <div v-if="review.priceRating" class="sub-rating-row">
            <span class="sub-label">{{ t('review.price') }}</span>
            <span v-for="(c, i) in coinIcons" :key="i" class="sub-coin" :class="{ active: i + 1 <= review.priceRating }">{{ c }}</span>
          </div>
          <div v-if="review.qualityRating" class="sub-rating-row">
            <span class="sub-label">{{ t('review.quality') }}</span>
            <span v-for="(c, i) in recommendIcons" :key="i" class="sub-coin" :class="{ active: i + 1 <= review.qualityRating }">{{ c }}</span>
          </div>
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
            @click="openLightbox(reviewImages, i)"
          />
        </div>

        <div v-if="review.prevCount > 0" class="history-section">
          <button class="history-toggle" @click="toggleHistory">
            {{ historyOpen ? '▲' : '▼' }} {{ review.prevCount }} {{ t('review.prev_versions') }}
          </button>
          <div v-if="historyOpen">
            <div v-if="historyLoading" class="text-muted text-sm">{{ t('review.loading_history') }}</div>
            <div class="prev-list">
              <div v-for="prev in history" :key="prev.id" class="prev-version">
                <div class="prev-header">
                  <span class="prev-date">{{ formatDate(prev.date) }}</span>
                  <StarRating :rating="prev.rating" :size="13" mode="simple" />
                </div>
                <div v-if="prev.priceRating || prev.qualityRating" class="prev-sub">
                  <span v-if="prev.priceRating">{{ t('review.price') }}: {{ prev.priceRating }}</span>
                  <span v-if="prev.qualityRating">{{ t('review.quality') }}: {{ prev.qualityRating }}</span>
                </div>
                <p class="prev-text">{{ prev.text }}</p>
                <div v-if="prev.images?.length" class="prev-images">
                  <img v-for="(src, i) in prev.images" :key="i" :src="src" alt="Review photo" class="prev-img" loading="lazy" @click="openLightbox(prev.images, i)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <ImageLightbox :images="lbImages" :start-index="lbStart" :open="lbOpen" @close="lbOpen = false" />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import StarRating from './StarRating.vue'
import ImageLightbox from './ImageLightbox.vue'
import { getReviewPrevs } from '../api/reviews.js'
import { normalizeReview } from '../api/normalize.js'
import { t } from '../i18n/index.js'

const props = defineProps({
  review: { type: Object, required: true },
})

const coinIcons = ['🪙', '💵', '💶', '💰', '💎']
const recommendIcons = ['❌', '⚠️', '🆗', '✅', '👑']
defineEmits(['close'])

const copied = ref(false)
function copyShareLink() {
  const url = `${window.location.origin}${window.location.pathname}?review=${props.review.id}`
  navigator.clipboard.writeText(url).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

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
const lbImages = ref([])
const lbStart = ref(0)
const lbOpen = ref(false)

function openLightbox(images, i) {
  lbImages.value = images
  lbStart.value = i
  lbOpen.value = true
}

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

.modal-share {
  position: absolute; top: 14px; right: 52px;
  background: none; border: none; cursor: pointer;
  color: var(--text-3);
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), color var(--transition);
}
.modal-share:hover { background: var(--surface-2); color: var(--primary); }

.modal-header {
  display: flex; align-items: center; gap: 12px;
}
.user-link {
  display: flex; align-items: center; gap: 12px;
  text-decoration: none; color: inherit; flex: 1; min-width: 0;
  border-radius: var(--radius-sm);
  padding: 4px 6px; margin: -4px -6px;
  transition: background var(--transition);
}
.user-link:hover { background: rgba(13,148,136,0.07); }
.user-link:hover .author-name { color: var(--primary); }
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

.sub-ratings { display: flex; flex-direction: column; gap: 6px; }
.sub-rating-row { display: flex; align-items: center; gap: 6px; }
.sub-label { font-size: 0.78rem; color: var(--text-3); width: 48px; }
.sub-coin { font-size: 1.1rem; filter: grayscale(1); opacity: 0.3; }
.sub-coin.active { filter: none; opacity: 1; }

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

.prev-list { display: flex; flex-direction: column; gap: 8px; }
.prev-version { padding: 10px 12px; background: var(--surface-2); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
.prev-header { display: flex; align-items: center; gap: 8px; }
.prev-date { font-size: 0.75rem; color: var(--text-3); }
.prev-sub { display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-3); }
.prev-text { font-size: 0.85rem; color: var(--text-2); margin: 0; }
.prev-images { display: flex; gap: 6px; flex-wrap: wrap; }
.prev-img { width: 70px; height: 62px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer; transition: opacity 0.12s; }
.prev-img:hover { opacity: 0.8; }


</style>
