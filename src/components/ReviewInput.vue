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
          </div>

          <input
            v-model="text"
            type="text"
            class="form-input"
            maxlength="160"
            :placeholder="t('place.review_placeholder')"
          />

          <div class="media-row">
            <label class="media-add">
              <input type="file" accept="image/*,video/*" multiple hidden @change="onMedia" />
              <span>➕ Add media</span>
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
const text = ref('')
const media = ref([])

const canSubmit = computed(() => rating.value > 0)

function open() { isOpen.value = true }

function close() {
  isOpen.value = false
}

function reset() {
  rating.value = 0
  hoverStar.value = 0
  text.value = ''
  media.value.forEach((m) => URL.revokeObjectURL(m.url))
  media.value = []
}

function onMedia(e) {
  const files = Array.from(e.target.files || [])
  for (const f of files) {
    media.value.push({ name: f.name, type: f.type, url: URL.createObjectURL(f), file: f })
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
    files: media.value.map((m) => m.file),
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
