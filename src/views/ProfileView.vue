<template>
  <div class="page-content">
    <div class="container">
      <div v-if="!store.isLoggedIn" class="not-logged-in">
        <h2>{{ t('profile.not_logged_in') }}</h2>
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
                <span v-else class="text-muted">{{ t('profile.no_username') }}</span>
              </p>
              <p class="profile-joined text-muted text-xs">
                {{ t('profile.joined') }}: {{ me?.created_at ? formatDate(me.created_at) : '—' }}
              </p>
              <p class="profile-phone text-muted text-xs" v-if="me?.phone">📞 {{ me.phone }}</p>
            </div>
            <div class="profile-actions">
              <button class="btn btn-outline btn-sm" @click="editing = !editing">
                {{ editing ? t('common.cancel') : t('profile.edit_profile') }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="confirmDelete">{{ t('profile.delete_account') }}</button>
            </div>
          </div>
        </div>

        <section class="section card edit-card" v-if="editing">
          <h3 class="section-title">{{ t('profile.edit_profile') }}</h3>
          <div class="edit-grid">
            <label class="form-row">
              <span>{{ t('profile.label_name') }}</span>
              <input v-model="form.name" class="form-input" />
            </label>
            <label class="form-row">
              <span>{{ t('profile.label_username') }}</span>
              <input v-model="form.username" class="form-input" placeholder="handle" />
            </label>
            <label class="form-row">
              <span>{{ t('profile.label_avatar') }}</span>
              <input type="file" accept="image/*" @change="onAvatarPick" />
              <small v-if="uploading" class="text-muted">{{ t('common.uploading') }}</small>
            </label>
          </div>
          <div class="edit-actions">
            <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
              {{ saving ? t('common.saving') : t('profile.save_changes') }}
            </button>
            <span v-if="saveError" class="error-msg">{{ saveError }}</span>
          </div>
        </section>

        <!-- Tab bar -->
        <div class="tab-bar">
          <button :class="['tab-btn', { active: activeTab === 'reviews' }]" @click="activeTab = 'reviews'">
            {{ t('profile.my_reviews') }}<span v-if="reviewsTotal" class="tab-count">{{ reviewsTotal }}</span>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'saved' }]" @click="activeTab = 'saved'">
            {{ t('profile.tab_saved') }}<span v-if="savedPlaces.length" class="tab-count">{{ savedPlaces.length }}</span>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'reports' }]" @click="activeTab = 'reports'">
            {{ t('profile.tab_reports') }}<span v-if="reportsTotal" class="tab-count">{{ reportsTotal }}</span>
          </button>
        </div>

        <!-- Reviews -->
        <section v-show="activeTab === 'reviews'" class="section tab-panel">
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
            <p>{{ t('profile.no_reviews_yet') }}</p>
            <RouterLink to="/search" class="btn btn-primary btn-sm">{{ t('common.find_places') }}</RouterLink>
          </div>
        </section>

        <ReviewDetailModal v-if="selectedReview" :review="selectedReview" @close="selectedReview = null" />

        <!-- Saved Places -->
        <section v-show="activeTab === 'saved'" class="section tab-panel">
          <div v-if="!savedPlaces.length" class="empty-state">
            <span class="empty-icon">🔖</span>
            <p>{{ t('profile.no_saved') }}</p>
            <RouterLink to="/search" class="btn btn-primary btn-sm">{{ t('common.explore') }}</RouterLink>
          </div>
          <div v-else class="saved-places-list">
            <RouterLink
              v-for="p in savedPlaces"
              :key="p._uuid"
              :to="`/place/${p.id}`"
              class="saved-place-card card"
            >
              <img v-if="p.logo" :src="p.logo" :alt="p.name.en" class="saved-place-logo" />
              <div v-else class="saved-place-logo saved-place-logo--empty">
                {{ categoriesState.byId[p._categoryId]?.emoji || '📍' }}
              </div>
              <div class="saved-place-info">
                <span class="saved-place-name">{{ p.name[locale] || p.name.en }}</span>
                <span v-if="p.slug" class="saved-place-slug text-xs text-muted">@{{ p.slug }}</span>
                <div class="saved-place-stats text-xs text-muted">
                  <span>⭐ {{ p.rating.toFixed(1) }}</span>
                  <span>· {{ p.reviewCount }} {{ t('common.reviews_count') }}</span>
                  <span v-if="categoriesState.byId[p._categoryId]">
                    · {{ categoriesState.byId[p._categoryId].emoji }} {{ categoriesState.byId[p._categoryId].name?.[locale] || categoriesState.byId[p._categoryId].name?.en }}
                  </span>
                </div>
                <span v-if="p._savedAt" class="saved-place-date text-xs text-muted">{{ t('profile.saved_on') }} {{ formatDateTime(p._savedAt) }}</span>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Reports -->
        <section v-show="activeTab === 'reports'" class="section tab-panel">
          <div v-if="reportsLoading" class="text-muted">{{ t('common.loading') }}</div>
          <div v-else-if="reports.length" class="reports-list">
            <div v-for="r in reports" :key="r.id" class="report-item card">
              <!-- Target preview -->
              <div v-if="r.target" class="report-target">
                <img
                  v-if="r.target.avatar_key"
                  :src="staticUrl(r.target.avatar_key)"
                  :alt="r.target.name"
                  class="report-target-avatar"
                />
                <div v-else class="report-target-avatar report-target-avatar--empty">
                  {{ r.target_type === 'place' ? '📍' : '💬' }}
                </div>
                <div class="report-target-info">
                  <span class="report-target-name">{{ r.target.name }}</span>
                  <p v-if="r.target.content" class="report-target-content">{{ r.target.content }}</p>
                </div>
              </div>
              <!-- Meta row -->
              <div class="report-meta-row">
                <span class="report-type-badge">{{ t(`profile.report_type_${r.type}`) || r.type }}</span>
                <span class="report-target-badge">{{ r.target_type }}</span>
                <span class="report-date text-xs text-muted">{{ formatDate(r.created_at) }}</span>
                <span class="report-status" :data-s="r.status">{{ t(`profile.report_status_${r.status}`) || r.status }}</span>
              </div>
              <!-- User's report text -->
              <p class="report-text text-sm">{{ r.text || '—' }}</p>
              <!-- Edit form -->
              <div v-if="editingReport === r.id" class="report-edit-form">
                <textarea v-model="editReportForm.text" class="form-input" rows="2"></textarea>
                <div class="row-gap">
                  <button class="btn btn-primary btn-sm" :disabled="editReportSaving" @click="saveEditReport(r)">
                    {{ editReportSaving ? t('common.saving') : t('common.save') }}
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="cancelEditReport">{{ t('common.cancel') }}</button>
                </div>
                <span v-if="editReportError" class="error-msg">{{ editReportError }}</span>
              </div>
              <!-- Actions -->
              <div class="report-actions" v-if="r.status === 'pending'">
                <button class="btn-link" @click="startEditReport(r)">{{ t('common.edit') }}</button>
                <button class="btn-link btn-link--danger" @click="removeReport(r)">{{ t('common.delete') }}</button>
              </div>
              <!-- Admin response -->
              <div v-if="r.admin_response" class="admin-response">
                <span class="admin-response-label">{{ t('profile.admin_response') }}</span> {{ r.admin_response }}
              </div>
            </div>
            <Pagination
              v-if="reportsTotalPages > 1"
              :current="reportsPage"
              :total="reportsTotalPages"
              @go="setReportsPage"
            />
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">🚩</span>
            <p>{{ t('profile.no_reports') }}</p>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { t, i18nState } from '../i18n/index.js'
import { store } from '../store/index.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'
import ReviewCard from '../components/ReviewCard.vue'
import ReviewDetailModal from '../components/ReviewDetailModal.vue'
import Pagination from '../components/Pagination.vue'
import { staticUrl } from '../api/client.js'
import { getMe } from '../api/auth.js'
import { listUserReviews, updateMe, deleteMe } from '../api/users.js'
import { listMyReports, deleteReport, updateReport } from '../api/reports.js'
import { uploadFile } from '../api/files.js'
import { normalizeReview } from '../api/normalize.js'

const router = useRouter()
const me = ref(null)
const reviews = ref([])
const reviewsTotal = ref(0)
const reviewsPage = ref(1)
const selectedReview = ref(null)
const reports = ref([])
const reportsTotal = ref(0)
const reportsPage = ref(1)
const reportsLoading = ref(false)
const reviewsLoading = ref(false)
const editing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const saveError = ref('')
const activeTab = ref('reviews')

const locale = computed(() => i18nState.locale)

const LIMIT = 10
const reviewsTotalPages = computed(() => Math.ceil(reviewsTotal.value / LIMIT) || 1)
const reportsTotalPages = computed(() => Math.ceil(reportsTotal.value / LIMIT) || 1)

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
  if (!confirm(t('profile.delete_report_confirm'))) return
  try {
    await deleteReport(r.id)
    reports.value = reports.value.filter((x) => x.id !== r.id)
  } catch (e) { alert(e.message || 'Failed to delete') }
}


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
function formatDateTime(d) {
  if (!d) return ''
  let time = new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return `${formatDate(d)} at ${time}`
}

async function loadAll() {
  try {
    me.value = await getMe()
    store.setUser(me.value)
    form.name = me.value.name || ''
    form.username = me.value.username || ''
  } catch (_) {}

  if (!me.value?.id) return

  reviewsLoading.value = true
  try {
    const r = await listUserReviews(me.value.id, { page: 1, limit: LIMIT })
    reviews.value = (r?.items || []).map(normalizeReview)
    reviewsTotal.value = r?.total || 0
    reviewsPage.value = 1
  } catch (_) { reviews.value = [] }
  finally { reviewsLoading.value = false }

  reportsLoading.value = true
  try {
    const rep = await listMyReports({ page: 1, limit: LIMIT })
    reports.value = rep?.items || []
    reportsTotal.value = rep?.total || 0
    reportsPage.value = 1
  } catch (_) { reports.value = [] }
  finally { reportsLoading.value = false }
}

async function setReportsPage(n) {
  if (reportsLoading.value) return
  reportsLoading.value = true
  try {
    const rep = await listMyReports({ page: n, limit: LIMIT })
    reports.value = rep?.items || []
    reportsTotal.value = rep?.total ?? reportsTotal.value
    reportsPage.value = n
  } catch (_) {}
  finally { reportsLoading.value = false }
}

async function setReviewsPage(n) {
  if (!me.value?.id || reviewsLoading.value) return
  reviewsLoading.value = true
  try {
    const r = await listUserReviews(me.value.id, { page: n, limit: LIMIT })
    reviews.value = (r?.items || []).map(normalizeReview)
    reviewsTotal.value = r?.total ?? reviewsTotal.value
    reviewsPage.value = n
  } catch (_) {}
  finally { reviewsLoading.value = false }
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
  if (!confirm(t('profile.delete_account_confirm'))) return
  try {
    await deleteMe()
    store.logout()
    router.push('/')
  } catch (e) {
    alert(e.message || 'Delete failed')
  }
}

onMounted(() => {
  ensureCategoriesLoaded()
  if (store.isLoggedIn) loadAll()
})
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

/* ── Tabs ── */
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
  white-space: nowrap;
}

.tab-btn:hover { color: var(--primary); }
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

/* ── Reviews ── */
.reviews-list { display: flex; flex-direction: column; gap: 16px; }

/* ── Saved Places ── */
.saved-places-list { display: flex; flex-direction: column; gap: 10px; }

.saved-place-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  text-decoration: none;
  color: inherit;
  transition: background var(--transition);
}
.saved-place-card:hover { background: var(--surface-2); }

.saved-place-logo {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.saved-place-logo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  font-size: 1.3rem;
}

.saved-place-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.saved-place-name { font-weight: 600; font-size: 0.9rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.saved-place-slug { color: var(--text-3); }
.saved-place-stats { display: flex; flex-wrap: wrap; gap: 4px; color: var(--text-3); }
.saved-place-date { color: var(--text-3); margin-top: 1px; }

/* ── Reports ── */
.reports-list { display: flex; flex-direction: column; gap: 12px; }
.report-item { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }

.report-target { display: flex; align-items: flex-start; gap: 12px; }
.report-target-avatar {
  width: 44px; height: 44px; border-radius: 8px; object-fit: cover;
  flex-shrink: 0; border: 1px solid var(--border);
}
.report-target-avatar--empty {
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-2); font-size: 1.2rem;
}
.report-target-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.report-target-name { font-weight: 700; font-size: 0.9rem; color: var(--text); }
.report-target-content {
  font-size: 0.82rem; color: var(--text-3); margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.report-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.report-type-badge { font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); text-transform: capitalize; }
.report-target-badge { font-size: 0.72rem; color: var(--text-3); padding: 2px 6px; border-radius: 4px; background: var(--surface-2); }
.report-date { margin-left: auto; }
.report-status { font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; }
.report-status[data-s="pending"] { background: #fef9c3; color: #713f12; }
.report-status[data-s="in_progress"] { background: #dbeafe; color: #1e40af; }
.report-status[data-s="dismissed"] { background: var(--surface-2); color: var(--text-3); }
.report-status[data-s="actioned"] { background: #d1fae5; color: #065f46; }

.report-actions { display: flex; gap: 8px; }
.btn-link { background: none; border: none; cursor: pointer; color: var(--primary); font-size: 0.8rem; padding: 0; }
.btn-link--danger { color: #dc2626; }
.report-text { color: var(--text-2); margin: 0; font-size: 0.88rem; }
.report-edit-form { display: flex; flex-direction: column; gap: 6px; }
.admin-response { font-size: 0.82rem; color: var(--text-2); background: var(--surface-2); border-left: 3px solid var(--primary); padding: 6px 10px; border-radius: 0 4px 4px 0; }
.admin-response-label { font-weight: 600; color: var(--text); }

.empty-state { text-align: center; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--text-2); }
.empty-icon { font-size: 2.5rem; }

.section-title { padding-bottom: 13px; }
</style>
