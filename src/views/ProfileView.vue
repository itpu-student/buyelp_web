<template>
  <div class="page-content">
    <div class="container">
      <div v-if="!store.isLoggedIn" class="not-logged-in">
        <h2>Please log in to view your profile.</h2>
        <RouterLink to="/login" class="btn btn-primary mt-4">{{ t('auth.login_btn') }}</RouterLink>
      </div>

      <template v-else>
        <div class="profile-header card">
          <div class="profile-cover"></div>
          <div class="profile-header-body">
            <img :src="avatarSrc" :alt="me?.name || 'User'" class="profile-avatar" />
            <div class="profile-info">
              <h1 class="profile-name">{{ me?.name || '—' }}</h1>
              <p class="profile-email text-muted text-sm">
                <span v-if="me?.username">@{{ me.username }}</span>
                <span v-else class="text-muted">no username yet</span>
              </p>
              <p class="profile-joined text-muted text-xs">
                {{ t('profile.joined') }}: {{ me?.created_at ? formatDate(me.created_at) : '—' }}
              </p>
              <p class="profile-phone text-muted text-xs" v-if="me?.phone">📞 {{ me.phone }}</p>
            </div>
            <div class="profile-actions">
              <button class="btn btn-secondary btn-sm" @click="editing = !editing">
                {{ editing ? 'Cancel' : 'Edit profile' }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="confirmDelete">Delete account</button>
            </div>
          </div>
        </div>

        <section class="section card edit-card" v-if="editing">
          <h3 class="section-title">Edit profile</h3>
          <div class="edit-grid">
            <label class="form-row">
              <span>Name</span>
              <input v-model="form.name" class="form-input" />
            </label>
            <label class="form-row">
              <span>Username (a–z, 0–9, _)</span>
              <input v-model="form.username" class="form-input" placeholder="handle" />
            </label>
            <label class="form-row">
              <span>Avatar</span>
              <input type="file" accept="image/*" @change="onAvatarPick" />
              <small v-if="uploading" class="text-muted">Uploading…</small>
            </label>
          </div>
          <div class="edit-actions">
            <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
            <span v-if="saveError" class="error-msg">{{ saveError }}</span>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">{{ t('profile.my_reviews') }}</h2>
          <div v-if="reviewsLoading" class="text-muted">Loading…</div>
          <div class="my-reviews-list" v-else-if="reviews.length">
            <div v-for="r in reviews" :key="r.id" class="my-review-item card">
              <div class="my-review-top">
                <RouterLink :to="`/place/${r._placeId}`" class="my-review-place">
                  Place
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

        <section class="section" v-if="claims.length">
          <h2 class="section-title">My place claims</h2>
          <ul class="claims-list">
            <li v-for="c in claims" :key="c.id" class="claim-row card">
              <RouterLink :to="`/place/${c.place_id}`" class="claim-place">{{ c.place_id }}</RouterLink>
              <span class="claim-status" :data-s="c.status">{{ claimStatusLabel(c.status) }}</span>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../i18n/index.js'
import { store } from '../store/index.js'
import StarRating from '../components/StarRating.vue'
import { staticUrl } from '../api/client.js'
import { getMe } from '../api/auth.js'
import { listUserReviews, updateMe, deleteMe } from '../api/users.js'
import { listMyClaims } from '../api/claims.js'
import { uploadFile } from '../api/files.js'
import { normalizeReview } from '../api/normalize.js'

const router = useRouter()
const me = ref(null)
const reviews = ref([])
const claims = ref([])
const reviewsLoading = ref(false)
const editing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const saveError = ref('')

const form = reactive({ name: '', username: '', avatar_key: '' })

const avatarSrc = computed(() => {
  if (me.value?.avatar_key) return staticUrl(me.value.avatar_key)
  const name = me.value?.name || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&size=128`
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function claimStatusLabel(s) {
  if (s === 10) return 'Approved'
  if (s === -10) return 'Rejected'
  return 'Pending'
}

async function loadAll() {
  try {
    me.value = await getMe()
    store.setUser(me.value)
    form.name = me.value.name || ''
    form.username = me.value.username || ''
  } catch (_) { /* token may be stale; ignore */ }

  if (!me.value?.id) return

  reviewsLoading.value = true
  try {
    const r = await listUserReviews(me.value.id, { limit: 20 })
    reviews.value = (r?.items || []).map(normalizeReview)
  } catch (_) { reviews.value = [] }
  finally { reviewsLoading.value = false }

  try { claims.value = await listMyClaims() || [] } catch (_) { claims.value = [] }
}

async function onAvatarPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  saveError.value = ''
  try {
    const res = await uploadFile(file, 'avatar')
    form.avatar_key = res.key
  } catch (err) {
    saveError.value = err.message || 'Upload failed'
  } finally { uploading.value = false }
}

async function saveProfile() {
  saving.value = true
  saveError.value = ''
  try {
    const payload = {}
    if (form.name && form.name !== me.value.name) payload.name = form.name
    if (form.username !== (me.value.username || '')) payload.username = form.username
    if (form.avatar_key) payload.avatar_key = form.avatar_key
    if (Object.keys(payload).length === 0) { editing.value = false; return }
    await updateMe(payload)
    me.value = await getMe()
    store.setUser(me.value)
    editing.value = false
  } catch (e) {
    saveError.value = e.message || 'Save failed'
  } finally { saving.value = false }
}

async function confirmDelete() {
  if (!confirm('Delete your account permanently? Reviews stay (anonymized).')) return
  try {
    await deleteMe()
    store.logout()
    router.push('/')
  } catch (e) {
    alert(e.message || 'Delete failed')
  }
}

onMounted(() => { if (store.isLoggedIn) loadAll() })
</script>

<style scoped>
.not-logged-in { text-align: center; padding: 80px 0; }

.profile-header { overflow: hidden; margin-bottom: 32px; }
.profile-cover { height: 140px; background: linear-gradient(135deg, var(--primary) 0%, #0a7c72 40%, var(--accent) 100%); }
.profile-header-body { display: flex; align-items: flex-end; gap: 24px; padding: 0 28px 28px; margin-top: -48px; flex-wrap: wrap; }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 4px solid var(--surface); box-shadow: var(--shadow-md); flex-shrink: 0; object-fit: cover; }
.profile-info { flex: 1; padding-top: 52px; min-width: 0; }
.profile-name { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.profile-email, .profile-joined, .profile-phone { margin-top: 4px; }
.profile-actions { padding-top: 52px; display: flex; flex-direction: column; gap: 8px; }

.edit-card { padding: 24px; margin-bottom: 32px; }
.edit-grid { display: grid; gap: 14px; max-width: 520px; }
.form-row { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-2); }
.form-input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); }
.edit-actions { margin-top: 16px; display: flex; gap: 12px; align-items: center; }
.error-msg { color: #c0392b; font-size: 0.85rem; }

.my-reviews-list { display: flex; flex-direction: column; gap: 14px; }
.my-review-item { padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; }
.my-review-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.my-review-place { font-weight: 600; color: var(--primary); font-size: 0.95rem; }
.my-review-text { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; }
.my-review-date { margin-top: -4px; }

.claims-list { display: flex; flex-direction: column; gap: 10px; list-style: none; padding: 0; }
.claim-row { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
.claim-place { color: var(--primary); font-family: monospace; font-size: 0.85rem; }
.claim-status { font-size: 0.8rem; padding: 2px 10px; border-radius: 999px; background: var(--bg-2); }
.claim-status[data-s="10"] { background: #d1fae5; color: #065f46; }
.claim-status[data-s="-10"] { background: #fee2e2; color: #991b1b; }

.empty-state { text-align: center; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-2); }
.empty-icon { font-size: 2.5rem; }

.section-title{
  padding-bottom: 13px; /*hand written*/
}

</style>
