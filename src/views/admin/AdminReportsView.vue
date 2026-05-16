<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">{{ t('admin.report_list.title') }}</h2>
    </div>

    <!-- Status filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="filter-tab"
        :class="{ active: filters.status === s.value }"
        @click="setStatus(s.value)"
      >
        {{ s.label }}{{ counts[s.value] != null ? ` (${counts[s.value]})` : '' }}
      </button>
    </div>

    <!-- Additional filters -->
    <div class="filter-row">
      <select v-model="filters.target_type" class="filter-select" @change="load(1)">
        <option value="">{{ t('admin.report_list.filter_all_targets') }}</option>
        <option value="review">{{ t('admin.report_list.filter_review') }}</option>
        <option value="place">{{ t('admin.report_list.filter_place') }}</option>
      </select>
      <select v-model="filters.type" class="filter-select" @change="load(1)">
        <option value="">{{ t('admin.report_list.filter_all_types') }}</option>
        <option value="spam">{{ t('admin.report_list.filter_spam') }}</option>
        <option value="misleading">{{ t('admin.report_list.filter_misleading') }}</option>
        <option value="inappropriate">{{ t('admin.report_list.filter_inappropriate') }}</option>
        <option value="profanity">{{ t('admin.report_list.filter_profanity') }}</option>
      </select>
    </div>

    <div v-if="loading" class="state-msg">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.report_list.col_reporter') }}</th>
              <th>{{ t('admin.report_list.col_text') }}</th>
              <th>{{ t('admin.report_list.col_reported_user') }}</th>
              <th>{{ t('admin.report_list.col_target') }}</th>
              <th>{{ t('admin.report_list.col_type') }}</th>
              <th v-if="filters.status === ''">{{ t('admin.status') }}</th>
              <th>{{ t('admin.report_list.col_date') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td :colspan="filters.status === '' ? 8 : 7" class="empty-cell">{{ t('admin.report_list.empty') }}</td>
            </tr>
            <tr v-for="r in items" :key="r.id" class="clickable-row" @click="open(r.id)">
              <td>
                <div class="user-chip" v-if="r.reporter_user" @click.stop="openUserModal(r.reporter_user)">
                  <img v-if="r.reporter_user.avatar_key" :src="avatarUrl(r.reporter_user.avatar_key)" class="avatar" />
                  <div v-else class="avatar avatar-placeholder">{{ initials(r.reporter_user.name) }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ r.reporter_user.name }}</span>
                    <span class="user-username">@{{ r.reporter_user.username }}</span>
                  </div>
                </div>
                <span v-else class="text-muted text-sm">{{ r.user_id }}</span>
              </td>
              <td class="text-cell">
                <span v-if="r.text" class="report-text-preview">{{ r.text }}</span>
                <span v-else class="text-muted text-sm">—</span>
              </td>
              <td>
                <div class="user-chip" v-if="r.reported_user" @click.stop="openUserModal(r.reported_user)">
                  <img v-if="r.reported_user.avatar_key" :src="avatarUrl(r.reported_user.avatar_key)" class="avatar" />
                  <div v-else class="avatar avatar-placeholder">{{ initials(r.reported_user.name) }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ r.reported_user.name }}</span>
                    <span class="user-username">@{{ r.reported_user.username }}</span>
                  </div>
                </div>
                <span v-else class="text-muted text-sm">—</span>
              </td>
              <td>
                <div class="target-cell" @click.stop="openTargetModal(r)">
                  <span class="badge target-badge" :class="r.target_type === 'review' ? 'target-badge-review' : 'target-badge-place'">{{ r.target_type === 'review' ? '📋 Review' : '🏢 Place' }}</span>
                  <div class="target-name-row" v-if="r.target">
                    <img v-if="r.target.avatar_key" :src="avatarUrl(r.target.avatar_key)" class="target-logo" />
                    <span class="text-sm">{{ r.target.name }}</span>
                  </div>
                  <span v-else class="text-sm text-muted">{{ r.target_id }}</span>
                </div>
              </td>
              <td><span v-if="r.type" class="badge" :class="typeClass(r.type)">{{ r.type }}</span></td>
              <td v-if="filters.status === ''"><span class="badge" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td class="nowrap">
                <div class="date-cell">
                  <span class="text-sm">{{ fmtDateOnly(r.created_at) }}</span>
                  <span class="text-xs text-muted">{{ fmtTimeOnly(r.created_at) }}</span>
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-sm btn-ghost" @click.stop="openFinishModal(r)">{{ t('admin.report_list.finish_btn') }}</button>
                  <button class="btn btn-sm btn-ghost" @click.stop="open(r.id)">{{ t('admin.report_list.view_btn') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination v-if="totalPages > 1" :current="page" :total="totalPages" @go="load" />
    </template>

    <!-- User modal -->
    <div class="modal-overlay" v-if="userModal.open" @click="userModal.open = false">
      <div class="modal card" @click.stop>
        <div class="modal-user-info" v-if="userModal.user">
          <img v-if="userModal.user.avatar_key" :src="avatarUrl(userModal.user.avatar_key)" class="modal-avatar" />
          <div v-else class="modal-avatar avatar-placeholder">{{ initials(userModal.user.name) }}</div>
          <div>
            <div class="modal-user-name">{{ userModal.user.name }}</div>
            <div class="modal-user-username">@{{ userModal.user.username }}</div>
          </div>
        </div>
        <div v-if="modalError" class="error-msg">{{ modalError }}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="userModal.open = false">{{ t('admin.cancel') }}</button>
          <button class="btn btn-danger" :disabled="modalSubmitting" @click="doBlockUser">
            {{ modalSubmitting ? t('admin.saving') : t('admin.block_user') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Target modal -->
    <div class="modal-overlay" v-if="targetModal.open" @click="targetModal.open = false">
      <div class="modal card" @click.stop>
        <div v-if="targetModal.report">
          <span class="badge target-badge" :class="targetModal.report.target_type === 'review' ? 'target-badge-review' : 'target-badge-place'">
            {{ targetModal.report.target_type === 'review' ? '📋 Review' : '🏢 Place' }}
          </span>
          <div class="target-name-row mt-1" v-if="targetModal.report.target">
            <img v-if="targetModal.report.target.avatar_key" :src="avatarUrl(targetModal.report.target.avatar_key)" class="target-logo" />
            <span class="font-medium">{{ targetModal.report.target.name }}</span>
          </div>
          <p v-if="targetModal.report.target?.content" class="target-content-preview mt-1">{{ targetModal.report.target.content }}</p>
        </div>
        <div v-if="modalError" class="error-msg">{{ modalError }}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="targetModal.open = false">{{ t('admin.cancel') }}</button>
          <button class="btn btn-danger" :disabled="modalSubmitting" @click="doTargetAction">
            {{ modalSubmitting ? t('admin.saving') : targetModal.report?.target_type === 'review' ? t('admin.report_list.delete_review') : t('admin.report_list.suspend_place') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Finish modal -->
    <div class="modal-overlay" v-if="finishModal.open" @click="finishModal.open = false">
      <div class="modal card" @click.stop>
        <h3 class="modal-title">{{ t('admin.report_list.finish_title') }}</h3>
        <div class="modal-field">
          <label class="field-label">{{ t('admin.report_list.outcome') }}</label>
          <select v-model="finishModal.status" class="filter-select" style="width:100%">
            <option value="dismissed">{{ t('admin.dismissed') }}</option>
            <option value="actioned">{{ t('admin.actioned') }}</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="field-label">{{ t('admin.report_list.admin_response_label') }}</label>
          <textarea v-model="finishModal.admin_response" class="form-textarea" rows="3" :placeholder="t('admin.report_list.optional_note')" maxlength="1000"></textarea>
        </div>
        <div v-if="modalError" class="error-msg">{{ modalError }}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="finishModal.open = false">{{ t('admin.cancel') }}</button>
          <button class="btn btn-primary" :disabled="modalSubmitting" @click="doFinishReport">
            {{ modalSubmitting ? t('admin.saving') : t('admin.submit') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Pagination from '../../components/Pagination.vue'
import { listAdminReports, reviewAdminReport } from '../../api/adminReports.js'
import { adminBlockUser, adminSetPlaceStatus, adminDeleteReview } from '../../api/adminModeration.js'
import { staticUrl } from '../../api/client.js'
import { t } from '../../i18n/index.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)

const statuses = computed(() => [
  { value: '', label: t('admin.all') },
  { value: 'pending', label: t('admin.pending') },
  { value: 'in_progress', label: t('admin.report_list.in_progress') },
  { value: 'dismissed', label: t('admin.dismissed') },
  { value: 'actioned', label: t('admin.actioned') },
])

const filters = reactive({ status: 'pending', target_type: '', type: '' })
const counts = reactive({ pending: null, in_progress: null, dismissed: null, actioned: null })
const totalPages = computed(() => Math.ceil(total.value / limit))

// Modal state
const userModal = ref({ open: false, user: null })
const targetModal = ref({ open: false, report: null })
const finishModal = ref({ open: false, report: null, status: 'dismissed', admin_response: '' })
const modalSubmitting = ref(false)
const modalError = ref('')

function avatarUrl(key) { return staticUrl(key) }
function initials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }

function statusClass(s) {
  if (s === 'pending') return 'badge-warning'
  if (s === 'in_progress') return 'badge-primary'
  if (s === 'actioned') return 'badge-success'
  return 'badge-neutral'
}

function typeClass(t) {
  if (t === 'spam') return 'badge-spam'
  if (t === 'misleading') return 'badge-misleading'
  if (t === 'inappropriate') return 'badge-inappropriate'
  if (t === 'profanity') return 'badge-profanity'
  return 'badge-type'
}

function fmtDateOnly(d) { return d ? new Date(d).toLocaleDateString() : '' }
function fmtTimeOnly(d) { return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }

async function load(p = 1) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const res = await listAdminReports({ ...filters, page: p, limit })
    items.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function setStatus(s) {
  filters.status = s
  load(1)
}

function open(id) {
  router.push(`/admin/reports/${id}`)
}

async function loadCounts() {
  const keys = ['pending', 'in_progress', 'dismissed', 'actioned']
  const results = await Promise.allSettled(
    keys.map(s => listAdminReports({ status: s, limit: 1 }))
  )
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') counts[keys[i]] = r.value.total ?? 0
  })
}

// Modal openers
function openUserModal(user) {
  modalError.value = ''
  userModal.value = { open: true, user }
}

function openTargetModal(r) {
  if (!r.target) return
  modalError.value = ''
  targetModal.value = { open: true, report: r }
}

function openFinishModal(r) {
  modalError.value = ''
  finishModal.value = { open: true, report: r, status: 'dismissed', admin_response: '' }
}

async function doBlockUser() {
  modalSubmitting.value = true
  modalError.value = ''
  try {
    await adminBlockUser(userModal.value.user.id)
    userModal.value.open = false
    load(page.value)
  } catch (e) {
    modalError.value = e.message
  } finally {
    modalSubmitting.value = false
  }
}

async function doTargetAction() {
  modalSubmitting.value = true
  modalError.value = ''
  const r = targetModal.value.report
  try {
    if (r.target_type === 'review') {
      await adminDeleteReview(r.target_id)
    } else {
      await adminSetPlaceStatus(r.target_id, 'suspended')
    }
    targetModal.value.open = false
    load(page.value)
  } catch (e) {
    modalError.value = e.message
  } finally {
    modalSubmitting.value = false
  }
}

async function doFinishReport() {
  modalSubmitting.value = true
  modalError.value = ''
  const { report, status, admin_response } = finishModal.value
  try {
    await reviewAdminReport(report.id, { status, admin_response: admin_response || undefined })
    finishModal.value.open = false
    load(page.value)
    loadCounts()
  } catch (e) {
    modalError.value = e.message
  } finally {
    modalSubmitting.value = false
  }
}

onMounted(() => { load(1); loadCounts() })
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.view-title { font-size: 1.3rem; font-weight: 800; color: var(--text); }

.filter-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 16px;
}

.filter-tab {
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--transition);
}

.filter-tab:hover { color: var(--primary); }
.filter-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.filter-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 7px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.85rem;
  cursor: pointer;
}

.table-wrap { overflow-x: auto; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.admin-table th {
  text-align: left;
  padding: 11px 14px;
  background: var(--surface-2);
  font-weight: 600;
  color: var(--text-2);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.admin-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-light, var(--border));
  color: var(--text);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: var(--surface-2); }

/* User chip */
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  margin: -2px -4px;
  transition: background var(--transition);
}
.user-chip:hover { background: var(--border); }

.avatar {
  width: 28px;
  height: 28px;
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
  letter-spacing: 0.02em;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--text);
  font-size: 0.85rem;
  white-space: nowrap;
}

.user-username {
  font-size: 0.75rem;
  color: var(--text-2);
  white-space: nowrap;
}

/* Target cell */
.target-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  margin: -2px -4px;
  transition: background var(--transition);
}
.target-cell:hover { background: var(--border); }

.target-badge { font-size: 0.75rem; color: var(--text); }
.target-badge-review { background: rgba(99, 102, 241, 0.22); border: 1px solid rgba(99, 102, 241, 0.5); }
.target-badge-place  { background: rgba(13, 148, 136, 0.22); border: 1px solid rgba(13, 148, 136, 0.5); }

.target-name-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.target-logo {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  object-fit: cover;
  flex-shrink: 0;
}

/* Report text preview */
.text-cell { max-width: 160px; }
.report-text-preview {
  font-size: 0.8rem;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Date cell */
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.text-xs { font-size: 0.72rem; }

.nowrap { white-space: nowrap; }
.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }

.action-btns { display: flex; gap: 6px; align-items: center; }

.badge-warning      { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-primary      { background: rgba(13, 148, 136, 0.12); color: var(--primary); }
.badge-success      { background: rgba(34, 197, 94, 0.12);  color: #16a34a; }
.badge-neutral      { background: var(--surface-2);          color: var(--text-2); }
.badge-type         { background: rgba(99, 102, 241, 0.1);   color: #6366f1; }
.badge-spam         { background: rgba(239, 68, 68, 0.12);   color: #ef4444; }
.badge-misleading   { background: rgba(245, 158, 11, 0.12);  color: #d97706; }
.badge-inappropriate{ background: rgba(139, 92, 246, 0.12);  color: #7c3aed; }
.badge-profanity    { background: rgba(236, 72, 153, 0.12);  color: #db2777; }

.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

/* Modals */
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
  padding: 24px;
  max-width: 360px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: fadeUp 0.2s ease;
}

.modal-title { font-size: 1rem; font-weight: 700; }

.modal-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.modal-user-name { font-weight: 600; font-size: 0.95rem; }
.modal-user-username { font-size: 0.8rem; color: var(--text-2); }

.modal-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-2); }

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color var(--transition);
  box-sizing: border-box;
}
.form-textarea:focus { outline: none; border-color: var(--primary); }

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.error-msg {
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: #ef4444;
  font-size: 0.82rem;
}

.target-content-preview {
  font-size: 0.8rem;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.font-medium { font-weight: 600; }
.mt-1 { margin-top: 4px; }
</style>
