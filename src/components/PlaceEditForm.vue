<template>
  <form class="edit-form" @submit.prevent="submit">

    <!-- Info bar -->
    <div class="info-bar">
      <div class="info-stats">
        <span class="stat-rating">{{ place.avg_rating?.toFixed(1) ?? '—' }}★</span>
        <span class="stat-sep">·</span>
        <span class="stat-reviews">{{ place.review_count ?? 0 }} reviews</span>
      </div>
      <div v-if="mode === 'admin' && place.claimed_by_user" class="claimed-chip">
        <img v-if="place.claimed_by_user.avatar_key" :src="staticUrl(place.claimed_by_user.avatar_key)" class="claimed-avatar" />
        <div v-else class="claimed-avatar avatar-placeholder">{{ initials(place.claimed_by_user.name) }}</div>
        <span class="claimed-name">{{ place.claimed_by_user.name }}</span>
        <span class="claimed-username text-muted">@{{ place.claimed_by_user.username }}</span>
      </div>
    </div>

    <!-- Status (admin only) -->
    <div v-if="mode === 'admin'" class="form-group">
      <span class="form-label">Status</span>
      <div class="status-chips">
        <button
          v-for="s in STATUSES"
          :key="s.value"
          type="button"
          class="status-chip"
          :class="[s.cls, { 'is-active': form.status === s.value }]"
          @click="form.status = s.value"
        >{{ s.label }}</button>
      </div>
    </div>

    <!-- Name + Slug -->
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="pef-name">Name *</label>
        <input id="pef-name" v-model.trim="form.name" type="text" class="form-input" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="pef-slug">Slug</label>
        <input id="pef-slug" v-model.trim="form.slug" type="text" class="form-input" />
      </div>
    </div>

    <!-- Category -->
    <div class="form-group">
      <span class="form-label">Category</span>
      <div v-if="categoriesState.loading && !categoriesState.list.length" class="text-muted text-sm">Loading…</div>
      <div v-else class="cat-grid">
        <button
          v-for="c in categoriesState.list.filter(c => c.id)"
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

    <!-- Address -->
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="pef-addr-uz">Address (UZ)</label>
        <input id="pef-addr-uz" v-model.trim="form.addressUz" type="text" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label" for="pef-addr-en">Address (EN)</label>
        <input id="pef-addr-en" v-model.trim="form.addressEn" type="text" class="form-input" />
      </div>
    </div>

    <!-- Map -->
    <div class="form-group">
      <span class="form-label">Location</span>
      <MapPicker v-model:lat="form.lat" v-model:lon="form.lon" />
    </div>

    <!-- Phone -->
    <div class="form-group">
      <label class="form-label" for="pef-phone">Phone</label>
      <input
        id="pef-phone"
        v-model.trim="form.phone"
        type="tel"
        class="form-input"
        placeholder="+998901234567"
        pattern="^\+\d{12}$"
        title="Must start with + and have 12 digits"
      />
    </div>

    <!-- Description -->
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="pef-desc-uz">Description (UZ)</label>
        <textarea id="pef-desc-uz" v-model="form.descUz" class="form-input" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="pef-desc-en">Description (EN)</label>
        <textarea id="pef-desc-en" v-model="form.descEn" class="form-input" rows="3"></textarea>
      </div>
    </div>

    <!-- Logo -->
    <div class="form-group">
      <span class="form-label">Logo</span>
      <div class="logo-row">
        <button
          type="button"
          class="logo-circle"
          :class="{ 'is-empty': !form.logo_key, 'is-busy': logoUploading }"
          @click="logoInput?.click()"
        >
          <img v-if="form.logo_key" :src="staticUrl(form.logo_key)" alt="Logo" />
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
          @click="form.logo_key = ''"
        >×</button>
        <input ref="logoInput" type="file" accept="image/*" class="hidden-file" @change="onLogoPick" />
      </div>
    </div>

    <!-- Images -->
    <div class="form-group">
      <span class="form-label">Photos</span>
      <div class="photo-strip">
        <div
          v-for="(key, i) in form.images"
          :key="key"
          class="photo-tile"
          :class="{ 'drag-over': dropIdx === i }"
          draggable="true"
          @dragstart="onDragStart(i)"
          @dragover.prevent="onDragOver(i)"
          @drop.prevent="onDrop(i)"
          @dragend="onDragEnd"
        >
          <img :src="staticUrl(key)" :alt="`Photo ${i + 1}`" />
          <button type="button" class="photo-remove" @click="form.images.splice(i, 1)">×</button>
          <div class="drag-handle" title="Drag to reorder">⠿</div>
        </div>
        <button
          type="button"
          class="photo-tile photo-add"
          :disabled="imagesUploading"
          @click="imagesInput?.click()"
        >
          <span v-if="imagesUploading">{{ imagesProgress.done }}/{{ imagesProgress.total }}</span>
          <span v-else>＋</span>
        </button>
        <input ref="imagesInput" type="file" accept="image/*" multiple class="hidden-file" @change="onImagesPick" />
      </div>
    </div>

    <!-- Weekly hours -->
    <div class="form-group">
      <span class="form-label">Hours</span>
      <div class="hours-grid">
        <div v-for="d in DAYS" :key="d" class="hours-row">
          <label class="day-toggle">
            <input type="checkbox" v-model="hoursForm[d].enabled" />
            <span class="day-label">{{ DAY_LABELS[d] }}</span>
          </label>
          <template v-if="hoursForm[d].enabled">
            <input v-model="hoursForm[d].open" type="time" class="time-input" />
            <span class="time-sep">–</span>
            <input v-model="hoursForm[d].close" type="time" class="time-input" />
          </template>
          <span v-else class="closed-label">Closed</span>
        </div>
      </div>
    </div>

    <div v-if="error" class="form-error">{{ error }}</div>

    <div class="actions">
      <slot name="cancel" />
      <button type="submit" class="btn btn-primary" :disabled="submitting || logoUploading || imagesUploading">
        {{ submitting ? 'Saving…' : 'Save changes' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { staticUrl } from '../api/client.js'
import { uploadFile } from '../api/files.js'
import { updatePlace } from '../api/places.js'
import { adminUpdatePlace, adminSetPlaceStatus } from '../api/adminModeration.js'
import { categoriesState, ensureCategoriesLoaded } from '../store/categories.js'
import MapPicker from './MapPicker.vue'

const props = defineProps({
  place: { type: Object, required: true },
  mode: { type: String, required: true }, // 'owner' | 'admin'
})
const emit = defineEmits(['saved'])

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const STATUSES = [
  { value: 'pending', label: 'Pending', cls: 'chip-warning' },
  { value: 'approved', label: 'Approved', cls: 'chip-success' },
  { value: 'rejected', label: 'Rejected', cls: 'chip-danger' },
  { value: 'suspended', label: 'Suspended', cls: 'chip-suspended' },
]

function initHours(wh) {
  return Object.fromEntries(DAYS.map(d => {
    const slots = wh?.[d]
    const first = Array.isArray(slots) && slots[0] ? slots[0] : null
    return [d, { enabled: !!first, open: first?.open || '09:00', close: first?.close || '22:00' }]
  }))
}

const p = props.place
const form = reactive({
  name: typeof p.name === 'string' ? p.name : (p.name?.en || p.name?.uz || ''),
  slug: p.slug || '',
  category_id: p.category_id || '',
  addressUz: p.address?.uz || (typeof p.address === 'string' ? p.address : ''),
  addressEn: p.address?.en || '',
  lat: p.lat ?? null,
  lon: p.lon ?? null,
  phone: p.phone || '',
  descUz: p.description?.uz || (typeof p.description === 'string' ? p.description : ''),
  descEn: p.description?.en || '',
  logo_key: p.logo_key || '',
  images: [...(p.images || [])],
  status: p.status || '',
})

const hoursForm = reactive(initHours(p.weekly_hours))

const logoInput = ref(null)
const imagesInput = ref(null)
const logoUploading = ref(false)
const imagesUploading = ref(false)
const imagesProgress = reactive({ done: 0, total: 0 })
const submitting = ref(false)
const error = ref('')

const dragIdx = ref(null)
const dropIdx = ref(null)

function onDragStart(i) { dragIdx.value = i }
function onDragOver(i) { dropIdx.value = i }
function onDrop(i) {
  if (dragIdx.value === null || dragIdx.value === i) return
  const arr = [...form.images]
  const [moved] = arr.splice(dragIdx.value, 1)
  arr.splice(i, 0, moved)
  form.images = arr
  dragIdx.value = null
  dropIdx.value = null
}
function onDragEnd() { dragIdx.value = null; dropIdx.value = null }

async function onLogoPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  logoUploading.value = true
  error.value = ''
  try {
    const r = await uploadFile(file, 'place', { adminAuth: props.mode === 'admin' })
    form.logo_key = r.key
  } catch (e) { error.value = e.message || 'Upload failed' }
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
      const r = await uploadFile(f, 'place', { adminAuth: props.mode === 'admin' })
      form.images.push(r.key)
      imagesProgress.done++
    }
  } catch (e) { error.value = e.message || 'Upload failed' }
  finally { imagesUploading.value = false }
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

async function submit() {
  error.value = ''
  if (form.phone && !/^\+\d{12}$/.test(form.phone)) {
    error.value = 'Phone must be +998XXXXXXXXX (12 digits after +)'
    return
  }

  const weekly_hours = Object.fromEntries(DAYS.map(d => {
    const h = hoursForm[d]
    return [d, h.enabled ? [{ open: h.open, close: h.close }] : []]
  }))

  const payload = {
    name: form.name,
    slug: form.slug || undefined,
    category_id: form.category_id || undefined,
    address: { uz: form.addressUz, en: form.addressEn || form.addressUz },
    lat: form.lat != null ? Number(form.lat) : undefined,
    lon: form.lon != null ? Number(form.lon) : undefined,
    phone: form.phone || undefined,
    description: { uz: form.descUz, en: form.descEn || form.descUz },
    logo_key: form.logo_key || undefined,
    images: form.images,
    weekly_hours,
  }

  submitting.value = true
  try {
    if (props.mode === 'admin') {
      await adminUpdatePlace(props.place.id, payload)
      if (form.status && form.status !== props.place.status) {
        await adminSetPlaceStatus(props.place.id, form.status)
      }
    } else {
      await updatePlace(props.place.id, payload)
    }
    emit('saved')
  } catch (e) {
    error.value = e.message || 'Save failed'
  } finally {
    submitting.value = false
  }
}

onMounted(() => ensureCategoriesLoaded())
</script>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Info bar */
.info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.info-stats { display: flex; align-items: center; gap: 6px; }
.stat-rating { font-weight: 700; color: #d97706; font-size: 1rem; }
.stat-sep { color: var(--text-2); }
.stat-reviews { color: var(--text-2); font-size: 0.875rem; }
.claimed-chip { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.claimed-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
}
.avatar-placeholder {
  display: flex; align-items: center; justify-content: center;
  background: var(--primary); color: #fff;
  font-size: 0.65rem; font-weight: 700;
}
.claimed-name { font-size: 0.875rem; font-weight: 600; }
.claimed-username { font-size: 0.8rem; }

/* Status chips */
.status-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.status-chip {
  padding: 6px 16px;
  border-radius: 999px;
  border: 1.5px solid transparent;
  cursor: pointer;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0.55;
  transition: var(--transition);
}
.status-chip:hover { opacity: 0.85; }
.status-chip.is-active { opacity: 1; }
.chip-warning { background: rgba(245,158,11,0.12); color: #d97706; border-color: rgba(245,158,11,0.3); }
.chip-success { background: rgba(34,197,94,0.1); color: #16a34a; border-color: rgba(34,197,94,0.3); }
.chip-danger { background: rgba(239,68,68,0.1); color: #dc2626; border-color: rgba(239,68,68,0.25); }
.chip-suspended { background: rgba(249,115,22,0.1); color: #ea580c; border-color: rgba(249,115,22,0.3); }

/* Layout */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.82rem; font-weight: 600; color: var(--text-2); }
.form-input {
  padding: 9px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 0.875rem;
  transition: border-color var(--transition);
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: var(--primary); }
textarea.form-input { resize: vertical; }
.hidden-file { display: none; }

/* Category */
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
.cat-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px;
  background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius-full); cursor: pointer;
  font: inherit; color: var(--text); text-align: left;
  transition: var(--transition);
}
.cat-chip:hover { border-color: var(--primary); }
.cat-chip.is-selected { background: var(--primary); border-color: var(--primary); color: #fff; }
.cat-emoji { font-size: 1.1rem; line-height: 1; }
.cat-name { font-size: 0.82rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Logo */
.logo-row { position: relative; display: inline-block; width: 88px; height: 88px; }
.logo-circle {
  width: 88px; height: 88px; border-radius: 50%;
  border: 2px dashed var(--border); background: var(--surface);
  cursor: pointer; padding: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition); position: relative;
}
.logo-circle:not(.is-empty) { border-style: solid; }
.logo-circle:hover { border-color: var(--primary); }
.logo-circle img { width: 100%; height: 100%; object-fit: cover; }
.logo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--text-2); }
.logo-plus { font-size: 1.4rem; line-height: 1; }
.logo-hint { font-size: 0.72rem; }
.logo-busy {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.35); color: #fff; font-size: 1.2rem;
}
.logo-clear {
  position: absolute; top: -5px; right: -5px;
  width: 20px; height: 20px; border-radius: 50%; border: none;
  background: var(--text); color: #fff; cursor: pointer;
  font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
}

/* Photos */
.photo-strip { display: flex; gap: 10px; flex-wrap: wrap; padding: 4px 0; }
.photo-tile {
  position: relative; flex: 0 0 auto;
  width: 84px; height: 84px;
  border-radius: var(--radius-md); overflow: hidden;
  background: var(--surface); border: 1.5px solid var(--border);
  transition: border-color var(--transition), box-shadow var(--transition);
  cursor: grab;
}
.photo-tile.drag-over { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary); }
.photo-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.photo-remove {
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.6); color: #fff; cursor: pointer;
  font-size: 0.8rem; display: flex; align-items: center; justify-content: center;
}
.drag-handle {
  position: absolute; bottom: 4px; left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem; color: rgba(255,255,255,0.85);
  pointer-events: none; letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.photo-add {
  border-style: dashed; cursor: pointer;
  color: var(--text-2); font-size: 1.6rem;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.photo-add:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.photo-add:disabled { opacity: 0.5; cursor: default; }

/* Hours */
.hours-grid { display: flex; flex-direction: column; gap: 8px; }
.hours-row {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 0; border-bottom: 1px solid var(--border-light, var(--border));
}
.hours-row:last-child { border-bottom: none; }
.day-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 70px; }
.day-toggle input[type=checkbox] { accent-color: var(--primary); width: 15px; height: 15px; cursor: pointer; }
.day-label { font-size: 0.82rem; font-weight: 600; color: var(--text); }
.time-input {
  padding: 5px 8px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text);
  font: inherit; font-size: 0.82rem;
  width: 90px;
}
.time-input:focus { outline: none; border-color: var(--primary); }
.time-sep { color: var(--text-2); font-size: 0.85rem; }
.closed-label { font-size: 0.82rem; color: var(--text-2); font-style: italic; }

/* Error / actions */
.form-error {
  padding: 10px 14px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius-sm); color: #dc2626; font-size: 0.875rem;
}
.actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }

.text-muted { color: var(--text-2); }
.text-sm { font-size: 0.82rem; }

@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .cat-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
}
</style>
