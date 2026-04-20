<template>
  <div class="page-content">
    <div class="container narrow">
      <h1 class="section-title">Add a place</h1>
      <p class="text-muted text-sm mt-2">
        New places start pending review. Required fields are marked with *.
      </p>

      <div v-if="!store.isLoggedIn" class="nudge card">
        <p>
          You need to
          <RouterLink to="/login" class="text-primary font-semibold">sign in</RouterLink>
          to add a place.
        </p>
      </div>

      <form v-else class="form" @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label" for="name">Name *</label>
          <input id="name" v-model.trim="form.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="category">Category *</label>
          <select id="category" v-model="form.category_id" class="form-input" required>
            <option value="" disabled>Select a category…</option>
            <option v-for="c in categoriesState.list" :key="c.id" :value="c.slug">
              {{ c.name?.en || c.slug }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="addr-en">Address (EN) *</label>
            <input id="addr-en" v-model.trim="form.addressEn" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="addr-uz">Address (UZ)</label>
            <input id="addr-uz" v-model.trim="form.addressUz" type="text" class="form-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="lat">Latitude *</label>
            <input id="lat" v-model.number="form.lat" type="number" step="any" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="lon">Longitude *</label>
            <input id="lon" v-model.number="form.lon" type="number" step="any" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="phone">Phone</label>
          <input id="phone" v-model.trim="form.phone" type="tel" class="form-input" placeholder="+998 ..." />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="desc-en">Description (EN)</label>
            <textarea id="desc-en" v-model="form.descEn" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="desc-uz">Description (UZ)</label>
            <textarea id="desc-uz" v-model="form.descUz" class="form-input" rows="3"></textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="images">Image URLs (comma-separated)</label>
          <textarea id="images" v-model="form.imagesText" class="form-input" rows="2" placeholder="https://...jpg, https://...jpg" />
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>
        <div v-if="success" class="form-success">
          Created! <RouterLink :to="`/place/${success}`" class="text-primary font-semibold">View place →</RouterLink>
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Submitting…' : 'Create place' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { createPlace } from '../api/places.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'

const router = useRouter()

const form = reactive({
  name: '',
  category_id: '',
  addressEn: '',
  addressUz: '',
  lat: null,
  lon: null,
  phone: '',
  descEn: '',
  descUz: '',
  imagesText: '',
})

const submitting = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  ensureCategoriesLoaded()
})

function parseImages(text) {
  if (!text) return []
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

async function submit() {
  error.value = ''
  success.value = ''
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      category_id: form.category_id,
      address: { en: form.addressEn, uz: form.addressUz || form.addressEn },
      lat: Number(form.lat),
      lon: Number(form.lon),
    }
    if (form.phone) payload.phone = form.phone
    if (form.descEn || form.descUz) {
      payload.description = { en: form.descEn, uz: form.descUz || form.descEn }
    }
    const images = parseImages(form.imagesText)
    if (images.length) payload.images = images

    const created = await createPlace(payload)
    success.value = created.slug || created.id
    setTimeout(() => router.push(`/place/${success.value}`), 600)
  } catch (e) {
    error.value = e.message || 'Failed to create place'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.narrow { max-width: 720px; }

.form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-2); }

.nudge {
  margin-top: 24px;
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
}

.form-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: 0.875rem;
}

.form-success {
  padding: 10px 14px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: var(--radius-sm);
  color: #16a34a;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
