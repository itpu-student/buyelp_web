<template>
  <div class="page-content">
    <div class="container narrow">
      <div class="page-header">
        <RouterLink to="/business" class="back-link">← My places</RouterLink>
        <h1 class="section-title">Edit place</h1>
      </div>

      <div v-if="loading" class="state-msg">Loading…</div>
      <div v-else-if="loadError" class="state-msg error">{{ loadError }}</div>
      <div v-else-if="!place" class="state-msg">Place not found.</div>

      <template v-else>
        <div v-if="saved" class="saved-banner">
          Saved! <RouterLink :to="`/place/${place.slug || place.id}`" class="text-primary">View place →</RouterLink>
        </div>
        <PlaceEditForm :place="place" mode="owner" @saved="onSaved">
          <template #cancel>
            <RouterLink to="/business" class="btn btn-ghost">Cancel</RouterLink>
          </template>
        </PlaceEditForm>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPlace } from '../api/places.js'
import PlaceEditForm from '../components/PlaceEditForm.vue'

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
.narrow { max-width: 720px; }
.page-header { margin-bottom: 24px; }
.back-link { font-size: 0.85rem; color: var(--text-2); text-decoration: none; }
.back-link:hover { color: var(--primary); }
.section-title { font-size: 1.5rem; font-weight: 800; margin-top: 6px; }
.state-msg { padding: 32px; text-align: center; color: var(--text-2); }
.state-msg.error { color: #ef4444; }
.saved-banner {
  padding: 12px 16px;
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
  border-radius: var(--radius-sm); color: #16a34a;
  font-size: 0.9rem; margin-bottom: 20px;
}
</style>
