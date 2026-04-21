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
            <option v-for="c in categoriesState.list" :key="c.id" :value="c.id">
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
          <label class="form-label" for="logo">Logo</label>
          <input id="logo" type="file" accept="image/*" @change="onLogoPick" />
          <small v-if="form.logo_key" class="text-muted">Uploaded ✓ ({{ form.logo_key }})</small>
        </div>

        <div class="form-group">
          <label class="form-label" for="images">Photos</label>
          <input id="images" type="file" accept="image/*" multiple @change="onImagesPick" />
          <ul v-if="form.images.length" class="image-keys">
            <li v-for="(k, i) in form.images" :key="k">
              <span>{{ k }}</span>
              <button class="btn-link" type="button" @click="form.images.splice(i, 1)">×</button>
            </li>
          </ul>
          <small v-if="uploading" class="text-muted">Uploading…</small>
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
import { uploadFile } from '../api/files.js'
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
  logo_key: '',
  images: [],
})

const uploading = ref(false)

async function onLogoPick(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  error.value = ''
  try {
    const r = await uploadFile(file, 'place')
    form.logo_key = r.key
  } catch (err) { error.value = err.message || 'Upload failed' }
  finally { uploading.value = false }
}

async function onImagesPick(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  uploading.value = true
  error.value = ''
  try {
    for (const f of files) {
      const r = await uploadFile(f, 'place')
      form.images.push(r.key)
    }
  } catch (err) { error.value = err.message || 'Upload failed' }
  finally { uploading.value = false }
}

const submitting = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => {
  ensureCategoriesLoaded()
})

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
    if (form.logo_key) payload.logo_key = form.logo_key
    if (form.images.length) payload.images = form.images

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

.image-keys { list-style: none; padding: 0; margin: 6px 0 0; display: flex; flex-direction: column; gap: 4px; font-size: 0.75rem; color: var(--text-2); }
.image-keys li { display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 4px 8px; background: var(--surface-2); border-radius: 4px; }
.btn-link { background: none; border: none; cursor: pointer; color: var(--text-2); font-size: 1rem; padding: 0 4px; }

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
