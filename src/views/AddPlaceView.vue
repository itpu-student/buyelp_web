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
          <span class="form-label">Category *</span>
          <div v-if="categoriesState.loading && !filteredCategories.length" class="text-muted text-sm">
            Loading categories…
          </div>
          <div v-else-if="categoriesState.error" class="form-error">
            {{ categoriesState.error.message || 'Failed to load categories' }}
          </div>
          <div v-else class="cat-grid">
            <button
              v-for="c in filteredCategories"
              :key="c.id"
              type="button"
              class="cat-chip"
              :class="{ 'is-selected': form.category_id === c.id }"
              :aria-pressed="form.category_id === c.id"
              @click="form.category_id = c.id"
            >
              <span class="cat-emoji">{{ c.emoji || '🏷️' }}</span>
              <span class="cat-name">{{ c.name?.en || c.slug }}</span>
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="addr-uz">Address (UZ) *</label>
            <input id="addr-uz" v-model.trim="form.addressUz" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="addr-en">Address (EN)</label>
            <input id="addr-en" v-model.trim="form.addressEn" type="text" class="form-input" />
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
          <input
            id="phone"
            v-model.trim="form.phone"
            type="tel"
            class="form-input"
            placeholder="+998901234567"
            pattern="^\+\d{12}$"
            title="Phone must start with + and have 12 digits"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="desc-uz">Description (UZ)</label>
            <textarea id="desc-uz" v-model="form.descUz" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="desc-en">Description (EN)</label>
            <textarea id="desc-en" v-model="form.descEn" class="form-input" rows="3"></textarea>
          </div>
        </div>

        <div class="form-group">
          <span class="form-label">Logo</span>
          <div class="logo-row">
            <button
              type="button"
              class="logo-circle"
              :class="{ 'is-empty': !form.logo_key, 'is-busy': logoUploading }"
              :aria-label="form.logo_key ? 'Replace logo' : 'Upload logo'"
              @click="logoInput?.click()"
            >
              <img v-if="form.logo_key" :src="staticUrl(form.logo_key)" alt="Logo preview" />
              <span v-else class="logo-placeholder">
                <span class="logo-plus">＋</span>
                <span class="logo-hint">Logo</span>
              </span>
              <span v-if="logoUploading" class="logo-busy">…</span>
            </button>
            <button
              v-if="form.logo_key && !logoUploading"
              type="button"
              class="logo-clear"
              aria-label="Remove logo"
              @click="form.logo_key = ''"
            >×</button>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden-file"
              @change="onLogoPick"
            />
          </div>
        </div>

        <div class="form-group">
          <span class="form-label">Photos</span>
          <div class="photo-strip">
            <div v-for="(k, i) in form.images" :key="k" class="photo-tile">
              <img :src="staticUrl(k)" :alt="`Photo ${i + 1}`" />
              <button
                type="button"
                class="photo-remove"
                aria-label="Remove photo"
                @click="form.images.splice(i, 1)"
              >×</button>
            </div>
            <button
              type="button"
              class="photo-tile photo-add"
              :aria-label="form.images.length ? 'Add more photos' : 'Add photos'"
              @click="imagesInput?.click()"
            >＋</button>
            <input
              ref="imagesInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden-file"
              @change="onImagesPick"
            />
          </div>
          <small v-if="imagesUploading" class="text-muted">
            Uploading {{ imagesProgress.done }} of {{ imagesProgress.total }}…
          </small>
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
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { createPlace } from '../api/places.js'
import { uploadFile } from '../api/files.js'
import { staticUrl } from '../api/client.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'

const filteredCategories = computed(() => {
  return categoriesState.list.filter(c => c.id)
})

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

const logoInput = ref(null)
const imagesInput = ref(null)
const logoUploading = ref(false)
const imagesUploading = ref(false)
const imagesProgress = reactive({ done: 0, total: 0 })

async function onLogoPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  logoUploading.value = true
  error.value = ''
  try {
    const r = await uploadFile(file, 'place')
    form.logo_key = r.key
  } catch (err) { error.value = err.message || 'Upload failed' }
  finally { logoUploading.value = false }
}

async function onImagesPick(e) {
  const files = Array.from(e.target.files || [])
  e.target.value = ''
  if (!files.length) return
  imagesUploading.value = true
  imagesProgress.total = files.length
  imagesProgress.done = 0
  error.value = ''
  try {
    for (const f of files) {
      const r = await uploadFile(f, 'place')
      form.images.push(r.key)
      imagesProgress.done++
    }
  } catch (err) { error.value = err.message || 'Upload failed' }
  finally { imagesUploading.value = false }
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
  if (!form.category_id) {
    error.value = 'Please pick a category'
    return
  }
  if (form.phone && !/^\+\d{12}$/.test(form.phone)) {
    error.value = 'Phone must be in format +998XXXXXXXXX (12 digits)'
    return
  }
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      category_id: form.category_id,
      address: { uz: form.addressUz, en: form.addressEn || form.addressUz },
      lat: Number(form.lat),
      lon: Number(form.lon),
    }
    if (form.phone) payload.phone = form.phone
    if (form.descEn || form.descUz) {
      payload.description = { uz: form.descUz || form.descEn, en: form.descEn || form.descUz }
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

.hidden-file { display: none; }

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.cat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  cursor: pointer;
  font: inherit;
  color: var(--text);
  text-align: left;
  transition: var(--transition);
}
.cat-chip:hover { border-color: var(--primary); }
.cat-chip.is-selected {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.cat-emoji { font-size: 1.15rem; line-height: 1; }
.cat-name {
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-row {
  position: relative;
  display: inline-block;
  width: 96px;
  height: 96px;
}
.logo-circle {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px dashed var(--border);
  background: var(--surface);
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  position: relative;
}
.logo-circle:hover { border-color: var(--primary); }
.logo-circle:not(.is-empty) {
  border-style: solid;
}
.logo-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--text-2);
}
.logo-plus { font-size: 1.5rem; line-height: 1; }
.logo-hint { font-size: 0.75rem; }
.logo-busy {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 1.4rem;
}
.logo-clear {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--text);
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 4px 2px;
}
.photo-tile {
  position: relative;
  flex: 0 0 auto;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
}
.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.photo-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo-add {
  border-style: dashed;
  cursor: pointer;
  color: var(--text-2);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}
.photo-add:hover { border-color: var(--primary); color: var(--primary); }

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
