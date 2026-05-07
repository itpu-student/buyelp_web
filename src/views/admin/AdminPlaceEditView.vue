<template>
  <div>
    <div class="view-header">
      <RouterLink to="/admin/places" class="back-link">← Places</RouterLink>
      <h2 class="view-title">Edit place</h2>
    </div>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="loadError" class="state-msg error">{{ loadError }}</div>
    <div v-else-if="!place" class="state-msg">Place not found.</div>

    <template v-else>
      <div v-if="saved" class="saved-banner">Saved successfully.</div>
      <div class="form-card">
        <PlaceEditForm :place="place" mode="admin" @saved="onSaved">
          <template #cancel>
            <RouterLink to="/admin/places" class="btn btn-ghost">Cancel</RouterLink>
          </template>
        </PlaceEditForm>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPlace } from '../../api/places.js'
import PlaceEditForm from '../../components/PlaceEditForm.vue'

const route = useRoute()
const loading = ref(true)
const loadError = ref('')
const place = ref(null)
const saved = ref(false)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    place.value = await getPlace(route.params.alias)
  } catch (e) {
    loadError.value = e.message || 'Failed to load place'
  } finally {
    loading.value = false
  }
}

function onSaved() {
  saved.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(load)
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.back-link { font-size: 0.82rem; color: var(--text-2); text-decoration: none; }
.back-link:hover { color: var(--primary); }
.view-title { font-size: 1.3rem; font-weight: 800; color: var(--text); margin-top: 4px; }
.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }
.saved-banner {
  padding: 10px 14px; margin-bottom: 16px;
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
  border-radius: var(--radius-sm); color: #16a34a; font-size: 0.875rem;
}
.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  max-width: 800px;
}
</style>
