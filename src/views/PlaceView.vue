<template>
  <div class="page-content">
    <div v-if="loading" class="place-container loading">{{ t('common.loading') }}</div>

    <div v-else-if="!place" class="place-container not-found">
      <h2>{{ loadError || t('place.not_found') }}</h2>
      <RouterLink to="/search" class="btn btn-primary mt-4">{{ t('place.back_to_search') }}</RouterLink>
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
              <button type="button" class="carousel__btn carousel__btn--prev" aria-label="Previous photo" @click="galleryPrev">&#8592;</button>
              <button type="button" class="carousel__btn carousel__btn--next" aria-label="Next photo" @click="galleryNext">&#8594;</button>
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
        <div v-else class="carousel-placeholder">{{ t('place.no_photos') }}</div>

        <div class="place-container place-header-inner">
          <div class="place-header-row">
          <img v-if="place.logo" :src="place.logo" class="place-logo" :alt="placeName" />
          <div class="place-title-block">
            <div class="place-title-row">
              <h1 class="place-title">{{ placeName }}</h1>
              <div class="place-header-actions">
                <button
                  type="button"
                  class="save-btn"
                  :class="{ 'save-btn--active': isSaved }"
                  :aria-pressed="isSaved"
                  :aria-label="isSaved ? t('place.saved') : t('place.save')"
                  @click="toggleSaved"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{{ isSaved ? t("place.saved") : t("place.save") }}</span>
                </button>

                <div v-if="store.isLoggedIn" class="place-menu">
                  <button
                    type="button"
                    class="place-menu-btn"
                    :class="{ 'is-open': menuOpen }"
                    :aria-expanded="menuOpen"
                    aria-haspopup="true"
                    :aria-label="t('place.more_actions')"
                    @click="menuOpen = !menuOpen"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  <div v-if="menuOpen" class="place-menu-dropdown" @click.stop>
                    <button type="button" class="place-menu-item" :class="{ active: showMe }" @click="toggleShowMeMenu">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ showMe ? t('place.hide_me') : t('place.show_me') }}
                    </button>
                    <button v-if="isOwner" type="button" class="place-menu-item" @click="goEdit">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                      {{ t('place.edit') }}
                    </button>
                    <button v-if="canClaim" type="button" class="place-menu-item" @click="openClaim">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      {{ t('place.claim_this') }}
                    </button>
                    <button type="button" class="place-menu-item danger" @click="openReport">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                      {{ t('place.report_this') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="place-title-meta">
              <span class="cat-pill">{{ categoryIcon }} {{ categoryLabel }}</span>
            </div>
            <div class="place-rating-row">
              <StarRating :rating="place.rating" :size="22" />
              <span class="rating-num">{{ place.rating.toFixed(1) }}</span>
              <span class="review-count">({{ place.reviewCount }} {{ t("common.reviews_count") }})</span>
              <template v-if="place.isOpen !== null">
                <span class="meta-dot" aria-hidden="true">·</span>
                <span class="status-pill" :class="place.isOpen ? 'open' : 'closed'">
                  {{ place.isOpen ? t("place.open_now") : t("place.closed") }}
                </span>
              </template>
              <span class="meta-dot" aria-hidden="true">·</span>
              <span class="today-line">
                <span class="today-label">{{ t("place.today_hours") }}:</span>
                {{ todayHoursDisplay }}
              </span>
              <template v-if="place.priceRating || place.qualityRating">
                <span class="meta-dot" aria-hidden="true">·</span>
                <RatingBreakdown :price="place.priceRating" :quality="place.qualityRating" />
              </template>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div class="place-container place-body">
        <div class="place-grid">
          <div class="place-main">
            <div v-if="aiSummaryLoading" class="ai-summary-card ai-summary-card--loading">
              <span class="ai-summary-icon">✦</span> {{ t('place.ai_generating') }}
            </div>
            <div v-else-if="aiSummary" class="ai-summary-card">
              <div class="ai-summary-header">
                <span class="ai-summary-icon">✦</span>
                <span class="ai-summary-label">{{ t('place.ai_label') }}</span>
              </div>
              <p class="ai-summary-text">{{ locale.locale === 'uz' && aiSummary.uz ? aiSummary.uz : aiSummary.en }}</p>
            </div>

            <section class="info-section">
              <div class="section-title-row">
                <h2 class="section-title">{{ t("place.reviews") }}</h2>
                <ReviewInput v-if="store.isLoggedIn" @submit="handleReviewSubmit" />
              </div>

              <div v-if="submitError" class="submit-error">{{ submitError }}</div>
              <div v-if="reviewSubmitted" class="submitted-msg">✅ {{ t('place.review_posted') }}</div>
              <div v-if="!store.isLoggedIn" class="review-login-nudge">
                <p>
                  <RouterLink to="/login" class="text-primary font-semibold">{{ t("auth.signin_link") }}</RouterLink>
                  {{ t('place.sign_in_to_review') }}
                </p>
              </div>

              <div v-if="reviewsLoading" class="text-muted text-sm">{{ t('place.loading_reviews') }}</div>
              <div v-else-if="reviews.length" class="reviews-list">
                <ReviewCard
                  v-for="r in reviews"
                  :key="r.id"
                  :review="r"
                  @open="openReviewDetail"
                  @report="openReviewReport"
                />
                <Pagination
                  v-if="reviewsTotalPages > 1"
                  :current="reviewsPage"
                  :total="reviewsTotalPages"
                  @go="setReviewsPage"
                />
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

              <div v-if="placeDesc" class="sidebar-desc">{{ placeDesc }}</div>
              <div v-if="placeDesc" class="divider-sidebar"></div>

              <a v-if="place.phone" :href="telHref" class="sidebar-line is-link">
                <span class="side-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

              <div v-if="place.createdByUser || place.claimedByUser" class="attribution-block">
                <div v-if="place.createdByUser" class="attribution-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  {{ t('place.added_by') }} <span class="attr-name">{{ place.createdByUser.name || ('@' + place.createdByUser.username) }}</span>
                </div>
                <div v-if="place.claimedByUser" class="attribution-line">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {{ t('place.claimed_by') }} <span class="attr-name">{{ place.claimedByUser.name || ('@' + place.claimedByUser.username) }}</span>
                </div>
              </div>

              <div class="sidebar-map-wrap">
                <SvgMapItem
                  :lat="place.lat ?? null"
                  :lon="place.lon ?? null"
                  :user-lat="userCoords?.lat ?? null"
                  :user-lon="userCoords?.lon ?? null"
                  svgSrc="/Tashkent_map_with_captions.svg"
                  :show-coords="false"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </template>

    <div v-if="menuOpen" class="place-menu-overlay" @click="menuOpen = false"></div>
  </div>

  <ReviewDetailModal
    v-if="detailReview"
    :review="detailReview"
    @close="closeReviewDetail"
  />

  <ReportModal
    v-if="reportTarget"
    :target-id="reportTarget.id"
    :target-type="reportTarget.type"
    @close="reportTarget = null"
    @submitted="reportTarget = null"
  />

  <ReportModal
    v-if="placeReportOpen && place"
    :target-id="place._uuid"
    target-type="place"
    @close="placeReportOpen = false"
    @submitted="placeReportOpen = false"
  />

  <ClaimModal
    v-if="claimModalOpen && place"
    :place-id="place._uuid"
    @close="claimModalOpen = false"
    @submitted="claimModalOpen = false"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { t, i18nState } from "../i18n/index.js"
import { resolveTodayHours } from "../data/places.js"
import { store } from "../store/index.js"
import { getPlace, getPlaceAISummary } from "../api/places.js"
import { listPlaceReviews, createReview } from "../api/reviews.js"
import { normalizePlace, normalizeReview } from "../api/normalize.js"
import { uploadFile } from "../api/files.js"
import { categoriesState, ensureCategoriesLoaded } from "../store/categories.js"
import { locationState, toggleShowMe, ensureCoordsIfShowing } from "../store/userLocation.js"
import ReviewCard from "../components/ReviewCard.vue"
import ReviewInput from "../components/ReviewInput.vue"
import ReviewDetailModal from "../components/ReviewDetailModal.vue"
import ReportModal from "../components/ReportModal.vue"
import ClaimModal from "../components/ClaimModal.vue"
import StarRating from "../components/StarRating.vue"
import RatingBreakdown from "../components/RatingBreakdown.vue"
import SidebarHours from "../components/SidebarHours.vue"
import SvgMapItem from "../components/SvgMapItem.vue"
import Pagination from "../components/Pagination.vue"

const route = useRoute()
const router = useRouter()

const place = ref(null)
const reviews = ref([])
const reviewsTotal = ref(0)
const reviewsPage = ref(1)
const REVIEWS_LIMIT = 10
const reviewsTotalPages = computed(() => Math.ceil(reviewsTotal.value / REVIEWS_LIMIT) || 1)
const loading = ref(true)
const loadError = ref("")
const reviewsLoading = ref(false)
const aiSummary = ref(null)
const aiSummaryLoading = ref(false)
const submitError = ref("")
const reviewSubmitted = ref(false)

const carouselViewportRef = ref(null)
const viewportWidth = ref(0)
const galleryStartIndex = ref(0)

const GALLERY_MIN_SLIDE = 196
const GALLERY_MAX_VISIBLE = 4

let galleryResizeObserver = null

const locale = i18nState
const placeName = computed(() => place.value?.name[locale.locale] || place.value?.name.en || "")
const placeAddress = computed(() => place.value?.address[locale.locale] || place.value?.address.en || "")
const placeDesc = computed(() => place.value?.description[locale.locale] || place.value?.description.en || "")

const galleryImages = computed(() => place.value?.images || [])

const galleryVisibleCount = computed(() => {
  const n = galleryImages.value.length
  const w = viewportWidth.value
  if (!n || !w) return 1
  const raw = Math.floor(w / GALLERY_MIN_SLIDE)
  return Math.max(1, Math.min(GALLERY_MAX_VISIBLE, raw || 1, n))
})

const gallerySlideWidthPx = computed(() => {
  const w = viewportWidth.value
  const v = galleryVisibleCount.value
  if (!w || v < 1) return 280
  return w / v
})

const galleryMaxStart = computed(() => Math.max(0, galleryImages.value.length - galleryVisibleCount.value))
const galleryDotCount = computed(() => galleryMaxStart.value + 1)
const galleryTrackStyle = computed(() => ({
  transform: `translateX(-${galleryStartIndex.value * gallerySlideWidthPx.value}px)`,
  transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
}))

const telHref = computed(() => `tel:${(place.value?.phone || "").replace(/\s/g, "")}`)

const mapsUrl = computed(() => {
  const p = place.value
  if (!p) return "#"
  if (p.lat != null && p.lon != null) {
    return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeAddress.value || "")}`
})

const categoryIcons = {
  restaurants: "🍽️", auto: "🚗", health: "🏥",
  activities: "🏔️", sports: "⚽", tabiat: "🌿",
}
const categoryIcon = computed(() => categoryIcons[place.value?.category] || "📍")
const categoryLabel = computed(() => {
  const slug = place.value?.category
  if (!slug) return ""
  const cat = categoriesState.bySlug[slug]
  if (cat?.name) return cat.name[locale.locale] || cat.name.en || slug
  return slug
})

const isOwner = computed(() => !!(store.user && place.value?.isClaimed && place.value?.claimedBy === store.user.id))
const canClaim = computed(() => !!(store.isLoggedIn && place.value && !place.value.isClaimed && place.value.status === "approved"))

// Review detail modal
const detailReview = ref(null)

function openReviewDetail(review) {
  detailReview.value = review
}
function closeReviewDetail() {
  detailReview.value = null
  if (route.query.review) {
    const q = { ...route.query }
    delete q.review
    router.replace({ query: q })
  }
}

// Header actions menu (3-dots)
const menuOpen = ref(false)

// Report modal
const reportTarget = ref(null)
const placeReportOpen = ref(false)
const claimModalOpen = ref(false)

function openReviewReport(review) {
  reportTarget.value = { id: review.id, type: 'review' }
}

function openReport() {
  placeReportOpen.value = true
  menuOpen.value = false
}
function openClaim() {
  claimModalOpen.value = true
  menuOpen.value = false
}
function goEdit() {
  menuOpen.value = false
  if (place.value) {
    router.push({ name: 'business-place-edit', params: { alias: place.value.slug || place.value._uuid } })
  }
}

// Shared "Show me" toggle — controls the blue "you are here" dot on the map
const showMe = computed(() => locationState.showMe)
const userCoords = computed(() => (locationState.showMe ? locationState.coords : null))
function toggleShowMeMenu() {
  menuOpen.value = false
  toggleShowMe()
}

const isSaved = computed(() => !!place.value && store.isPlaceSaved(place.value._uuid))
function toggleSaved() {
  if (!store.isLoggedIn) { router.push('/login'); return }
  if (place.value) store.toggleSavedPlace(place.value._uuid).catch(() => {})
}

const todayHoursDisplay = computed(() => {
  const line = resolveTodayHours(place.value)
  return line ?? t("place.hours_unknown")
})

function measureGalleryViewport() {
  const el = carouselViewportRef.value
  viewportWidth.value = el ? el.clientWidth : 0
}

function galleryPrev() {
  const n = galleryMaxStart.value + 1
  if (n <= 1) return
  galleryStartIndex.value = (galleryStartIndex.value - 1 + n) % n
}
function galleryNext() {
  const n = galleryMaxStart.value + 1
  if (n <= 1) return
  galleryStartIndex.value = (galleryStartIndex.value + 1) % n
}

watch(galleryMaxStart, (max) => {
  if (galleryStartIndex.value > max) galleryStartIndex.value = max
})

async function loadAISummary(uuid) {
  aiSummaryLoading.value = true
  aiSummary.value = null
  try {
    const res = await getPlaceAISummary(uuid)
    aiSummary.value = res?.en ? res : null
  } catch {
    aiSummary.value = null
  } finally {
    aiSummaryLoading.value = false
  }
}

async function loadPlace(idOrSlug) {
  loading.value = true
  loadError.value = ""
  place.value = null
  galleryStartIndex.value = 0
  try {
    await ensureCategoriesLoaded()
    const raw = await getPlace(idOrSlug)
    place.value = normalizePlace(raw)
    nextTick(measureGalleryViewport)
    loadReviews(place.value._uuid)
    loadAISummary(place.value._uuid)
  } catch (e) {
    loadError.value = e.status === 404 ? "Place not found" : e.message || "Failed to load"
  } finally {
    loading.value = false
  }
}

async function loadReviews(idOrSlug, p = 1) {
  reviewsLoading.value = true
  try {
    const res = await listPlaceReviews(idOrSlug, { page: p, limit: REVIEWS_LIMIT })
    reviews.value = (res.items || []).map(normalizeReview)
    reviewsTotal.value = res.total ?? 0
    reviewsPage.value = p
    if (p === 1 && route.query.review) {
      const found = reviews.value.find((r) => r.id === route.query.review)
      if (found) detailReview.value = found
    }
  } catch {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

function setReviewsPage(n) { loadReviews(place.value._uuid, n) }

async function handleReviewSubmit(payload) {
  if (!place.value) return
  submitError.value = ""
  reviewSubmitted.value = false
  try {
    const body = {
      star_rating: payload.rating,
      text: payload.text,
    }
    if (payload.priceLevel) body.price_rating = payload.priceLevel
    if (payload.recommendLevel) body.quality_rating = payload.recommendLevel
    if (payload.files?.length) {
      const keys = []
      for (const f of payload.files) {
        const r = await uploadFile(f, "review")
        keys.push(r.key)
      }
      body.media = keys
    }
    await createReview(place.value._uuid, body)
    reviewSubmitted.value = true
    setTimeout(() => (reviewSubmitted.value = false), 3000)
    const fresh = await getPlace(place.value._uuid)
    place.value = normalizePlace(fresh)
    await loadReviews(place.value._uuid, 1)
  } catch (e) {
    submitError.value = e.status === 403
      ? "This place isn't approved yet — reviews are disabled."
      : e.message || "Failed to post review"
  }
}

watch(() => route.params.id, (id) => {
  if (id) loadPlace(id)
})

onMounted(() => {
  loadPlace(route.params.id)
  ensureCoordsIfShowing()  // persisted "Show me" on → load coords for the blue dot
  nextTick(() => {
    const el = carouselViewportRef.value
    if (el && typeof ResizeObserver !== "undefined") {
      galleryResizeObserver = new ResizeObserver(measureGalleryViewport)
      galleryResizeObserver.observe(el)
    }
    measureGalleryViewport()
  })
})

onBeforeUnmount(() => {
  galleryResizeObserver?.disconnect()
  galleryResizeObserver = null
})
</script>

<style scoped>
.place-container {
  width: 100%;
  max-width: 90%;
  margin: 0 auto;
  padding: 0 24px;
}

.place-container.loading,
.place-container.not-found {
  text-align: center;
  padding: 80px 0;
}

.place-header-wrap {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}
.place-header-inner { padding-top: 20px; padding-bottom: 20px; }

.place-header-row { display: flex; align-items: flex-start; gap: 16px; }
.place-header-row .place-title-block { flex: 1 1 auto; min-width: 0; }
.place-logo {
  width: 72px; height: 72px; flex-shrink: 0;
  object-fit: cover; border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  margin-top: 4px;
}

.place-title-row {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 8px;
}
.place-title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 800; color: var(--text); line-height: 1.2;
  margin-bottom: 0; flex: 1 1 auto; min-width: 0;
}
.save-btn {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--text);
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
  margin-top: 4px;
}
.save-btn:hover { background: var(--surface-2); border-color: var(--primary); color: var(--primary); }
.save-btn--active { background: var(--primary); border-color: var(--primary); color: #fff; }
.save-btn--active:hover { background: var(--primary); color: #fff; }

.place-header-actions { flex-shrink: 0; display: flex; align-items: center; gap: 8px; margin-top: 4px; }

.place-menu { position: relative; }
.place-menu-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 38px; height: 38px; border: 1px solid var(--border); border-radius: 999px;
  background: var(--surface); color: var(--text-2); cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}
.place-menu-btn:hover, .place-menu-btn.is-open { background: var(--surface-2); border-color: var(--primary); color: var(--primary); }

.place-menu-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
  min-width: 200px; padding: 6px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); box-shadow: var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.18));
  display: flex; flex-direction: column; gap: 2px;
  animation: fadeUp 0.16s ease;
}
.place-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 10px; border: none; border-radius: var(--radius-sm);
  background: none; color: var(--text); font-size: 0.875rem; font-weight: 500;
  text-align: left; cursor: pointer; transition: background var(--transition), color var(--transition);
}
.place-menu-item svg { flex-shrink: 0; color: var(--text-3); }
.place-menu-item:hover { background: var(--surface-2); }
.place-menu-item.active { color: var(--primary); }
.place-menu-item.active svg { color: var(--primary); }
.place-menu-item.danger:hover { background: rgba(239,68,68,0.08); color: #dc2626; }
.place-menu-item.danger:hover svg { color: #dc2626; }

.place-menu-overlay { position: fixed; inset: 0; z-index: 40; }

.cat-pill { display: inline-block; font-size: 0.8rem; font-weight: 600; color: var(--text-2); margin-bottom: 12px; }

.place-rating-row {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 6px 10px; font-size: 0.9rem; color: var(--text-2);
}
.rating-num { font-weight: 800; color: var(--text); }
.review-count { color: var(--text-3); }
.meta-dot { color: var(--text-3); user-select: none; }
.status-pill.open { color: #16a34a; font-weight: 700; }
.status-pill.closed { color: #dc2626; font-weight: 700; }
.today-line { color: var(--text-2); }
.today-label { font-weight: 600; color: var(--text); }

.carousel-outer {
  width: 100%; max-width: none; margin-inline: 0; padding-inline: 0;
  padding-top: 12px; padding-bottom: 16px;
}
.carousel-viewport {
  position: relative; overflow: hidden; width: 100%;
  border-radius: 0; background: var(--surface-2);
  max-height: 480px;
}
.carousel__track { display: flex; width: max-content; height: 100%; will-change: transform; }
.carousel__slide { flex: 0 0 auto; flex-shrink: 0; aspect-ratio: 4 / 3; overflow: hidden; background: var(--border); }
.carousel__img { width: 100%; height: 100%; object-fit: cover; display: block; }

.carousel__btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  z-index: 3; width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,0.45); color: #fff; font-size: 0.95rem;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition); border: none; cursor: pointer; line-height: 1;
}
.carousel__btn:hover { background: rgba(0,0,0,0.7); }
.carousel__btn--prev { left: 10px; }
.carousel__btn--next { right: 10px; }

.carousel__dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 3; }
.carousel__dot {
  width: 6px; height: 6px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.5); cursor: pointer; padding: 0;
  transition: background var(--transition), transform var(--transition);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}
.carousel__dot--active { background: #fff; transform: scale(1.3); }

.carousel-placeholder {
  width: 100%; padding: 48px 24px; text-align: center; color: var(--text-3);
}

.place-body { padding-top: 32px; padding-bottom: 80px; }
.place-grid {
  display: grid;
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  gap: 40px; align-items: start;
}
.info-section { margin-bottom: 32px; }
.sidebar-desc { color: var(--text-2); line-height: 1.6; font-size: 0.95rem; padding-bottom: 4px; }
.divider-sidebar { height: 1px; background: var(--border-light); margin: 8px 0 12px; }

.ai-summary-card {
  background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%);
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  color: var(--text-2);
  line-height: 1.6;
  animation: fadeUp 0.3s ease;
}
.ai-summary-card--loading {
  color: var(--text-3);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ai-summary-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.ai-summary-icon { color: var(--primary); font-size: 0.85rem; }
.ai-summary-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); }
.ai-summary-text { margin: 0; color: var(--text); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.section-title-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding-right: 8px; margin-bottom: 12px;
}
.sidebar-review-input { margin-left: auto; padding-right: 4px; }

.submitted-msg { font-size: 0.875rem; color: #16a34a; font-weight: 500; }
.submit-error { font-size: 0.875rem; color: #dc2626; font-weight: 500; margin: 8px 0; }
.review-login-nudge { margin: 16px 0; font-size: 0.9rem; color: var(--text-2); }
.reviews-list { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; }

.place-sidebar { position: sticky; top: calc(var(--nav-height) + 20px); }
.sidebar-card { padding: 18px; display: flex; flex-direction: column; gap: 0; }
.sidebar-rating {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 6px 8px; font-size: 0.9rem; color: var(--text-2); padding-bottom: 4px;
}

.sidebar-line {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 0; border-bottom: 1px solid var(--border-light);
}
.sidebar-line:last-of-type { border-bottom: none; }
.sidebar-line.is-link {
  text-decoration: none; color: inherit;
  transition: background var(--transition);
  margin: 0 -12px; padding-left: 12px; padding-right: 12px;
  border-radius: var(--radius-sm);
}
.sidebar-line.is-link:hover { background: var(--surface-2); }

.side-icon { flex-shrink: 0; color: var(--primary); display: flex; align-items: center; justify-content: center; margin-top: 2px; }
.side-text { font-size: 0.9rem; font-weight: 500; color: var(--text); line-height: 1.45; }
.sidebar-line.is-link .side-text { color: var(--primary); font-weight: 600; }
.address-multiline { color: var(--text); font-weight: 500; }

.attribution-block { display: flex; flex-direction: column; gap: 4px; padding: 10px 0 4px; border-top: 1px solid var(--border-light); }
.attribution-line { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-3); }
.attribution-line svg { flex-shrink: 0; }
.attr-name { color: var(--text-2); font-weight: 600; }

.sidebar-map-wrap {
  margin-top: 16px; padding: 12px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  min-height: 180px;
  display: flex; align-items: center; justify-content: center;
}

@media (max-width: 900px) {
  .place-grid { grid-template-columns: 1fr; }
  .place-sidebar { position: static; }
  .carousel__btn { width: 30px; height: 30px; font-size: 0.85rem; }
  .carousel__btn--prev { left: 6px; }
  .carousel__btn--next { right: 6px; }
}
</style>
