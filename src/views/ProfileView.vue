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

        <section class="section" v-if="savedPlaces.length">
          <h2 class="section-title">Saved places</h2>
          <div class="saved-places-list">
            <RouterLink
              v-for="p in savedPlaces"
              :key="p._uuid"
              :to="`/place/${p.id}`"
              class="saved-place-card card"
            >
              <img v-if="p.logo" :src="p.logo" :alt="p.name.en" class="saved-place-logo" />
              <div v-else class="saved-place-logo saved-place-logo--empty">📍</div>
              <div class="saved-place-info">
                <span class="saved-place-name">{{ p.name.en || p.name.uz }}</span>
                <span class="saved-place-meta text-xs text-muted">{{ p.rating.toFixed(1) }} · {{ p.reviewCount }} reviews</span>
              </div>
            </RouterLink>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">My reports</h2>
          <div v-if="reportsLoading" class="text-muted">Loading…</div>
          <div v-else-if="reports.length" class="reports-list">
            <div v-for="r in reports" :key="r.id" class="report-item card">
              <div class="report-item-top">
                <span class="report-type-badge">{{ reportTypeLabel[r.type] || r.type }}</span>
                <span class="report-target-badge">{{ r.target_type }}</span>
                <span class="report-status" :data-s="r.status">{{ reportStatusLabel[r.status] || r.status }}</span>
                <div class="report-actions" v-if="r.status === 'pending'">
                  <button class="btn-link" @click="startEditReport(r)">Edit</button>
                  <button class="btn-link btn-link--danger" @click="removeReport(r)">Delete</button>
                </div>
              </div>
              <p class="report-text text-sm">{{ r.text || '—' }}</p>
              <div v-if="editingReport === r.id" class="report-edit-form">
                <textarea v-model="editReportForm.text" class="form-input" rows="2"></textarea>
                <div class="row-gap">
                  <button class="btn btn-primary btn-sm" :disabled="editReportSaving" @click="saveEditReport(r)">
                    {{ editReportSaving ? 'Saving…' : 'Save' }}
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="cancelEditReport">Cancel</button>
                </div>
                <span v-if="editReportError" class="error-msg">{{ editReportError }}</span>
              </div>
              <div v-if="r.admin_response" class="admin-response">
                <span class="admin-response-label">Admin response:</span> {{ r.admin_response }}
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">🚩</span>
            <p>No reports yet.</p>
          </div>
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
import { listMyReports, deleteReport, updateReport } from '../api/reports.js'
import { uploadFile } from '../api/files.js'
import { normalizeReview } from '../api/normalize.js'

const router = useRouter()
const me = ref(null)
const reviews = ref([])
const claims = ref([])
const reports = ref([])
const reportsLoading = ref(false)
const reviewsLoading = ref(false)
const editing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const saveError = ref('')

// Reports
const editingReport = ref(null)
const editReportForm = reactive({ type: '', text: '' })
const editReportSaving = ref(false)
const editReportError = ref('')

function startEditReport(r) {
  editingReport.value = r.id
  editReportForm.type = r.type
  editReportForm.text = r.text
  editReportError.value = ''
}
function cancelEditReport() {
  editingReport.value = null
}
async function saveEditReport(r) {
  editReportSaving.value = true
  editReportError.value = ''
  try {
    await updateReport(r.id, { type: editReportForm.type, text: editReportForm.text })
    r.type = editReportForm.type
    r.text = editReportForm.text
    editingReport.value = null
  } catch (e) { editReportError.value = e.message || 'Failed to save' }
  finally { editReportSaving.value = false }
}
async function removeReport(r) {
  if (!confirm('Delete this report?')) return
  try {
    await deleteReport(r.id)
    reports.value = reports.value.filter((x) => x.id !== r.id)
  } catch (e) { alert(e.message || 'Failed to delete') }
}

const reportStatusLabel = { pending: 'Pending', in_progress: 'In review', dismissed: 'Dismissed', actioned: 'Actioned' }
const reportTypeLabel = { spam: 'Spam', misleading: 'Misleading', inappropriate: 'Inappropriate', profanity: 'Profanity' }

// Saved places
const savedPlaces = computed(() => store.savedPlaces)

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

  try { claims.value = (await listMyClaims())?.items || [] } catch (_) { claims.value = [] }

  reportsLoading.value = true
  try { reports.value = (await listMyReports())?.items || [] } catch (_) { reports.value = [] }
  finally { reportsLoading.value = false }
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

.saved-places-list { display: flex; flex-direction: column; gap: 10px; }
.saved-place-card { display: flex; align-items: center; gap: 14px; padding: 12px 16px; text-decoration: none; color: inherit; transition: background var(--transition); }
.saved-place-card:hover { background: var(--surface-2); }
.saved-place-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; flex-shrink: 0; border: 1px solid var(--border); }
.saved-place-logo--empty { display: flex; align-items: center; justify-content: center; background: var(--surface-2); font-size: 1.2rem; }
.saved-place-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.saved-place-name { font-weight: 600; font-size: 0.9rem; color: var(--text); }
.saved-place-meta { color: var(--text-3); }

.reports-list { display: flex; flex-direction: column; gap: 12px; }
.report-item { padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.report-item-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.report-type-badge { font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); text-transform: capitalize; }
.report-target-badge { font-size: 0.72rem; color: var(--text-3); padding: 2px 6px; border-radius: 4px; background: var(--bg-2, var(--surface-2)); }
.report-status { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; margin-left: auto; }
.report-status[data-s="pending"] { background: #fef9c3; color: #713f12; }
.report-status[data-s="in_progress"] { background: #dbeafe; color: #1e40af; }
.report-status[data-s="dismissed"] { background: var(--surface-2); color: var(--text-3); }
.report-status[data-s="actioned"] { background: #d1fae5; color: #065f46; }
.report-actions { display: flex; gap: 8px; }
.btn-link { background: none; border: none; cursor: pointer; color: var(--primary); font-size: 0.8rem; padding: 0; }
.btn-link--danger { color: #dc2626; }
.report-text { color: var(--text-2); margin: 0; }
.report-edit-form { display: flex; flex-direction: column; gap: 6px; }
.admin-response { font-size: 0.82rem; color: var(--text-2); background: var(--surface-2); border-left: 3px solid var(--primary); padding: 6px 10px; border-radius: 0 4px 4px 0; }
.admin-response-label { font-weight: 600; color: var(--text); }
.error-msg { color: #dc2626; font-size: 0.82rem; }

</style>
