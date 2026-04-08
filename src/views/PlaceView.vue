<template>
  <div class="page-content">
    <div v-if="!place" class="container not-found">
      <h2>Place not found</h2>
      <RouterLink to="/search" class="btn btn-primary mt-4">Back to Search</RouterLink>
    </div>

    <template v-else>
      <!-- ──── Hero image ──── -->
      <div class="place-hero">
        <img :src="place.images[0]" :alt="placeName" class="place-hero-img" />
        <div class="place-hero-overlay"></div>
        <div class="place-hero-content container">
          <RouterLink to="/search" class="back-link">← {{ t('common.back') }}</RouterLink>
          <div class="place-hero-badges">
            <span class="badge badge-primary">{{ categoryIcon }} {{ t(`categories.${place.category}`) }}</span>
            <span class="badge" :class="place.isOpen ? 'badge-success' : 'badge-danger'">
              {{ place.isOpen ? t('place.open_now') : t('place.closed') }}
            </span>
          </div>
          <h1 class="place-hero-title">{{ placeName }}</h1>
          <div class="place-hero-rating">
            <StarRating :rating="place.rating" :size="24" />
            <span class="rating-big">{{ place.rating.toFixed(1) }}</span>
            <span class="review-count-hero">({{ place.reviewCount }} {{ t('common.reviews_count') }})</span>
          </div>
        </div>
      </div>

      <div class="container place-body">
        <div class="place-grid">
          <!-- ──── Main column ──── -->
          <div class="place-main">
            <!-- Description -->
            <section class="info-section">
              <p class="place-desc">{{ placeDesc }}</p>
            </section>

            <div class="divider"></div>

            <!-- Reviews -->
            <section class="info-section">
              <h2 class="section-title">{{ t('place.reviews') }}</h2>

              <!-- Write review -->
              <div class="review-form card" v-if="store.isLoggedIn">
                <h3 class="form-title">{{ t('place.write_review') }}</h3>
                <!-- Star picker -->
                <div class="star-picker">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="star-pick"
                    :class="{ active: n <= newRating, hover: n <= hoverRating }"
                    @mouseenter="hoverRating = n"
                    @mouseleave="hoverRating = 0"
                    @click="newRating = n"
                  >★</span>
                </div>
                <textarea
                  v-model="newReviewText"
                  :placeholder="t('place.review_placeholder')"
                  class="form-input"
                  rows="3"
                ></textarea>
                <button class="btn btn-primary" @click="submitReview">
                  {{ t('place.submit_review') }}
                </button>
                <div v-if="reviewSubmitted" class="submitted-msg">
                  ✅ Review submitted! (Demo mode — not persisted)
                </div>
              </div>
              <div v-else class="review-login-nudge">
                <p>
                  <RouterLink to="/login" class="text-primary font-semibold">{{ t('auth.signin_link') }}</RouterLink>
                  to write a review.
                </p>
              </div>

              <!-- Existing reviews -->
              <div v-if="place.reviews.length" class="reviews-list">
                <ReviewCard v-for="r in allReviews" :key="r.id" :review="r" />
              </div>
              <p v-else class="text-muted text-sm">{{ t('place.no_reviews') }}</p>
            </section>
          </div>

          <!-- ──── Sidebar ──── -->
          <aside class="place-sidebar">
            <!-- Call CTA -->
            <a :href="`tel:${place.phone}`" class="btn btn-primary btn-lg call-btn">
              📞 {{ t('place.call_now') }}
            </a>

            <div class="info-card card">
              <div class="info-row">
                <span class="info-icon">📍</span>
                <div>
                  <div class="info-label">{{ t('place.address') }}</div>
                  <div class="info-value">{{ placeAddress }}</div>
                </div>
              </div>
              <div class="info-row">
                <span class="info-icon">📞</span>
                <div>
                  <div class="info-label">{{ t('place.phone') }}</div>
                  <a :href="`tel:${place.phone}`" class="info-value text-primary">{{ place.phone }}</a>
                </div>
              </div>
              <div class="info-row">
                <span class="info-icon">🕐</span>
                <div>
                  <div class="info-label">{{ t('place.hours') }}</div>
                  <div class="info-value">{{ place.hours }}</div>
                </div>
              </div>
            </div>

            <!-- Rating breakdown -->
            <div class="rating-card card">
              <div class="rating-big-display">
              <span class="rating-number">{{ place.rating.toFixed(1) }}</span>
              <div>
                <StarRating :rating="place.rating" :size="20" />
                <div class="text-muted text-xs">{{ place.reviewCount }} {{ t('common.reviews_count') }}</div>
              </div>
            </div>
            </div>
          </aside>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { t, i18nState } from '../i18n/index.js'
import { getPlaceById } from '../data/places.js'
import { store } from '../store/index.js'
import ReviewCard from '../components/ReviewCard.vue'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const place = getPlaceById(route.params.id)

const newRating = ref(0)
const hoverRating = ref(0)
const newReviewText = ref('')
const reviewSubmitted = ref(false)
const extraReviews = ref([])

const locale = i18nState
const placeName = computed(() => place?.name[locale.locale] || place?.name.en)
const placeAddress = computed(() => place?.address[locale.locale] || place?.address.en)
const placeDesc = computed(() => place?.description[locale.locale] || place?.description.en)

const categoryIcons = {
  restaurants: '🍽️', auto: '🚗', health: '🏥',
  activities: '🏔️', sports: '⚽', tabiat: '🌿',
}
const categoryIcon = computed(() => categoryIcons[place?.category] || '📍')

const allReviews = computed(() => [...(place?.reviews || []), ...extraReviews.value])

function submitReview() {
  if (!newRating.value || !newReviewText.value.trim()) return
  extraReviews.value.unshift({
    id: `new-${Date.now()}`,
    author: store.user?.name || 'You',
    rating: newRating.value,
    text: newReviewText.value.trim(),
    date: new Date().toISOString().split('T')[0],
  })
  newRating.value = 0
  newReviewText.value = ''
  reviewSubmitted.value = true
  setTimeout(() => (reviewSubmitted.value = false), 3000)
}
</script>

<style scoped>
/* Hero */
.place-hero {
  position: relative;
  height: 420px;
  overflow: hidden;
}

.place-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
}

.place-hero-content {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-link {
  color: rgba(255,255,255,0.7);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color var(--transition);
}

.back-link:hover { color: #fff; }

.place-hero-badges {
  display: flex;
  gap: 8px;
}

.place-hero-title {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.place-hero-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.stars { color: var(--accent); font-size: 1.1rem; letter-spacing: 2px; }
.rating-big { font-size: 1.3rem; font-weight: 800; }
.review-count-hero { font-size: 0.85rem; color: rgba(255,255,255,0.7); }

/* Body */
.place-body { padding-top: 32px; padding-bottom: 80px; }

.place-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

.info-section { margin-bottom: 32px; }
.place-desc { color: var(--text-2); line-height: 1.8; font-size: 1rem; }

/* Review form */
.review-form {
  padding: 20px;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-title { font-size: 1rem; font-weight: 700; }

.star-picker {
  display: flex;
  gap: 4px;
}

.star-pick {
  font-size: 2rem;
  color: var(--border);
  cursor: pointer;
  transition: color var(--transition), transform var(--transition);
}

.star-pick.active,
.star-pick.hover { color: var(--accent); }

.star-pick:hover { transform: scale(1.15); }

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
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.call-btn {
  width: 100%;
  font-size: 1rem;
  padding: 16px;
}

.info-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon { font-size: 1.1rem; flex-shrink: 0; padding-top: 2px; }

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.9rem;
  color: var(--text);
  font-weight: 500;
}

.rating-card { padding: 20px; }

.rating-big-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rating-number {
  font-size: 3rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.not-found { text-align: center; padding: 80px 0; }

@media (max-width: 900px) {
  .place-grid { grid-template-columns: 1fr; }
  .place-sidebar { position: static; }
}
</style>
