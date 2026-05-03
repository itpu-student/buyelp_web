<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Reports</h2>
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
        <option value="">All targets</option>
        <option value="review">Review</option>
        <option value="place">Place</option>
      </select>
      <select v-model="filters.type" class="filter-select" @change="load(1)">
        <option value="">All types</option>
        <option value="spam">Spam</option>
        <option value="misleading">Misleading</option>
        <option value="inappropriate">Inappropriate</option>
        <option value="profanity">Profanity</option>
      </select>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Text</th>
              <th>Reported User</th>
              <th>Target</th>
              <th>Type</th>
              <th v-if="filters.status === ''">Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td :colspan="filters.status === '' ? 8 : 7" class="empty-cell">No reports found.</td>
            </tr>
            <tr v-for="r in items" :key="r.id" class="clickable-row" @click="open(r.id)">
              <td>
                <div class="user-chip" v-if="r.reporter_user">
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
                <div class="user-chip" v-if="r.reported_user">
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
                <div class="target-cell">
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
              <td><button class="btn btn-sm btn-ghost" @click.stop="open(r.id)">View →</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="total > limit">
        <button class="btn btn-sm btn-ghost" :disabled="page === 1" @click="load(page - 1)">← Prev</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="load(page + 1)">Next →</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listAdminReports } from '../../api/adminReports.js'
import { staticUrl } from '../../api/client.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)

const statuses = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
]

const filters = reactive({ status: 'pending', target_type: '', type: '' })
const counts = reactive({ pending: null, in_progress: null, dismissed: null, actioned: null })
const totalPages = computed(() => Math.ceil(total.value / limit))

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
}

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
}

.target-badge { font-size: 0.75rem; }
.target-badge-review { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
.target-badge-place  { background: rgba(13, 148, 136, 0.12); color: var(--primary); }

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

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.page-info { font-size: 0.85rem; color: var(--text-2); }
</style>
