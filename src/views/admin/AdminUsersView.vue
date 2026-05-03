<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Users</h2>
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
              <th>Phone</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-cell">No users found.</td>
            </tr>
            <tr v-for="u in items" :key="u.id">
              <td class="font-medium">{{ u.name }}</td>
              <td class="text-muted text-sm">{{ u.username || '—' }}</td>
              <td class="text-muted text-sm">{{ u.phone || '—' }}</td>
              <td class="text-sm text-muted">{{ fmtDate(u.created_at) }}</td>
              <td>
                <span class="badge" :class="u.blocked ? 'badge-danger' : 'badge-success'">
                  {{ u.blocked ? 'Blocked' : 'Active' }}
                </span>
              </td>
              <td>
                <button
                  v-if="!u.blocked"
                  class="btn btn-sm btn-danger"
                  @click="promptBlock(u)"
                >
                  Block
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-ghost"
                  :disabled="submitting"
                  @click="unblockUser(u)"
                >
                  Unblock
                </button>
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

    <!-- Block confirmation modal -->
    <div class="modal-overlay" v-if="blockTarget" @click="blockTarget = null">
      <div class="modal card" @click.stop>
        <h3>Block User</h3>
        <p>Block <strong>{{ blockTarget.name }}</strong>? They will lose access to their account.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="blockTarget = null">Cancel</button>
          <button class="btn btn-danger" :disabled="submitting" @click="confirmBlock">
            {{ submitting ? 'Blocking…' : 'Block User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminListUsers, adminBlockUser, adminUnblockUser } from '../../api/adminModeration.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const submitting = ref(false)
const blockTarget = ref(null)
const totalPages = computed(() => Math.ceil(total.value / limit))

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

async function load(p = 1) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const res = await adminListUsers({ page: p, limit })
    items.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function promptBlock(u) {
  blockTarget.value = u
}

async function confirmBlock() {
  submitting.value = true
  try {
    await adminBlockUser(blockTarget.value.id)
    blockTarget.value.blocked = true
    blockTarget.value = null
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

async function unblockUser(u) {
  submitting.value = true
  try {
    await adminUnblockUser(u.id)
    u.blocked = false
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

.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.font-medium { font-weight: 600; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 20px; }
.page-info { font-size: 0.85rem; color: var(--text-2); }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; backdrop-filter: blur(4px);
}
.modal {
  padding: 28px; max-width: 380px; width: 90%;
  display: flex; flex-direction: column; gap: 16px;
  animation: fadeUp 0.2s ease;
}
.modal h3 { font-size: 1.1rem; font-weight: 700; }
.modal p { font-size: 0.9rem; color: var(--text-2); }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
