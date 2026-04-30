<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Claims</h2>
    </div>

    <div class="filter-row">
      <select v-model="filters.status" class="filter-select" @change="load(1)">
        <option value="">All statuses</option>
        <option value="0">Pending</option>
        <option value="1">Approved</option>
        <option value="2">Rejected</option>
      </select>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Place</th>
              <th>Phone</th>
              <th>Note</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-cell">No claims found.</td>
            </tr>
            <tr v-for="c in items" :key="c.id">
              <td class="font-medium">{{ c.user?.name || c.user_id }}</td>
              <td class="text-muted text-sm">{{ c.place?.name?.en || c.place_id }}</td>
              <td class="text-muted text-sm">{{ c.phone }}</td>
              <td class="td-note">{{ c.note || '—' }}</td>
              <td><span class="badge" :class="claimStatusClass(c.status)">{{ claimStatusLabel(c.status) }}</span></td>
              <td class="td-actions">
                <template v-if="c.status === 0">
                  <button class="btn btn-sm btn-primary" :disabled="submitting" @click="review(c, 1)">Approve</button>
                  <button class="btn btn-sm btn-ghost" :disabled="submitting" @click="review(c, 2)">Reject</button>
                </template>
                <span v-else class="text-muted text-sm">—</span>
              </td>
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
import { adminListClaims, adminReviewClaim } from '../../api/adminModeration.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const submitting = ref(false)
const filters = reactive({ status: '' })
const totalPages = computed(() => Math.ceil(total.value / limit))

function claimStatusLabel(s) {
  if (s === 0) return 'Pending'
  if (s === 1) return 'Approved'
  if (s === 2) return 'Rejected'
  return s
}

function claimStatusClass(s) {
  if (s === 0) return 'badge-warning'
  if (s === 1) return 'badge-success'
  return 'badge-neutral'
}

async function load(p = 1) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const res = await adminListClaims({ ...filters, page: p, limit })
    items.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function review(claim, status) {
  submitting.value = true
  try {
    await adminReviewClaim(claim.id, { status })
    claim.status = status
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

onMounted(() => load(1))
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.view-title { font-size: 1.3rem; font-weight: 800; color: var(--text); }

.filter-row { display: flex; gap: 10px; margin-bottom: 16px; }
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
}

.admin-table td {
  padding: 11px 14px;
  border-bottom: 1px solid var(--border-light, var(--border));
  color: var(--text);
  vertical-align: middle;
}

.admin-table tbody tr:last-child td { border-bottom: none; }
.admin-table tbody tr:hover { background: var(--surface-2); }

.td-note {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-2);
}

.td-actions { display: flex; gap: 8px; align-items: center; }

.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-warning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.font-medium { font-weight: 600; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 20px; }
.page-info { font-size: 0.85rem; color: var(--text-2); }
</style>
