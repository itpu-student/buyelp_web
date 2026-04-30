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
        {{ s.label }}
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
              <th>Target</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-cell">No reports found.</td>
            </tr>
            <tr v-for="r in items" :key="r.id" class="clickable-row" @click="open(r.id)">
              <td>{{ r.reporter?.name || r.user_id }}</td>
              <td>
                <span class="badge badge-neutral">{{ r.target_type }}</span>
                <span class="text-sm text-muted ml-1">{{ r.target?.name || r.target_id }}</span>
              </td>
              <td><span v-if="r.type" class="badge badge-neutral">{{ r.type }}</span></td>
              <td><span class="badge" :class="statusClass(r.status)">{{ r.status }}</span></td>
              <td class="text-sm text-muted">{{ fmtDate(r.created_at) }}</td>
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

const router = useRouter()
const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'actioned', label: 'Actioned' },
]

const filters = reactive({ status: 'pending', target_type: '', type: '' })
const totalPages = computed(() => Math.ceil(total.value / limit))

function statusClass(s) {
  if (s === 'pending') return 'badge-warning'
  if (s === 'in_progress') return 'badge-primary'
  if (s === 'actioned') return 'badge-success'
  return 'badge-neutral'
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

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

onMounted(() => load(1))
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
  padding: 11px 14px;
  border-bottom: 1px solid var(--border-light, var(--border));
  color: var(--text);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td { border-bottom: none; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: var(--surface-2); }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }

.badge-warning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-primary { background: rgba(13, 148, 136, 0.12); color: var(--primary); }
.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }

.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }
.ml-1 { margin-left: 4px; }

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
