<template>
  <div class="page-content">
    <div class="container">
      <div v-if="!store.isLoggedIn" class="not-logged-in">
        <h2>Please log in to view your profile.</h2>
        <RouterLink to="/login" class="btn btn-primary mt-4">{{ t('auth.login_btn') }}</RouterLink>
      </div>

      <template v-else>
        <!-- Profile hero -->
        <div class="profile-header card">
          <div class="profile-cover"></div>
          <div class="profile-header-body">
            <img :src="store.user.avatar" :alt="store.user.name" class="profile-avatar" />
            <div class="profile-info">
              <h1 class="profile-name">{{ store.user.name }}</h1>
              <p class="profile-email text-muted text-sm">{{ store.user.email }}</p>
              <p class="profile-joined text-muted text-xs">
                {{ t('profile.joined') }}: {{ formatDate(store.user.joined) }}
              </p>
            </div>
            <div class="profile-stats">
              <div class="pstat">
                <span class="pstat-num">{{ store.user.reviews.length }}</span>
                <span class="pstat-lbl">{{ t('profile.total_reviews') }}</span>
              </div>
              <div class="pstat">
                <span class="pstat-num">{{ avgRating }}</span>
                <span class="pstat-lbl">Avg Rating</span>
              </div>
            </div>
          </div>
        </div>

        <!-- My Reviews -->
        <section class="section">
          <h2 class="section-title">{{ t('profile.my_reviews') }}</h2>
          <div class="my-reviews-list" v-if="store.user.reviews.length">
            <div v-for="r in store.user.reviews" :key="r.placeId" class="my-review-item card">
              <div class="my-review-top">
                <RouterLink :to="`/place/${r.placeId}`" class="my-review-place">
                  {{ r.placeName }}
                </RouterLink>
                <StarRating :rating="r.rating" :size="15" mode="simple" />
              </div>
              <p class="my-review-text">{{ r.text }}</p>
              <span class="my-review-date text-xs text-muted">{{ formatDate(r.date) }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📝</span>
            <p>You haven't written any reviews yet.</p>
            <RouterLink to="/search" class="btn btn-primary btn-sm">Find Places</RouterLink>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n/index.js'
import { store } from '../store/index.js'
import StarRating from '../components/StarRating.vue'

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const avgRating = computed(() => {
  if (!store.user?.reviews?.length) return '—'
  const sum = store.user.reviews.reduce((a, r) => a + r.rating, 0)
  return (sum / store.user.reviews.length).toFixed(1)
})
</script>

<style scoped>
.not-logged-in { text-align: center; padding: 80px 0; }

.profile-header {
  overflow: hidden;
  margin-bottom: 40px;
}

.profile-cover {
  height: 140px;
  background: linear-gradient(135deg, var(--primary) 0%, #0a7c72 40%, var(--accent) 100%);
}

.profile-header-body {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  padding: 0 28px 28px;
  margin-top: -48px;
  flex-wrap: wrap;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
  padding-top: 52px;
  min-width: 0;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
}

.profile-email, .profile-joined { margin-top: 4px; }

.profile-stats {
  display: flex;
  gap: 24px;
  padding-top: 52px;
}

.pstat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.pstat-num { font-size: 1.6rem; font-weight: 800; color: var(--primary); }
.pstat-lbl { font-size: 0.78rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; }

.my-reviews-list { display: flex; flex-direction: column; gap: 14px; }

.my-review-item {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-review-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.my-review-place {
  font-weight: 600;
  color: var(--primary);
  font-size: 0.95rem;
}

.small-stars { color: var(--accent); font-size: 0.85rem; letter-spacing: 2px; }

.my-review-text { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; }

.my-review-date { margin-top: -4px; }

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
