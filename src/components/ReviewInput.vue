<template>
  <div class="review-input">
    <button type="button" class="trigger" @click="open">
      <span class="trigger-icon" aria-hidden="true">📝</span>
      <span class="trigger-label">{{ t('place.write_review') }}</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="modal-backdrop" @click.self="close">
        <div class="modal-card card" role="dialog" aria-modal="true" :aria-label="t('place.write_review')">
          <button type="button" class="modal-close" aria-label="Close" @click="close">×</button>

          <h3 class="modal-title">{{ t('place.write_review') }}</h3>

          <div class="rating-row">
            <div class="stars" @mouseleave="hoverStar = 0">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="star"
                :class="{ active: n <= (hoverStar || rating) }"
                :aria-label="`${n} star${n > 1 ? 's' : ''}`"
                @mouseenter="hoverStar = n"
                @click="rating = n"
              >★</button>
            </div>

            <div class="badges">
              <button
                type="button"
                class="badge optional-rating-btn"
                :class="{ active: showCoinRow || priceLevel > 0 }"
                aria-label="Price level"
                @click="showCoinRow = !showCoinRow"
              >💲</button>
              <button
                type="button"
                class="badge optional-rating-btn"
                :class="{ active: showRecommendRow || recommendLevel > 0 }"
                aria-label="Recommend"
                @click="showRecommendRow = !showRecommendRow"
              >✔️</button>
            </div>
          </div>

          <div v-if="showCoinRow || priceLevel > 0" class="coin-rating-row">
            <span class="coin-label">How pricey?</span>
            <div class="coins" @mouseleave="hoverCoin = 0">
              <button
                v-for="(c, i) in coinIcons"
                :key="i"
                type="button"
                class="coin"
                :class="{ active: (i + 1) <= (hoverCoin || priceLevel) }"
                :aria-label="`Price level ${i + 1}`"
                @mouseenter="hoverCoin = i + 1"
                @click="priceLevel = priceLevel === i + 1 ? 0 : i + 1"
              >{{ c }}</button>
            </div>
            <span v-if="priceLevel" class="coin-hint">{{ coinHints[priceLevel - 1] }}</span>
          </div>

          <div v-if="showRecommendRow || recommendLevel > 0" class="coin-rating-row">
            <span class="coin-label">How's the quality?</span>
            <div class="coins" @mouseleave="hoverRecommend = 0">
              <button
                v-for="(r, i) in recommendIcons"
                :key="i"
                type="button"
                class="coin"
                :class="{ active: (i + 1) <= (hoverRecommend || recommendLevel) }"
                :aria-label="`Recommend level ${i + 1}`"
                @mouseenter="hoverRecommend = i + 1"
                @click="recommendLevel = recommendLevel === i + 1 ? 0 : i + 1"
              >{{ r }}</button>
            </div>
            <span v-if="recommendLevel" class="coin-hint">{{ recommendHints[recommendLevel - 1] }}</span>
          </div>

          <textarea
            v-model="text"
            class="form-input modal-text"
            rows="4"
            :placeholder="t('place.review_placeholder')"
          ></textarea>

          <div class="media-row">
            <label class="media-add">
              <input type="file" accept="image/*,video/*" multiple hidden @change="onMedia" />
              <span>📷 Add photos</span>
            </label>
            <div v-if="media.length" class="media-thumbs">
              <div v-for="(m, i) in media" :key="i" class="thumb">
                <img v-if="m.type.startsWith('image')" :src="m.url" alt="" />
                <span v-else>🎞️</span>
                <button type="button" class="thumb-x" aria-label="Remove" @click="removeMedia(i)">×</button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="close">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!canSubmit"
              @click="submit"
            >{{ t('place.submit_review') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { t } from '../i18n/index.js'

const emit = defineEmits(['submit'])

const isOpen = ref(false)
const rating = ref(0)
const hoverStar = ref(0)
const showCoinRow = ref(false)
const priceLevel = ref(0)
const hoverCoin = ref(0)
const showRecommendRow = ref(false)
const recommendLevel = ref(0)
const hoverRecommend = ref(0)
const text = ref('')
const media = ref([])

const coinIcons = ['🪙', '💵', '💶', '💰', '💎']
const coinHints = ['Cheap', 'Affordable', 'Mid-range', 'Pricey', 'Luxury']
const recommendIcons = ['❌', '⚠️', '☑️', '✅', '👑']
const recommendHints = ['Avoid', 'Mixed', 'Okay', 'Recommended', 'Must-try']

const canSubmit = computed(() => rating.value > 0 && text.value.trim().length > 0)

function open() { isOpen.value = true }

function close() {
  isOpen.value = false
}

function reset() {
  rating.value = 0
  hoverStar.value = 0
  showCoinRow.value = false
  priceLevel.value = 0
  hoverCoin.value = 0
  showRecommendRow.value = false
  recommendLevel.value = 0
  hoverRecommend.value = 0
  text.value = ''
  media.value.forEach((m) => URL.revokeObjectURL(m.url))
  media.value = []
}

function onMedia(e) {
  const files = Array.from(e.target.files || [])
  for (const f of files) {
    media.value.push({ name: f.name, type: f.type, url: URL.createObjectURL(f) })
  }
  e.target.value = ''
}

function removeMedia(i) {
  URL.revokeObjectURL(media.value[i].url)
  media.value.splice(i, 1)
}

function submit() {
  if (!canSubmit.value) return
  emit('submit', {
    rating: rating.value,
    text: text.value.trim(),
    priceLevel: priceLevel.value,
    recommendLevel: recommendLevel.value,
    media: media.value.map((m) => ({ name: m.name, type: m.type, url: m.url })),
  })
  reset()
  isOpen.value = false
}

watch(isOpen, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<style scoped>
.review-input { display: inline-block; }

.trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-2);
  transition: all var(--transition);
}

.trigger:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--surface-1a, var(--surface));
}

.trigger-icon {
  font-size: 1rem;
  line-height: 1;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-card {
  position: relative;
  width: 100%;
  max-width: 520px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: var(--text-3);
  cursor: pointer;
  line-height: 1;
  padding: 4px 8px;
}

.modal-close:hover { color: var(--text); }

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.stars { display: flex; gap: 2px; }

.star {
  background: transparent;
  border: none;
  font-size: 1.9rem;
  color: var(--border);
  cursor: pointer;
  padding: 2px;
  line-height: 1;
  transition: color var(--transition), transform var(--transition);
}

.star.active { color: var(--accent); }
.star:hover { transform: scale(1.1); }

.badges { display: flex; gap: 6px; }

.coin-rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 12px;
  background: var(--surface-1a, var(--surface-2));
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}

.coin-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-2);
}

.coins { display: flex; gap: 4px; }

.coin {
  background: transparent;
  border: none;
  font-size: 1.3rem;
  padding: 2px 4px;
  cursor: pointer;
  line-height: 1;
  filter: grayscale(1);
  opacity: 0.45;
  transition: filter var(--transition), opacity var(--transition), transform var(--transition);
}

.coin.active {
  filter: none;
  opacity: 1;
}

.coin:hover { transform: scale(1.15); }

.coin-hint {
  font-size: 0.8rem;
  color: var(--text-3);
  font-style: italic;
  margin-left: auto;
}

.badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-2);
  transition: all var(--transition);
}

.badge.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.modal-text { resize: vertical; min-height: 90px; }

.media-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.media-add {
  font-size: 0.875rem;
  color: var(--primary);
  cursor: pointer;
  padding: 6px 10px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.media-add:hover { border-color: var(--primary); }

.media-thumbs { display: flex; gap: 6px; flex-wrap: wrap; }

.thumb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.thumb img { width: 100%; height: 100%; object-fit: cover; }

.thumb-x {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 0.85rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
