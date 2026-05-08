<template>
  <div class="page-content">
    <div class="container">
      <h1 class="page-title">My places</h1>

      <div v-if="!store.isLoggedIn" class="nudge card">
        <p>
          <RouterLink to="/login" class="text-primary font-semibold">Sign in</RouterLink>
          to manage your places.
        </p>
      </div>

      <template v-else>
        <div v-if="loading" class="state-msg">Loading…</div>
        <div v-else-if="error" class="state-msg error">{{ error }}</div>
        <div v-else-if="!places.length" class="state-msg">
          You don't own any places yet. Claim one from its place page.
        </div>
        <div v-else class="places-list">
          <div v-for="p in places" :key="p.id" class="place-card card" @click="router.push(`/place/${p.slug || p.id}`)">
            <div class="place-main">
              <img v-if="p.logo_key" :src="staticUrl(p.logo_key)" class="place-logo" alt="" />
              <div v-else class="place-logo logo-placeholder">
                <span>{{ (p.name || '?')[0] }}</span>
              </div>
              <div class="place-info">
                <span class="place-name">{{ typeof p.name === 'string' ? p.name : (p.name?.en || p.name?.uz || '') }}</span>
                <span class="place-slug text-muted">{{ p.slug }}</span>
                <div class="place-meta">
                  <span class="badge" :class="statusClass(p.status)">{{ p.status }}</span>
                  <span class="text-muted text-sm">{{ p.avg_rating?.toFixed(1) }}★ · {{ p.review_count }} reviews</span>
                </div>
              </div>
            </div>
            <div class="place-actions">
              <RouterLink :to="`/business/${p.slug || p.id}/edit`" class="btn btn-sm btn-primary" @click.stop>Edit</RouterLink>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { listMyPlaces } from '../api/places.js'
import { staticUrl } from '../api/client.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const places = ref([])

function statusClass(s) {
  if (s === 'approved') return 'badge-success'
  if (s === 'rejected') return 'badge-danger'
  if (s === 'pending') return 'badge-warning'
  if (s === 'suspended') return 'badge-suspended'
  return 'badge-neutral'
}

async function load() {
  if (!store.isLoggedIn) return
  loading.value = true
  error.value = ''
  try {
    const res = await listMyPlaces()
    places.value = res.items || res || []
  } catch (e) {
    error.value = e.message || 'Failed to load places'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }

.nudge {
  padding: 20px; border-radius: var(--radius-md);
  background: var(--surface); border: 1px solid var(--border);
}

.state-msg { padding: 48px 0; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }

.places-list { display: flex; flex-direction: column; gap: 12px; }

.place-card {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
}
.place-card:hover {
  box-shadow: var(--shadow-md, 0 6px 18px rgba(0,0,0,0.10));
  transform: translateY(-2px);
  border-color: var(--primary);
}

.place-main { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }

.place-logo {
  width: 52px; height: 52px;
  border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0;
  border: 1px solid var(--border);
}
.logo-placeholder {
  display: flex; align-items: center; justify-content: center;
  background: var(--primary); color: #fff;
  font-size: 1.3rem; font-weight: 700;
}

.place-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.place-name { font-weight: 700; font-size: 1rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.place-slug { font-size: 0.8rem; }
.place-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
.badge-success { background: rgba(34,197,94,0.12); color: #16a34a; }
.badge-warning { background: rgba(245,158,11,0.12); color: #d97706; }
.badge-danger { background: rgba(239,68,68,0.1); color: #ef4444; }
.badge-suspended { background: rgba(249,115,22,0.12); color: #ea580c; }
.badge-neutral { background: var(--surface-2); color: var(--text-2); }

.place-actions { display: flex; gap: 8px; flex-shrink: 0; }

.text-muted { color: var(--text-2); }
.text-sm { font-size: 0.8rem; }
.text-primary { color: var(--primary); }
.font-semibold { font-weight: 600; }
</style>
