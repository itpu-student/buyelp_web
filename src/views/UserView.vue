<template>
  <div class="page-content">
    <div class="container">

      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p class="text-muted">Loading…</p>
      </div>

      <div v-else-if="notFound" class="state-box">
        <span class="state-icon">🔍</span>
        <h2>{{ t('user.not_found_title') }}</h2>
        <p class="text-muted">{{ t('user.not_found_msg') }}</p>
        <RouterLink to="/" class="btn btn-primary btn-sm">{{ t('user.go_home') }}</RouterLink>
      </div>

      <template v-else-if="user">
        <div class="profile-header card">
          <div class="profile-cover"></div>
          <div class="profile-header-body">
            <img :src="avatarSrc" :alt="user.name" class="profile-avatar" />
            <div class="profile-info">
              <h1 class="profile-name">{{ user.name }}</h1>
              <p class="profile-username text-muted text-sm">
                <span v-if="user.username">@{{ user.username }}</span>
              </p>
              <p class="profile-joined text-muted text-xs">
                {{ t('user.joined') }} {{ user.created_at ? formatDate(user.created_at) : '—' }}
              </p>
              <p class="profile-review-count text-muted text-xs">
                {{ publicData.review_count }} {{ t('common.reviews_count') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tab bar (scaffold for future tabs) -->
        <div class="tab-bar">
          <button class="tab-btn active">
            {{ t('place.reviews') }}<span v-if="reviewsTotal" class="tab-count">{{ reviewsTotal }}</span>
          </button>
        </div>

        <!-- Reviews tab -->
        <section class="section tab-panel">
          <div v-if="reviewsLoading" class="text-muted">{{ t('common.loading') }}</div>
          <div v-else-if="reviews.length" class="reviews-list">
            <ReviewCard
              v-for="r in reviews"
              :key="r.id"
              :review="r"
              show-place
              @open="selectedReview = $event"
            />
            <Pagination
              v-if="reviewsTotalPages > 1"
              :current="reviewsPage"
              :total="reviewsTotalPages"
              @go="setReviewsPage"
            />
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📝</span>
            <p>{{ t('user.no_reviews') }}</p>
          </div>
        </section>

        <ReviewDetailModal v-if="selectedReview" :review="selectedReview" @close="selectedReview = null" />
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { t } from '../i18n/index.js'
import ReviewCard from '../components/ReviewCard.vue'
import ReviewDetailModal from '../components/ReviewDetailModal.vue'
import Pagination from '../components/Pagination.vue'
import { getUser, listUserReviews } from '../api/users.js'
import { staticUrl } from '../api/client.js'
import { normalizeReview } from '../api/normalize.js'

const route = useRoute()

const loading = ref(true)
const notFound = ref(false)
const reviewsLoading = ref(false)
const publicData = ref({ review_count: 0 })
const user = ref(null)
const reviews = ref([])
const reviewsTotal = ref(0)
const reviewsPage = ref(1)
const selectedReview = ref(null)
const LIMIT = 10
const reviewsTotalPages = computed(() => Math.ceil(reviewsTotal.value / LIMIT) || 1)

const avatarSrc = computed(() => {
  if (!user.value) return ''
  if (user.value.avatar_key) return staticUrl(user.value.avatar_key)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value.name || 'User')}&background=0D9488&color=fff&size=128`
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(async () => {
  try {
    const data = await getUser(route.params.alias)
    publicData.value = data
    user.value = data.user
  } catch (e) {
    notFound.value = true
    loading.value = false
    return
  }
  loading.value = false

  if (!user.value?.id) return
  reviewsLoading.value = true
  try {
    const r = await listUserReviews(user.value.id, { page: 1, limit: LIMIT })
    reviews.value = (r?.items || []).map(normalizeReview)
    reviewsTotal.value = r?.total || 0
    reviewsPage.value = 1
  } catch (_) { reviews.value = [] }
  finally { reviewsLoading.value = false }
})

async function setReviewsPage(n) {
  if (!user.value?.id || reviewsLoading.value) return
  reviewsLoading.value = true
  try {
    const r = await listUserReviews(user.value.id, { page: n, limit: LIMIT })
    reviews.value = (r?.items || []).map(normalizeReview)
    reviewsTotal.value = r?.total ?? reviewsTotal.value
    reviewsPage.value = n
  } catch (_) {}
  finally { reviewsLoading.value = false }
}
</script>

<style scoped>
.state-box {
  text-align: center;
  padding: 80px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-2);
}

.state-icon { font-size: 3rem; }

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.profile-header { overflow: hidden; margin-bottom: 32px; }
.profile-cover { height: 140px; background: linear-gradient(135deg, var(--primary) 0%, #0a7c72 40%, var(--accent) 100%); }
.profile-header-body { display: flex; align-items: flex-end; gap: 24px; padding: 0 28px 28px; margin-top: -48px; flex-wrap: wrap; }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 4px solid var(--surface); box-shadow: var(--shadow-md); flex-shrink: 0; object-fit: cover; }
.profile-info { flex: 1; padding-top: 52px; min-width: 0; }
.profile-name { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.profile-username, .profile-joined, .profile-review-count { margin-top: 4px; }

.tab-bar {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 24px;
}

.tab-btn {
  padding: 10px 18px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-2);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

.tab-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-3);
}

.tab-panel { padding-top: 4px; }

.reviews-list { display: flex; flex-direction: column; gap: 16px; }

.empty-state {
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-2);
}
.empty-icon { font-size: 2.5rem; }
</style>
