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
              <th>User</th>
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
              <td>
                <div class="user-cell">
                  <div class="avatar" :style="avatarStyle(u)">
                    <span v-if="!u.avatar_key">{{ initials(u.name) }}</span>
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ u.name || '—' }}</span>
                  </div>
                </div>
              </td>
              <td class="text-muted text-sm">{{ u.username ? '@' + u.username : '—' }}</td>
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
                  @click="confirmTarget = { user: u, action: 'block' }"
                >
                  Block
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-ghost"
                  @click="confirmTarget = { user: u, action: 'unblock' }"
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

    <!-- Confirm modal -->
    <div class="modal-overlay" v-if="confirmTarget" @click="confirmTarget = null">
      <div class="modal card" @click.stop>
        <div class="modal-user-preview">
          <div class="avatar avatar-lg" :style="avatarStyle(confirmTarget.user)">
            <span v-if="!confirmTarget.user.avatar_key">{{ initials(confirmTarget.user.name) }}</span>
          </div>
          <div class="modal-user-info">
            <span class="user-name">{{ confirmTarget.user.name }}</span>
            <span class="user-username text-muted text-sm">{{ confirmTarget.user.username ? '@' + confirmTarget.user.username : '' }}</span>
          </div>
        </div>
        <h3>{{ confirmTarget.action === 'block' ? 'Block User?' : 'Unblock User?' }}</h3>
        <p>{{ confirmTarget.action === 'block'
          ? 'This user will lose access to their account.'
          : 'This user will regain access to their account.' }}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="confirmTarget = null">Cancel</button>
          <button
            :class="confirmTarget.action === 'block' ? 'btn btn-danger' : 'btn btn-success'"
            :disabled="submitting"
            @click="executeAction"
          >
            {{ submitting ? '…' : (confirmTarget.action === 'block' ? 'Block' : 'Unblock') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminListUsers, adminBlockUser, adminUnblockUser } from '../../api/adminModeration.js'
import { staticUrl } from '../../api/client.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const submitting = ref(false)
const confirmTarget = ref(null)
const totalPages = computed(() => Math.ceil(total.value / limit))

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString()
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function avatarStyle(u) {
  if (!u.avatar_key) return {}
  return { backgroundImage: `url(${staticUrl(u.avatar_key)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
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

async function executeAction() {
  if (!confirmTarget.value) return
  const { user, action } = confirmTarget.value
  submitting.value = true
  try {
    if (action === 'block') {
      await adminBlockUser(user.id)
      user.blocked = true
    } else {
      await adminUnblockUser(user.id)
      user.blocked = false
    }
    confirmTarget.value = null
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

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-info { display: flex; flex-direction: column; gap: 2px; }
.user-name { font-weight: 600; }

.avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
  color: var(--text-2);
  flex-shrink: 0;
}
.avatar-lg { width: 48px; height: 48px; font-size: 1rem; }

.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 20px; }
.page-info { font-size: 0.85rem; color: var(--text-2); }

.btn-success { background: #16a34a; color: #fff; }
.btn-success:hover { background: #15803d; }

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

.modal-user-preview {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; background: var(--surface-2); border-radius: var(--radius-md);
}
.modal-user-info { display: flex; flex-direction: column; gap: 2px; }
</style>
