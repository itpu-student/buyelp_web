<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">Places</h2>
    </div>

    <!-- Status filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="filter-tab"
        :class="{ active: filters.status === s.value }"
        @click="setTab(s.value)"
      >
        {{ s.label }}
      </button>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Place</th>
              <th>Category</th>
              <th>Info</th>
              <th>Status</th>
              <th>Claimed By</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <TransitionGroup tag="tbody" name="row">
            <tr key="__empty" v-if="items.length === 0">
              <td colspan="7" class="empty-cell">No places found.</td>
            </tr>
            <tr v-for="p in items" :key="p.id">
              <td>
                <div class="place-chip">
                  <img v-if="p.logo_key" :src="staticUrl(p.logo_key)" class="place-logo" />
                  <div class="place-info">
                    <span class="place-name">{{ p.name }}</span>
                    <span class="place-slug">{{ p.slug }}</span>
                  </div>
                </div>
              </td>
              <td class="text-sm text-muted">{{ categoryEmoji(categoriesState.byId[p.category_id]?.slug) }} {{ categoryName(categoriesState.byId[p.category_id]?.name) }}</td>
              <td>
                <div class="info-cell">
                  <span class="text-sm">{{ p.phone || '—' }}</span>
                  <span class="text-xs text-muted">{{ p.avg_rating }}★ · {{ p.review_count }} reviews</span>
                </div>
              </td>
              <td><span class="badge" :class="statusClass(p.status)">{{ p.status }}</span></td>
              <td>
                <div class="user-chip" v-if="p.is_claimed && p.claimed_by_user" @click="openUserModal(p.claimed_by_user)">
                  <img v-if="p.claimed_by_user.avatar_key" :src="staticUrl(p.claimed_by_user.avatar_key)" class="avatar" />
                  <div v-else class="avatar avatar-placeholder">{{ initials(p.claimed_by_user.name) }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ p.claimed_by_user.name }}</span>
                    <span class="user-username">@{{ p.claimed_by_user.username }}</span>
                  </div>
                </div>
                <span v-else class="text-muted text-sm">—</span>
              </td>
              <td class="nowrap">
                <div class="date-cell">
                  <span class="text-sm">{{ fmtDateOnly(p.created_at) }}</span>
                  <span class="text-xs text-muted">{{ fmtTimeOnly(p.created_at) }}</span>
                </div>
              </td>
              <td class="td-actions">
                <button
                  v-if="p.status !== 'approved'"
                  class="btn btn-sm btn-success"
                  :disabled="actionTarget === p.id"
                  @click="setStatus(p, 'approved')"
                >Approve</button>
                <button
                  v-if="p.status !== 'rejected' && p.status !== 'suspended'"
                  class="btn btn-sm btn-danger"
                  :disabled="actionTarget === p.id"
                  @click="setStatus(p, 'rejected')"
                >Reject</button>
              </td>
            </tr>
          </TransitionGroup>
        </table>
      </div>

      <div class="pagination" v-if="total > limit">
        <button class="btn btn-sm btn-ghost" :disabled="page === 1" @click="load(page - 1)">← Prev</button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-ghost" :disabled="page >= totalPages" @click="load(page + 1)">Next →</button>
      </div>
    </template>

    <!-- User info modal -->
    <div class="modal-overlay" v-if="userModal" @click="userModal = null">
      <div class="modal modal-sm card" @click.stop>
        <div class="modal-entity-row">
          <img v-if="userModal.avatar_key" :src="staticUrl(userModal.avatar_key)" class="modal-avatar" />
          <div v-else class="modal-avatar avatar-placeholder">{{ initials(userModal.name) }}</div>
          <div class="modal-entity-info">
            <div class="modal-entity-name">{{ userModal.name }}</div>
            <div class="modal-entity-sub">@{{ userModal.username }}</div>
          </div>
          <a :href="`/u/${userModal.username}`" target="_blank" class="btn btn-sm btn-ghost link-btn" title="Open profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="userModal = null">Close</button>
        </div>
      </div>
    </div>

    <!-- Edit modal -->
    <div class="modal-overlay" v-if="editTarget" @click="editTarget = null">
      <div class="modal card modal-wide" @click.stop>
        <div class="modal-header">
          <h3>Edit Place</h3>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="field field-full">
              <label>Name</label>
              <input v-model="editForm.name" type="text" class="input" />
            </div>

            <div class="field field-full">
              <label>Phone</label>
              <input v-model="editForm.phone" type="text" class="input" />
            </div>

            <div class="field">
              <label>Address (EN)</label>
              <input v-model="editForm.address.en" type="text" class="input" />
            </div>
            <div class="field">
              <label>Address (UZ)</label>
              <input v-model="editForm.address.uz" type="text" class="input" />
            </div>

            <div class="field">
              <label>Description (EN)</label>
              <textarea v-model="editForm.description.en" class="input" rows="3"></textarea>
            </div>
            <div class="field">
              <label>Description (UZ)</label>
              <textarea v-model="editForm.description.uz" class="input" rows="3"></textarea>
            </div>

            <div class="field">
              <label>Category</label>
              <select v-model="editForm.category_id" class="input">
                <option value="">— select —</option>
                <option v-for="c in categoriesState.list" :key="c.id" :value="c.id">
                  {{ categoryName(c.name) }}
                </option>
              </select>
            </div>

            <div class="field">
              <!-- spacer -->
            </div>

            <div class="field">
              <label>Latitude</label>
              <input v-model.number="editForm.lat" type="number" step="any" class="input" />
            </div>
            <div class="field">
              <label>Longitude</label>
              <input v-model.number="editForm.lon" type="number" step="any" class="input" />
            </div>

            <div class="field field-full">
              <label>Logo</label>
              <div class="file-row">
                <img v-if="editForm.logo_key" :src="staticUrl(editForm.logo_key)" class="thumb" alt="logo" />
                <input type="file" accept="image/*" @change="onLogoChange" />
              </div>
            </div>

            <div class="field field-full">
              <label>Images</label>
              <div class="images-row">
                <div v-for="(key, idx) in editForm.images" :key="key" class="img-thumb-wrap">
                  <img :src="staticUrl(key)" class="thumb" alt="" />
                  <button class="thumb-remove" @click="editForm.images.splice(idx, 1)">×</button>
                </div>
              </div>
              <input type="file" accept="image/*" multiple @change="onImagesChange" />
              <div v-if="editForm._newImages.length" class="text-sm text-muted">
                {{ editForm._newImages.length }} new image(s) queued
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div v-if="editError" class="edit-error">{{ editError }}</div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="editTarget = null">Cancel</button>
            <button class="btn btn-primary" :disabled="editSubmitting" @click="submitEdit">
              {{ editSubmitting ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminListPlaces, adminSetPlaceStatus, adminUpdatePlace } from '../../api/adminModeration.js'
import { categoriesState, ensureCategoriesLoaded } from '../../store/categories.js'
import { uploadFile } from '../../api/files.js'
import { staticUrl } from '../../api/client.js'
import { i18nState } from '../../i18n/index.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const actionTarget = ref(null)
const userModal = ref(null)

const filters = reactive({ status: 'pending' })
const totalPages = computed(() => Math.ceil(total.value / limit))

const statuses = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
]

// Edit modal state
const editTarget = ref(null)
const editSubmitting = ref(false)
const editError = ref('')
const editForm = reactive({
  name: '',
  phone: '',
  address: { en: '', uz: '' },
  description: { en: '', uz: '' },
  category_id: '',
  lat: 0,
  lon: 0,
  logo_key: '',
  images: [],
  _logoFile: null,
  _newImages: [],
})

const CATEGORY_ICONS = { restaurants: '🍽️', auto: '🚗', health: '🏥', activities: '🏔️', sports: '⚽', tabiat: '🌿' }
function categoryEmoji(slug) { return CATEGORY_ICONS[slug] || '📍' }

function categoryName(val) {
  if (!val) return ''
  if (typeof val === 'object') return val[i18nState.locale] || val.en || ''
  return val
}

function statusClass(s) {
  if (s === 'approved') return 'badge-success'
  if (s === 'rejected') return 'badge-danger'
  if (s === 'pending') return 'badge-warning'
  if (s === 'suspended') return 'badge-suspended'
  return 'badge-neutral'
}

function initials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
function openUserModal(user) { userModal.value = user }
function fmtDateOnly(d) { return d ? new Date(d).toLocaleDateString() : '' }
function fmtTimeOnly(d) { return d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '' }

async function load(p = 1) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const params = { page: p, limit }
    if (filters.status) params.status = filters.status
    const res = await adminListPlaces(params)
    items.value = res.items || res || []
    total.value = res.total || items.value.length
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function setTab(status) {
  filters.status = status
  load(1)
}

async function setStatus(place, status) {
  actionTarget.value = place.id
  try {
    await adminSetPlaceStatus(place.id, status)
    items.value = items.value.filter(p => p.id !== place.id)
  } catch (e) {
    error.value = e.message
    actionTarget.value = null
  }
}

function openEdit(place) {
  editTarget.value = place
  editError.value = ''
  editForm.name = place.name || ''
  editForm.phone = place.phone || ''
  editForm.address = { en: place.address?.en || '', uz: place.address?.uz || '' }
  editForm.description = { en: place.description?.en || '', uz: place.description?.uz || '' }
  editForm.category_id = place.category_id || ''
  editForm.lat = place.lat || 0
  editForm.lon = place.lon || 0
  editForm.logo_key = place.logo_key || ''
  editForm.images = [...(place.images || [])]
  editForm._logoFile = null
  editForm._newImages = []
}

function onLogoChange(e) {
  editForm._logoFile = e.target.files[0] || null
}

function onImagesChange(e) {
  editForm._newImages = Array.from(e.target.files)
}

async function submitEdit() {
  editSubmitting.value = true
  editError.value = ''
  try {
    let logo_key = editForm.logo_key
    if (editForm._logoFile) {
      const r = await uploadFile(editForm._logoFile, 'place', { adminAuth: true })
      logo_key = r.key
    }

    const newImageKeys = await Promise.all(
      editForm._newImages.map(f => uploadFile(f, 'place', { adminAuth: true }).then(r => r.key))
    )

    const payload = {
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      description: editForm.description,
      category_id: editForm.category_id,
      lat: editForm.lat,
      lon: editForm.lon,
      logo_key,
      images: [...editForm.images, ...newImageKeys],
    }

    const updated = await adminUpdatePlace(editTarget.value.id, payload)
    const idx = items.value.findIndex(p => p.id === editTarget.value.id)
    if (idx >= 0) items.value[idx] = { ...items.value[idx], ...(updated || payload) }
    editTarget.value = null
  } catch (e) {
    editError.value = e.message
  } finally {
    editSubmitting.value = false
  }
}

onMounted(() => {
  load(1)
  ensureCategoriesLoaded()
})
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
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  cursor: pointer;
}

.filter-tab:hover { color: var(--primary); }
.filter-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

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
.admin-table tbody tr:hover { background: var(--surface-2); }

/* Row leave animation */
.row-leave-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.row-leave-to { opacity: 0; transform: translateX(16px); }

.td-actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.badge-success { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.badge-warning { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.badge-suspended { background: rgba(249, 115, 22, 0.12); color: #ea580c; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }

.btn-success { background: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.3); }
.btn-success:hover:not(:disabled) { background: rgba(34, 197, 94, 0.25); }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.font-medium { font-weight: 600; }
.text-sm { font-size: 0.8rem; }
.text-xs { font-size: 0.72rem; }
.text-muted { color: var(--text-2); }
.nowrap { white-space: nowrap; }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 20px; }
.page-info { font-size: 0.85rem; color: var(--text-2); }

/* Place chip */
.place-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}

.place-logo {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.place-name {
  font-weight: 600;
  color: var(--text);
  font-size: 0.85rem;
  white-space: nowrap;
}

.place-slug {
  font-size: 0.75rem;
  color: var(--text-2);
  white-space: nowrap;
}

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

/* Info cell */
.info-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* Date cell */
.date-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* User modal entity layout */
.modal-entity-row { display: flex; align-items: center; gap: 12px; }
.modal-avatar {
  width: 44px; height: 44px;
  border-radius: 50%; object-fit: cover; flex-shrink: 0;
}
.modal-entity-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.modal-entity-name { font-weight: 700; font-size: 1rem; color: var(--text); }
.modal-entity-sub { font-size: 0.8rem; color: var(--text-2); }
.link-btn {
  display: flex; align-items: center; justify-content: center;
  padding: 6px; margin-left: auto; flex-shrink: 0;
  text-decoration: none; color: var(--text-2);
}
.link-btn:hover { color: var(--text); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; backdrop-filter: blur(4px);
  overflow: hidden;
}

.modal {
  display: flex; flex-direction: column;
  animation: fadeUp 0.2s ease;
  padding: 0;
}

.modal-sm {
  padding: 28px; max-width: 380px; width: 90%; gap: 16px;
}

.modal-wide {
  max-width: 620px; width: 90%;
  max-height: 88vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  display: flex; flex-direction: column; gap: 8px;
}

.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field { display: flex; flex-direction: column; gap: 5px; }
.field-full { grid-column: 1 / -1; }

label { font-size: 0.78rem; font-weight: 600; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.04em; }

.input {
  padding: 8px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
}

textarea.input { resize: vertical; font-family: inherit; }

.file-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.images-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }

.thumb { width: 56px; height: 56px; object-fit: cover; border-radius: var(--radius-sm); border: 1px solid var(--border); }

.img-thumb-wrap { position: relative; display: inline-block; }
.thumb-remove {
  position: absolute; top: -6px; right: -6px;
  background: #ef4444; color: #fff; border: none;
  border-radius: 50%; width: 18px; height: 18px;
  font-size: 12px; line-height: 18px; text-align: center;
  cursor: pointer; padding: 0;
}

.edit-error { color: #ef4444; font-size: 0.85rem; }
</style>
