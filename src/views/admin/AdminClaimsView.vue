<template>
  <div>
    <div class="view-header">
      <h2 class="view-title">{{ t('admin.claim_list.title') }}</h2>
    </div>

    <!-- Status filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="s in statuses"
        :key="s.value"
        class="filter-tab"
        :class="{ active: filterStatus === s.value }"
        @click="setStatus(s.value)"
      >
        {{ s.label }}{{ counts[s.value] != null ? ` (${counts[s.value]})` : '' }}
      </button>
    </div>

    <div v-if="loading" class="state-msg">{{ t('admin.loading') }}</div>
    <div v-else-if="error" class="state-msg error">{{ error }}</div>
    <template v-else>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.claim_list.col_user') }}</th>
              <th>{{ t('admin.claim_list.col_place') }}</th>
              <th>{{ t('admin.claim_list.col_phone') }}</th>
              <th>{{ t('admin.claim_list.col_note') }}</th>
              <th>{{ t('admin.status') }}</th>
              <th>{{ t('admin.claim_list.col_date') }}</th>
              <th>{{ t('admin.claim_list.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="7" class="empty-cell">{{ t('admin.claim_list.empty') }}</td>
            </tr>
            <tr v-for="c in items" :key="c.id">
              <td>
                <div class="user-chip" v-if="c.user" @click="openUserModal(c.user)">
                  <img v-if="c.user.avatar_key" :src="avatarUrl(c.user.avatar_key)" class="avatar" />
                  <div v-else class="avatar avatar-placeholder">{{ initials(c.user.name) }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ c.user.name }}</span>
                    <span class="user-username">@{{ c.user.username }}</span>
                  </div>
                </div>
                <span v-else class="text-muted text-sm">{{ c.user_id }}</span>
              </td>
              <td>
                <div class="place-chip" v-if="c.place" @click="openPlaceModal(c.place)">
                  <img v-if="c.place.logo_key" :src="avatarUrl(c.place.logo_key)" class="place-logo" />
                  <div class="place-info">
                    <span class="place-name">{{ c.place.name }}</span>
                    <span class="place-slug">{{ c.place.slug }}</span>
                  </div>
                </div>
                <span v-else class="text-muted text-sm">{{ c.place_id }}</span>
              </td>
              <td class="text-sm text-muted nowrap">{{ c.phone }}</td>
              <td class="td-note">{{ c.note || '—' }}</td>
              <td><span class="badge" :class="statusClass(c.status)">{{ c.status }}</span></td>
              <td class="text-sm text-muted nowrap">{{ fmtDate(c.created_at) }}</td>
              <td>
                <div class="action-btns">
                  <template v-if="c.status === 'pending'">
                    <button class="btn btn-sm btn-primary" :disabled="submitting === c.id" @click="doAction(c, 'approved')">{{ t('admin.approve') }}</button>
                    <button class="btn btn-sm btn-ghost" :disabled="submitting === c.id" @click="doAction(c, 'rejected')">{{ t('admin.reject') }}</button>
                  </template>
                  <template v-else-if="c.status === 'rejected'">
                    <button class="btn btn-sm btn-primary" :disabled="submitting === c.id" @click="doAction(c, 'approved')">{{ t('admin.approve') }}</button>
                  </template>
                  <span v-else class="text-muted text-sm">—</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination v-if="totalPages > 1" :current="page" :total="totalPages" @go="load" />
    </template>

    <!-- User info modal -->
    <div class="modal-overlay" v-if="userModal" @click="userModal = null">
      <div class="modal card" @click.stop>
        <div class="modal-entity-row">
          <img v-if="userModal.avatar_key" :src="avatarUrl(userModal.avatar_key)" class="modal-avatar" />
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
          <button class="btn btn-ghost" @click="userModal = null">{{ t('admin.close') }}</button>
        </div>
      </div>
    </div>

    <!-- Place info modal -->
    <div class="modal-overlay" v-if="placeModal" @click="placeModal = null">
      <div class="modal card" @click.stop>
        <div class="modal-entity-row">
          <img v-if="placeModal.logo_key" :src="avatarUrl(placeModal.logo_key)" class="modal-place-logo" />
          <div class="modal-entity-info">
            <div class="modal-entity-name">{{ placeModal.name }}</div>
            <div class="modal-entity-sub">{{ placeModal.slug }}</div>
          </div>
          <a :href="`/place/${placeModal.slug}`" target="_blank" class="btn btn-sm btn-ghost link-btn" title="Open place">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <div class="modal-place-meta">
          <div v-if="placeModal.address?.en" class="meta-row">
            <span class="meta-label">{{ t('admin.review_list.col_address') }}</span>
            <span>{{ placeModal.address.en }}</span>
          </div>
          <div v-if="placeModal.phone" class="meta-row">
            <span class="meta-label">{{ t('admin.review_list.col_phone') }}</span>
            <span>{{ placeModal.phone }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('admin.review_list.col_avg_rating') }}</span>
            <span>{{ placeModal.avg_rating }}★</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('admin.review_list.col_reviews') }}</span>
            <span>{{ placeModal.review_count }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="placeModal = null">{{ t('admin.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Pagination from '../../components/Pagination.vue'
import { adminListClaims, adminReviewClaim } from '../../api/adminModeration.js'
import { staticUrl } from '../../api/client.js'
import { t } from '../../i18n/index.js'

const loading = ref(false)
const error = ref('')
const items = ref([])
const page = ref(1)
const limit = 20
const total = ref(0)
const submitting = ref(null)
const filterStatus = ref('pending')
const userModal = ref(null)
const placeModal = ref(null)
const totalPages = computed(() => Math.ceil(total.value / limit))

const statuses = computed(() => [
  { value: '', label: t('admin.all') },
  { value: 'pending', label: t('admin.pending') },
  { value: 'approved', label: t('admin.approved') },
  { value: 'rejected', label: t('admin.rejected') },
])

const counts = ref({ pending: null, approved: null, rejected: null })

function avatarUrl(key) { return staticUrl(key) }
function initials(name) { return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '' }

function statusClass(s) {
  if (s === 'pending') return 'badge-warning'
  if (s === 'approved') return 'badge-success'
  return 'badge-neutral'
}

function openUserModal(user) { userModal.value = user }
function openPlaceModal(place) { placeModal.value = place }

async function load(p = 1) {
  loading.value = true
  error.value = ''
  page.value = p
  try {
    const params = { page: p, limit }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await adminListClaims(params)
    items.value = res.items || []
    total.value = res.total || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadCounts() {
  const keys = ['pending', 'approved', 'rejected']
  const results = await Promise.allSettled(
    keys.map(s => adminListClaims({ status: s, limit: 1 }))
  )
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') counts.value[keys[i]] = r.value.total ?? 0
  })
}

function setStatus(s) {
  filterStatus.value = s
  load(1)
}

async function doAction(claim, newStatus) {
  submitting.value = claim.id
  try {
    await adminReviewClaim(claim.id, { status: newStatus })
    claim.status = newStatus
    loadCounts()
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = null
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

.td-note {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-2);
  font-size: 0.85rem;
}

.action-btns { display: flex; gap: 6px; align-items: center; }

.empty-cell { text-align: center; color: var(--text-2); padding: 32px !important; }
.text-sm { font-size: 0.8rem; }
.text-muted { color: var(--text-2); }
.nowrap { white-space: nowrap; }

.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

/* Badges */
.badge-success  { background: rgba(34, 197, 94, 0.12);  color: #16a34a; }
.badge-warning  { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.badge-neutral  { background: var(--surface-2);          color: var(--text-2); }
.badge-danger   { background: rgba(239, 68, 68, 0.12);  color: #ef4444; }

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

.user-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.user-name { font-weight: 600; color: var(--text); font-size: 0.85rem; white-space: nowrap; }
.user-username { font-size: 0.75rem; color: var(--text-2); white-space: nowrap; }

/* Place chip */
.place-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  margin: -2px -4px;
  transition: background var(--transition);
}
.place-chip:hover { background: var(--border); }

.place-logo { width: 20px; height: 20px; border-radius: 3px; object-fit: cover; flex-shrink: 0; }
.place-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.place-name { font-weight: 600; color: var(--text); font-size: 0.85rem; white-space: nowrap; }
.place-slug { font-size: 0.75rem; color: var(--text-2); white-space: nowrap; }

/* Modal */
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
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

.modal-entity-row { display: flex; align-items: center; gap: 12px; }

.modal-avatar {
  width: 44px; height: 44px;
  border-radius: 50%; object-fit: cover; flex-shrink: 0;
}

.modal-place-logo {
  width: 44px; height: 44px;
  border-radius: 6px; object-fit: cover; flex-shrink: 0;
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

.modal-place-meta { display: flex; flex-direction: column; gap: 6px; font-size: 0.875rem; }
.meta-row { display: flex; gap: 8px; align-items: baseline; }
.meta-label {
  font-size: 0.75rem; font-weight: 600; color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.04em; min-width: 72px;
}
</style>
