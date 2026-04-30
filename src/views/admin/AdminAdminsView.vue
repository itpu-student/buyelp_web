<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Admins</h2>
      <span class="badge badge-neutral">Read-only in v1</span>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Power</th>
              <th>Created By</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="5" class="empty-cell">No admins found.</td>
            </tr>
            <tr v-for="a in items" :key="a.id">
              <td class="font-medium">{{ a.name }}</td>
              <td class="text-muted text-sm">{{ a.username }}</td>
              <td>
                <span class="power-badge" :class="powerClass(a.power)">{{ a.power }}</span>
              </td>
              <td class="text-muted text-sm">{{ a.created_by || '—' }}</td>
              <td class="text-sm text-muted">{{ fmtDate(a.created_at) }}</td>
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
import { ref, computed, onMounted } from 'vue'
import { adminListAdmins } from '../../api/adminAdmins.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / limit))

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

function powerClass(p) {
  if (p >= 80) return 'power-high'
  if (p >= 40) return 'power-mid'
  return 'power-low'
}

async function load(pg = 1) {
  loading.value = true
  error.value = ''
  page.value = pg
  try {
    const res = await adminListAdmins({ page: pg, limit })
    items.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => load(1))
</script>

<style scoped>
.view-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.view-title { font-size: 1.3rem; font-weight: 800; color: var(--text); }

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

.power-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
}

.power-high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.power-mid { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.power-low { background: var(--surface-2); color: var(--text-2); }

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
