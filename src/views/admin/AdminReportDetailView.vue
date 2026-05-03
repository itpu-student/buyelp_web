<template>
  <div>
    <div class="detail-nav">
      <button class="btn btn-ghost btn-sm" @click="router.push('/admin/reports')">← Back to Reports</button>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else-if="report">
      <div class="detail-grid">
        <!-- Report card -->
        <div class="report-card card">
          <div class="card-section">
            <div class="section-label">Status</div>
            <span class="badge" :class="statusClass(report.status)">{{ report.status }}</span>
          </div>

          <div class="card-section" v-if="report.admin && report.status !== 'pending'">
            <div class="section-label">Handled By</div>
            <div class="user-row">
              <span class="user-name">{{ report.admin.name }}</span>
              <span class="text-muted">@{{ report.admin.username }}</span>
            </div>
          </div>

          <div class="card-section">
            <div class="section-label">Reporter</div>
            <div class="user-chip" v-if="report.reporter_user">
              <img v-if="report.reporter_user.avatar_key" :src="avatarUrl(report.reporter_user.avatar_key)" class="avatar" />
              <div v-else class="avatar avatar-placeholder">{{ initials(report.reporter_user.name) }}</div>
              <div class="user-info">
                <span class="user-name">{{ report.reporter_user.name }}</span>
                <span class="user-username">@{{ report.reporter_user.username }}</span>
              </div>
            </div>
            <span v-else class="text-muted">{{ report.user_id }}</span>
          </div>

          <div class="card-section" v-if="report.text">
            <div class="section-label">Report Text</div>
            <p class="report-text">{{ report.text }}</p>
          </div>

          <div class="card-section">
            <div class="section-label">Target</div>
            <div>
              <span class="target-type-tag">{{ report.target_type === 'review' ? '📋 Review' : '🏢 Place' }}</span>
              <template v-if="report.target">
                <div class="target-name-row ml-1">
                  <img v-if="report.target.avatar_key" :src="avatarUrl(report.target.avatar_key)" class="target-logo" />
                  <span class="font-medium">{{ report.target.name }}</span>
                </div>
                <p v-if="report.target.content" class="report-text mt-1 content-preview">{{ report.target.content }}</p>
                <RouterLink
                  :to="report.target_type === 'review' ? '/admin/reviews' : '/admin/places'"
                  class="view-link"
                >
                  View in admin →
                </RouterLink>
              </template>
              <span v-else class="ml-1 text-muted">[removed]</span>
            </div>
          </div>

          <div class="card-section" v-if="report.reported_user">
            <div class="section-label">Reported User</div>
            <div class="user-chip">
              <img v-if="report.reported_user.avatar_key" :src="avatarUrl(report.reported_user.avatar_key)" class="avatar" />
              <div v-else class="avatar avatar-placeholder">{{ initials(report.reported_user.name) }}</div>
              <div class="user-info">
                <span class="user-name">{{ report.reported_user.name }}</span>
                <span class="user-username">@{{ report.reported_user.username }}</span>
              </div>
              <span v-if="reportedUserDetail" class="badge" :class="reportedUserDetail.blocked ? 'badge-danger' : 'badge-success'">
                {{ reportedUserDetail.blocked ? 'Blocked' : 'Active' }}
              </span>
              <span v-else-if="userLoading" class="text-muted text-sm">…</span>
            </div>
          </div>

          <div class="card-section">
            <div class="section-label">Report Type</div>
            <span>{{ report.type || '—' }}</span>
          </div>

          <div class="card-section" v-if="report.admin_response">
            <div class="section-label">Admin Response</div>
            <p class="report-text">{{ report.admin_response }}</p>
          </div>

          <div class="card-section meta-row">
            <span class="text-muted text-sm">Created {{ fmtDate(report.created_at) }}</span>
            <span class="text-muted text-sm" v-if="report.reviewed_at">Reviewed {{ fmtDate(report.reviewed_at) }}</span>
          </div>
        </div>

        <!-- Action panel -->
        <div class="action-card card" v-if="report.status === 'pending' || report.status === 'in_progress'">
          <h3 class="action-title">Actions</h3>

          <!-- Take into work (pending only) -->
          <div v-if="report.status === 'pending'" class="action-section">
            <p class="text-muted text-sm">Mark as in-progress to begin investigation.</p>
            <div class="action-group">
              <textarea
                v-model="action.admin_response"
                class="form-textarea"
                :maxlength="textLimit"
                placeholder="Optional note…"
                rows="3"
              ></textarea>
              <button class="btn btn-primary" :disabled="submitting" @click="takeIntoWork">
                {{ submitting ? 'Saving…' : 'Take Into Work' }}
              </button>
            </div>
          </div>

          <!-- Finalize (in_progress) -->
          <div v-if="report.status === 'in_progress'" class="action-section">
            <textarea
              v-model="action.admin_response"
              class="form-textarea"
              :maxlength="textLimit"
              placeholder="Admin response / notes…"
              rows="4"
            ></textarea>

            <!-- Review target actions -->
            <div class="checkbox-group" v-if="report.target_type === 'review'">
              <label class="checkbox-label">
                <input type="checkbox" v-model="action.delete_target_review" />
                Delete the reported review
              </label>
            </div>

            <!-- Place target actions -->
            <div v-if="report.target_type === 'place' && report.target" class="radio-group">
              <div class="section-label mb-1">Place Action</div>
              <label class="radio-label">
                <input type="radio" v-model="action.place_action" value="none" />
                No action on place
              </label>
              <label class="radio-label">
                <input type="radio" v-model="action.place_action" value="reject" />
                Reject place (hide from listings)
              </label>
              <label class="radio-label">
                <input type="radio" v-model="action.place_action" value="delete" />
                Delete place permanently
              </label>
            </div>

            <!-- User block/unblock toggle -->
            <div class="user-action-group" v-if="report.reported_user_id">
              <div class="user-block-status" v-if="reportedUserDetail">
                <span class="text-sm text-muted">User is currently:</span>
                <span class="badge" :class="reportedUserDetail.blocked ? 'badge-danger' : 'badge-success'">
                  {{ reportedUserDetail.blocked ? 'Blocked' : 'Active' }}
                </span>
              </div>
              <label class="checkbox-label">
                <input type="checkbox" v-model="action.toggle_user_block" />
                {{ reportedUserDetail?.blocked ? 'Unblock this user' : 'Block this user' }}
              </label>
            </div>

            <div class="action-btns">
              <button class="btn btn-ghost" :disabled="submitting" @click="dismiss">Dismiss</button>
              <button class="btn btn-danger" :disabled="submitting" @click="openConfirm">Enforce Action</button>
            </div>
          </div>

          <div v-if="actionError" class="error-msg mt-2">{{ actionError }}</div>
          <div v-if="actionSuccess" class="success-msg mt-2">{{ actionSuccess }}</div>
        </div>

        <!-- Dismissed: can re-open -->
        <div class="action-card card" v-else-if="report.status === 'dismissed'">
          <h3 class="action-title">Dismissed</h3>
          <p class="text-muted text-sm">This report was dismissed. You can re-open it for further investigation.</p>
          <button class="btn btn-ghost" :disabled="submitting" @click="reopen">
            {{ submitting ? 'Saving…' : 'Re-open Investigation' }}
          </button>
          <div v-if="actionError" class="error-msg mt-2">{{ actionError }}</div>
        </div>

        <!-- Actioned: read-only -->
        <div class="action-card card resolved" v-else-if="report.status === 'actioned'">
          <h3 class="action-title">Resolved</h3>
          <p class="text-muted text-sm">This report has been actioned.</p>
        </div>
      </div>
    </template>

    <!-- Confirmation modal for enforce -->
    <div class="modal-overlay" v-if="confirmOpen" @click="confirmOpen = false">
      <div class="modal card" @click.stop>
        <h3>Confirm Enforcement</h3>
        <p>This will set the report to <strong>actioned</strong>.</p>
        <ul class="confirm-list">
          <li v-if="action.delete_target_review">Review will be <strong>deleted</strong></li>
          <li v-if="report?.target_type === 'place' && action.place_action === 'reject'">Place will be <strong>rejected</strong></li>
          <li v-if="report?.target_type === 'place' && action.place_action === 'delete'">Place will be <strong>permanently deleted</strong></li>
          <li v-if="action.toggle_user_block">
            Reported user will be <strong>{{ reportedUserDetail?.blocked ? 'unblocked' : 'blocked' }}</strong>
          </li>
        </ul>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="confirmOpen = false">Cancel</button>
          <button class="btn btn-danger" :disabled="submitting" @click="enforce">
            {{ submitting ? 'Saving…' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { getAdminReport, reviewAdminReport } from '../../api/adminReports.js'
import { adminGetUser, adminBlockUser, adminUnblockUser, adminSetPlaceStatus, adminDeletePlace } from '../../api/adminModeration.js'
import { staticUrl } from '../../api/client.js'

function avatarUrl(key) { return staticUrl(key) }
function initials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref('')
const report = ref(null)
const submitting = ref(false)
const actionError = ref('')
const actionSuccess = ref('')
const confirmOpen = ref(false)
const textLimit = 1000

const reportedUserDetail = ref(null)
const userLoading = ref(false)

const action = reactive({
  admin_response: '',
  delete_target_review: false,
  place_action: 'none',
  toggle_user_block: false,
})

function statusClass(s) {
  if (s === 'pending') return 'badge-warning'
  if (s === 'in_progress') return 'badge-primary'
  if (s === 'actioned') return 'badge-success'
  return 'badge-neutral'
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString()
}

async function loadReportedUser(id) {
  userLoading.value = true
  try {
    reportedUserDetail.value = await adminGetUser(id)
  } catch {
    // non-critical
  } finally {
    userLoading.value = false
  }
}

async function loadReport() {
  loading.value = true
  error.value = ''
  try {
    report.value = await getAdminReport(route.params.id)
    action.admin_response = report.value.admin_response || ''
    if (report.value.reported_user_id) {
      loadReportedUser(report.value.reported_user_id)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function takeIntoWork() {
  submitting.value = true
  actionError.value = ''
  try {
    report.value = await reviewAdminReport(route.params.id, {
      status: 'in_progress',
      admin_response: action.admin_response || undefined,
    })
    actionSuccess.value = 'Marked as in progress.'
  } catch (e) {
    actionError.value = e.message
  } finally {
    submitting.value = false
  }
}

async function dismiss() {
  submitting.value = true
  actionError.value = ''
  try {
    report.value = await reviewAdminReport(route.params.id, {
      status: 'dismissed',
      admin_response: action.admin_response || undefined,
    })
    actionSuccess.value = 'Report dismissed.'
  } catch (e) {
    actionError.value = e.message
  } finally {
    submitting.value = false
  }
}

async function reopen() {
  submitting.value = true
  actionError.value = ''
  try {
    report.value = await reviewAdminReport(route.params.id, { status: 'in_progress' })
    action.admin_response = report.value.admin_response || ''
    actionSuccess.value = 'Report re-opened.'
  } catch (e) {
    actionError.value = e.message
  } finally {
    submitting.value = false
  }
}

function openConfirm() {
  confirmOpen.value = true
}

async function enforce() {
  submitting.value = true
  actionError.value = ''
  confirmOpen.value = false
  try {
    // 1. Place action (separate API call)
    if (report.value.target_type === 'place' && report.value.target) {
      if (action.place_action === 'reject') {
        await adminSetPlaceStatus(report.value.target_id, -10)
      } else if (action.place_action === 'delete') {
        await adminDeletePlace(report.value.target_id)
      }
    }

    // 2. User block/unblock (separate API call)
    if (action.toggle_user_block && report.value.reported_user_id) {
      if (reportedUserDetail.value?.blocked) {
        await adminUnblockUser(report.value.reported_user_id)
      } else {
        await adminBlockUser(report.value.reported_user_id)
      }
      loadReportedUser(report.value.reported_user_id)
    }

    // 3. Update report status
    const payload = {
      status: 'actioned',
      admin_response: action.admin_response || undefined,
      block_reported_user: false,
    }
    if (report.value.target_type === 'review') {
      payload.delete_target_review = action.delete_target_review || false
    }

    report.value = await reviewAdminReport(route.params.id, payload)
    actionSuccess.value = 'Report actioned.'
  } catch (e) {
    actionError.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadReport)
</script>

<style scoped>
.detail-nav { margin-bottom: 20px; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

.report-card, .action-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-section { display: flex; flex-direction: column; gap: 4px; }

.section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-3);
}

.user-chip { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
}

.user-info { display: flex; flex-direction: column; gap: 1px; }
.user-name { font-weight: 600; color: var(--text); font-size: 0.9rem; }
.user-username { font-size: 0.78rem; color: var(--text-2); }
.font-medium { font-weight: 600; }

.report-text {
  font-size: 0.9rem;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
}

.content-preview {
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.view-link {
  font-size: 0.8rem;
  color: var(--primary);
  margin-top: 4px;
  display: inline-block;
  text-decoration: none;
}
.view-link:hover { text-decoration: underline; }

.meta-row { flex-direction: row; gap: 16px; }

.action-title { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
.action-section { display: flex; flex-direction: column; gap: 12px; }
.action-group { display: flex; flex-direction: column; gap: 10px; }

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color var(--transition);
  font-family: inherit;
}
.form-textarea:focus { outline: none; border-color: var(--primary); }

.checkbox-group { }
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
}

.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text);
  cursor: pointer;
}

.user-action-group { display: flex; flex-direction: column; gap: 6px; }
.user-block-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btns { display: flex; gap: 8px; justify-content: flex-end; }

.error-msg {
  padding: 10px 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: #ef4444;
  font-size: 0.85rem;
}

.success-msg {
  padding: 10px 12px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius-sm);
  color: #16a34a;
  font-size: 0.85rem;
}

.mt-2 { margin-top: 8px; }
.mt-1 { margin-top: 4px; }
.mb-1 { margin-bottom: 4px; }

.resolved { opacity: 0.7; }

.badge-warning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-primary { background: rgba(13, 148, 136, 0.12); color: var(--primary); }
.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }
.badge-danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; }

.target-type-tag { font-size: 0.82rem; font-weight: 600; color: var(--text-2); }
.target-name-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.target-logo { width: 20px; height: 20px; border-radius: 4px; object-fit: cover; flex-shrink: 0; }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.ml-1 { margin-left: 6px; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

/* Confirmation modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal {
  padding: 28px;
  max-width: 380px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeUp 0.2s ease;
}

.modal h3 { font-size: 1.1rem; font-weight: 700; }
.modal p { font-size: 0.9rem; color: var(--text-2); }

.confirm-list {
  font-size: 0.875rem;
  color: var(--text-2);
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

@media (max-width: 768px) {
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
