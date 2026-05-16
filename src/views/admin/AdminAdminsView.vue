<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Admins</h2>
      <button class="btn btn-sm btn-primary" @click="openCreate">➕ New Admin</button>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="6" class="empty-cell">No admins found.</td>
            </tr>
            <tr v-for="a in items" :key="a.id">
              <td class="font-medium">{{ a.name }}</td>
              <td class="text-muted text-sm">{{ a.username }}</td>
              <td>
                <span class="power-badge" :class="powerClass(a.power)">{{ a.power }}</span>
              </td>
              <td class="text-muted text-sm">{{ a.created_by || '—' }}</td>
              <td class="text-sm text-muted">{{ fmtDate(a.created_at) }}</td>
              <td class="action-cell">
                <button
                  v-if="canEdit(a)"
                  class="btn btn-xs btn-ghost"
                  @click="openEdit(a)"
                >Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination v-if="totalPages > 1" :current="page" :total="totalPages" @go="load" />
    </template>

    <!-- Modal -->
    <div v-if="modal.open" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modal.mode === 'create' ? 'New Admin' : 'Edit Admin' }}</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="submitModal" class="modal-body">
          <label class="field">
            <span>Name</span>
            <input v-model="form.name" required placeholder="Full name" />
          </label>

          <label v-if="modal.mode === 'create'" class="field">
            <span>Username</span>
            <input v-model="form.username" required placeholder="username" autocomplete="off" />
          </label>

          <label class="field">
            <span>Password{{ modal.mode === 'edit' ? ' (leave blank to keep)' : '' }}</span>
            <input v-model="form.password" type="password" :required="modal.mode === 'create'" autocomplete="new-password" />
          </label>

          <label class="field">
            <span>Power (0–{{ maxPower }})</span>
            <input v-model.number="form.power" type="number" min="0" :max="maxPower" required />
          </label>

          <div class="modal-actions">
            <button type="button" class="btn btn-sm btn-ghost" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-sm btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : modal.mode === 'create' ? 'Create' : 'Save' }}
            </button>
          </div>

          <p v-if="modalError" class="modal-error">{{ modalError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import Pagination from '../../components/Pagination.vue'
import { adminListAdmins, adminCreateAdmin, adminEditAdmin } from '../../api/adminAdmins.js'
import { adminStore } from '../../store/adminStore.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / limit))

const myPower = computed(() => adminStore.admin?.power ?? 0)
const maxPower = computed(() => Math.max(0, myPower.value - 1))

const modal = reactive({ open: false, mode: 'create', target: null })
const form = reactive({ name: '', username: '', password: '', power: 0 })
const saving = ref(false)
const modalError = ref('')

function canEdit(a) {
  return a.power < myPower.value
}

function openCreate() {
  modal.mode = 'create'
  modal.target = null
  Object.assign(form, { name: '', username: '', password: '', power: 0 })
  modalError.value = ''
  modal.open = true
}

function openEdit(a) {
  modal.mode = 'edit'
  modal.target = a
  Object.assign(form, { name: a.name, username: a.username, password: '', power: a.power })
  modalError.value = ''
  modal.open = true
}

function closeModal() {
  modal.open = false
}

async function submitModal() {
  saving.value = true
  modalError.value = ''
  try {
    if (modal.mode === 'create') {
      const body = { name: form.name, username: form.username, password: form.password, power: form.power }
      await adminCreateAdmin(body)
    } else {
      const body = { name: form.name, power: form.power }
      if (form.password) body.password = form.password
      await adminEditAdmin(modal.target.id, body)
    }
    closeModal()
    await load(page.value)
  } catch (e) {
    modalError.value = e.message
  } finally {
    saving.value = false
  }
}

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

.action-cell { text-align: right; width: 60px; }

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

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.font-medium { font-weight: 600; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  width: 360px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }

.btn-close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-2);
  padding: 0 4px;
  line-height: 1;
}
.btn-close:hover { color: var(--text); }

.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; font-size: 0.85rem; color: var(--text-2); font-weight: 500; }
.field input {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  font-size: 0.875rem;
  outline: none;
}
.field input:focus { border-color: var(--primary, #0d9488); }

.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

.modal-error { color: #ef4444; font-size: 0.8rem; margin: 0; }

.btn-xs { padding: 3px 10px; font-size: 0.78rem; }
</style>
