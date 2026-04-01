<template>
  <div class="page-content">
    <div class="container">
      <div class="admin-header">
        <h1 class="section-title">{{ t('admin.title') }}</h1>
        <p class="text-muted text-sm mt-2">Manage business listings, reviews, and users.</p>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="admin-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── Businesses tab ── -->
      <div v-if="activeTab === 'businesses'" class="admin-panel">
        <div class="panel-header">
          <span>{{ t('admin.businesses') }}</span>
          <span class="badge badge-primary">{{ places.length }}</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in places" :key="p.id">
                <td class="td-name">
                  <img :src="p.image" :alt="p.name.en" class="table-thumb" />
                  <RouterLink :to="`/place/${p.id}`" class="table-link">{{ p.name.en }}</RouterLink>
                </td>
                <td><span class="badge badge-neutral">{{ t(`categories.${p.category}`) }}</span></td>
                <td><span class="stars small">★</span> {{ p.rating }}</td>
                <td>{{ p.reviewCount }}</td>
                <td>
                  <span class="badge" :class="p.isOpen ? 'badge-success' : 'badge-danger'">
                    {{ p.isOpen ? 'Open' : 'Closed' }}
                  </span>
                </td>
                <td class="td-actions">
                  <button class="btn btn-sm btn-outline" @click="viewBusiness(p)">View</button>
                  <button class="btn btn-sm btn-danger" @click="deleteBusiness(p)">{{ t('admin.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Reviews tab ── -->
      <div v-if="activeTab === 'reviews'" class="admin-panel">
        <div class="panel-header">
          <span>{{ t('admin.reviews') }}</span>
          <span class="badge badge-primary">{{ allReviews.length }}</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Place</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rv in allReviews" :key="rv.id">
                <td>{{ rv.author }}</td>
                <td>
                  <RouterLink :to="`/place/${rv.placeId}`" class="table-link">{{ rv.placeName }}</RouterLink>
                </td>
                <td><span class="stars small">★</span> {{ rv.rating }}</td>
                <td class="td-review">{{ rv.text }}</td>
                <td>{{ rv.date }}</td>
                <td class="td-actions">
                  <button class="btn btn-sm btn-ghost" :class="{ 'btn-outline': rv.status === 'pending' }" @click="approveReview(rv)">
                    {{ rv.status === 'pending' ? t('admin.approve') : '✓' }}
                  </button>
                  <button class="btn btn-sm btn-danger" @click="removeReview(rv)">{{ t('admin.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Users tab ── -->
      <div v-if="activeTab === 'users'" class="admin-panel">
        <div class="panel-header">
          <span>{{ t('admin.users') }}</span>
          <span class="badge badge-primary">{{ mockUsers.length }}</span>
        </div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reviews</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in mockUsers" :key="u.id">
                <td class="td-name">
                  <img :src="u.avatar" :alt="u.name" class="table-thumb round" />
                  {{ u.name }}
                </td>
                <td>{{ u.email }}</td>
                <td>{{ u.reviewCount }}</td>
                <td>{{ u.joined }}</td>
                <td class="td-actions">
                  <button class="btn btn-sm btn-danger">Suspend</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Delete modal -->
      <div class="modal-overlay" v-if="deleteTarget" @click="deleteTarget = null">
        <div class="modal card" @click.stop>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete <strong>{{ deleteTarget.name?.en || deleteTarget.author }}</strong>?</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../i18n/index.js'
import { places as allPlaces } from '../data/places.js'

const router = useRouter()
const activeTab = ref('businesses')

const tabs = [
  { key: 'businesses', label: t('admin.businesses'), icon: '🏢' },
  { key: 'reviews', label: t('admin.reviews'), icon: '⭐' },
  { key: 'users', label: t('admin.users'), icon: '👥' },
]

const places = ref([...allPlaces])

// Flatten all reviews with place info
const allReviews = ref(
  allPlaces.flatMap((p) =>
    p.reviews.map((r) => ({
      ...r,
      placeId: p.id,
      placeName: p.name.en,
      status: 'approved',
    }))
  ).slice(0, 15)
)

const mockUsers = [
  { id: 'u1', name: 'Sherzod Abdullayev', email: 'sherzod@buyelp.uz', reviewCount: 2, joined: '2024-09-01', avatar: 'https://ui-avatars.com/api/?name=Sherzod+Abdullayev&background=0D9488&color=fff&size=64' },
  { id: 'u2', name: 'Malika Rashidova', email: 'malika@example.uz', reviewCount: 4, joined: '2024-10-15', avatar: 'https://ui-avatars.com/api/?name=Malika+Rashidova&background=f59e0b&color=fff&size=64' },
  { id: 'u3', name: 'Aziz Toshmatov', email: 'aziz@example.uz', reviewCount: 7, joined: '2024-08-22', avatar: 'https://ui-avatars.com/api/?name=Aziz+Toshmatov&background=6366f1&color=fff&size=64' },
  { id: 'u4', name: 'Dilnoza Alimova', email: 'dilnoza@example.uz', reviewCount: 3, joined: '2025-01-05', avatar: 'https://ui-avatars.com/api/?name=Dilnoza+Alimova&background=ec4899&color=fff&size=64' },
]

const deleteTarget = ref(null)
const deleteType = ref('')

function viewBusiness(p) { router.push(`/place/${p.id}`) }
function deleteBusiness(p) { deleteTarget.value = p; deleteType.value = 'business' }
function removeReview(r) { deleteTarget.value = r; deleteType.value = 'review' }

function approveReview(rv) {
  rv.status = rv.status === 'pending' ? 'approved' : 'pending'
}

function confirmDelete() {
  if (deleteType.value === 'business') {
    const idx = places.value.findIndex((p) => p.id === deleteTarget.value.id)
    if (idx > -1) places.value.splice(idx, 1)
  } else {
    const idx = allReviews.value.findIndex((r) => r.id === deleteTarget.value.id)
    if (idx > -1) allReviews.value.splice(idx, 1)
  }
  deleteTarget.value = null
}
</script>

<style scoped>
.admin-header { margin-bottom: 28px; }

.admin-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 28px;
}

.admin-tab {
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all var(--transition);
  gap: 6px;
}

.admin-tab:hover { color: var(--primary); }
.admin-tab.active { color: var(--primary); border-bottom-color: var(--primary); }

.admin-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  font-weight: 700;
  font-size: 1rem;
}

.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.admin-table th {
  text-align: left;
  padding: 12px 16px;
  background: var(--surface-2);
  font-weight: 600;
  color: var(--text-2);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.admin-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  color: var(--text);
}

.admin-table tbody tr:hover { background: var(--surface-2); }
.admin-table tbody tr:last-child td { border-bottom: none; }

.td-name {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

.table-thumb {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.table-thumb.round { border-radius: 50%; }

.table-link {
  color: var(--primary);
  font-weight: 600;
}

.table-link:hover { text-decoration: underline; }

.td-review {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-2);
}

.td-actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.stars.small { color: var(--accent); font-size: 0.85rem; }

/* Modal */
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
  padding: 28px;
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeUp 0.2s ease;
}

.modal h3 { font-size: 1.1rem; font-weight: 700; }
.modal p { font-size: 0.9rem; color: var(--text-2); }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
