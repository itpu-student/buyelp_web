<template>
  <div>
    <div class="detail-nav">
      <button class="btn btn-ghost btn-sm" @click="router.push('/admin/reports')">← Back to Reports</button>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else-if="report">
      <!-- Report card -->
      <div class="detail-grid">
        <div class="report-card card">
          <div class="card-section">
            <div class="section-label">Status</div>
            <span class="badge" :class="statusClass(report.status)">{{ report.status }}</span>
          </div>

          <div class="card-section">
            <div class="section-label">Reporter</div>
            <div class="user-row" v-if="report.reporter">
              <span class="user-name">{{ report.reporter.name }}</span>
              <span class="text-muted">@{{ report.reporter.username }}</span>
            </div>
            <span v-else class="text-muted">{{ report.user_id }}</span>
          </div>

          <div class="card-section">
            <div class="section-label">Target</div>
            <div>
              <span class="badge badge-neutral">{{ report.target_type }}</span>
              <template v-if="report.target">
                <span class="ml-1">{{ report.target.name }}</span>
                <p class="text-muted text-sm mt-1">{{ report.target.content }}</p>
              </template>
              <span v-else class="ml-1 text-muted">[removed]</span>
            </div>
          </div>

          <div class="card-section" v-if="report.reported_user">
            <div class="section-label">Reported User</div>
            <div class="user-row">
              <span class="user-name">{{ report.reported_user.name }}</span>
              <span class="text-muted">@{{ report.reported_user.username }}</span>
            </div>
          </div>

          <div class="card-section">
            <div class="section-label">Report Type</div>
            <span>{{ report.type || '—' }}</span>
          </div>

          <div class="card-section" v-if="report.text">
            <div class="section-label">Reporter Note</div>
            <p class="report-text">{{ report.text }}</p>
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
        <div class="action-card card" v-if="report.status !== 'dismissed' && report.status !== 'actioned'">
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

            <div class="checkbox-group" v-if="report.target_type === 'review'">
              <label class="checkbox-label">
                <input type="checkbox" v-model="action.delete_target_review" />
                Delete the reported review
              </label>
            </div>

            <div class="checkbox-group" v-if="report.reported_user_id">
              <label class="checkbox-label">
                <input type="checkbox" v-model="action.block_reported_user" />
                Block reported user
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

        <div class="action-card card resolved" v-else>
          <h3 class="action-title">Resolved</h3>
          <p class="text-muted text-sm">This report has been {{ report.status }}.</p>
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
          <li v-if="action.block_reported_user">Reported user will be <strong>blocked</strong></li>
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
import { useRouter, useRoute } from 'vue-router'
import { getAdminReport, reviewAdminReport } from '../../api/adminReports.js'

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

const action = reactive({
  admin_response: '',
  delete_target_review: false,
  block_reported_user: false,
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

async function loadReport() {
  loading.value = true
  error.value = ''
  try {
    report.value = await getAdminReport(route.params.id)
    action.admin_response = report.value.admin_response || ''
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

function openConfirm() {
  confirmOpen.value = true
}

async function enforce() {
  submitting.value = true
  actionError.value = ''
  confirmOpen.value = false
  try {
    report.value = await reviewAdminReport(route.params.id, {
      status: 'actioned',
      admin_response: action.admin_response || undefined,
      delete_target_review: action.delete_target_review || false,
      block_reported_user: action.block_reported_user || false,
    })
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

.user-row { display: flex; align-items: center; gap: 8px; }
.user-name { font-weight: 600; color: var(--text); }

.report-text {
  font-size: 0.9rem;
  color: var(--text-2);
  background: var(--surface-2);
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
}

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

.resolved { opacity: 0.7; }

.badge-warning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-primary { background: rgba(13, 148, 136, 0.12); color: var(--primary); }
.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.ml-1 { margin-left: 6px; }
.mt-1 { margin-top: 4px; }
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
