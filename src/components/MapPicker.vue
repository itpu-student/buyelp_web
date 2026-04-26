<template>
  <div class="map-picker-root">
    <template v-if="apiError">
      <div class="fallback">
        <div class="fallback-msg">{{ apiError }} — enter coordinates manually:</div>
        <div class="fallback-row">
          <input
            type="number"
            step="any"
            class="form-input"
            placeholder="Latitude"
            :value="lat"
            @input="emit('update:lat', $event.target.valueAsNumber)"
            required
          />
          <input
            type="number"
            step="any"
            class="form-input"
            placeholder="Longitude"
            :value="lon"
            @input="emit('update:lon', $event.target.valueAsNumber)"
            required
          />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="map-shell">
        <div ref="mapEl" class="map-canvas" />
        <div v-if="!ready" class="map-loading">Loading map…</div>
      </div>
      <div class="map-footer">
        <span v-if="lat != null && lon != null" class="coords">
          {{ lat.toFixed(5) }}, {{ lon.toFixed(5) }}
        </span>
        <span v-else class="coords-hint">Tap the map to set location</span>
        <button
          v-if="ready"
          type="button"
          class="locate-btn"
          :disabled="locating"
          @click="snapToGps"
          :title="locating ? 'Locating…' : 'Snap pin to my current location'"
        >
          <span class="locate-icon" aria-hidden="true">📍</span>
          <span>{{ locating ? 'Locating…' : 'My location' }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
})
const emit = defineEmits(['update:lat', 'update:lon'])

const TASHKENT = { lat: 41.3111, lon: 69.2797 }

const mapEl = ref(null)
const ready = ref(false)
const apiError = ref('')
const locating = ref(false)

let map = null
let pinMarker = null
let gpsMarker = null
let lastEmitted = { lat: null, lon: null }

const API_URL = 'https://api-maps.yandex.ru/v3/'
let scriptPromise = null

function loadYandex(apiKey) {
  if (scriptPromise) return scriptPromise
  if (!apiKey) {
    return Promise.reject(new Error('Yandex Maps API key missing'))
  }
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `${API_URL}?apikey=${encodeURIComponent(apiKey)}&lang=en_US`
    s.async = true
    s.onload = () => resolve(window.ymaps3)
    s.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load Yandex Maps'))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) => reject(new Error(e.message)),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}

function makePinElement() {
  const el = document.createElement('div')
  el.style.cssText = [
    'width:32px',
    'height:32px',
    'margin-left:-16px',
    'margin-top:-32px',
    'font-size:28px',
    'line-height:1',
    'cursor:grab',
    'user-select:none',
    'text-align:center',
  ].join(';')
  el.textContent = '📍'
  return el
}

function makeGpsElement() {
  const el = document.createElement('div')
  el.className = 'mp-gps'
  el.innerHTML = '<div class="mp-gps-pulse"></div><div class="mp-gps-core"></div>'
  return el
}

function emitCoords(lat, lon) {
  lastEmitted = { lat, lon }
  emit('update:lat', lat)
  emit('update:lon', lon)
}

function ensurePin(ymaps3, coords) {
  if (pinMarker) {
    pinMarker.update({ coordinates: coords })
    return
  }
  pinMarker = new ymaps3.YMapMarker(
    {
      coordinates: coords,
      draggable: true,
      onDragEnd: (c) => emitCoords(c[1], c[0]),
    },
    makePinElement(),
  )
  map.addChild(pinMarker)
}

function ensureGpsDot(ymaps3, coords) {
  if (gpsMarker) {
    gpsMarker.update({ coordinates: coords })
    return
  }
  gpsMarker = new ymaps3.YMapMarker(
    { coordinates: coords, draggable: false },
    makeGpsElement(),
  )
  map.addChild(gpsMarker)
}

let ymaps3Ref = null

async function init() {
  try {
    const ymaps3 = await loadYandex(import.meta.env.VITE_YANDEX_MAPS_KEY)
    await ymaps3.ready
    ymaps3Ref = ymaps3

    let center
    let zoom
    let hasPin = false
    let gpsCoords = null

    if (props.lat != null && props.lon != null) {
      center = [props.lon, props.lat]
      zoom = 16
      hasPin = true
    }

    try {
      const pos = await getPosition()
      gpsCoords = [pos.lon, pos.lat]
      if (!hasPin) {
        center = gpsCoords
        zoom = 16
        hasPin = true
        emitCoords(pos.lat, pos.lon)
      }
    } catch {
      if (!hasPin) {
        center = [TASHKENT.lon, TASHKENT.lat]
        zoom = 12
      }
    }

    map = new ymaps3.YMap(mapEl.value, { location: { center, zoom } })
    map.addChild(new ymaps3.YMapDefaultSchemeLayer())
    map.addChild(new ymaps3.YMapDefaultFeaturesLayer())

    if (gpsCoords) ensureGpsDot(ymaps3, gpsCoords)
    if (hasPin) ensurePin(ymaps3, center)

    const listener = new ymaps3.YMapListener({
      layer: 'any',
      onClick: (_obj, event) => {
        const c = event.coordinates
        ensurePin(ymaps3, c)
        emitCoords(c[1], c[0])
      },
    })
    map.addChild(listener)

    ready.value = true
  } catch (e) {
    apiError.value = e.message || 'Map unavailable'
  }
}

async function snapToGps() {
  if (!ymaps3Ref || !map) return
  locating.value = true
  try {
    const pos = await getPosition()
    const coords = [pos.lon, pos.lat]
    ensureGpsDot(ymaps3Ref, coords)
    ensurePin(ymaps3Ref, coords)
    emitCoords(pos.lat, pos.lon)
    map.update({ location: { center: coords, zoom: 16, duration: 300 } })
  } catch (e) {
    alert('Could not get your location: ' + e.message)
  } finally {
    locating.value = false
  }
}

watch(
  () => [props.lat, props.lon],
  ([newLat, newLon]) => {
    if (!map || !ymaps3Ref) return
    if (newLat == null || newLon == null) return
    if (newLat === lastEmitted.lat && newLon === lastEmitted.lon) return
    ensurePin(ymaps3Ref, [newLon, newLat])
  },
)

onMounted(init)

onBeforeUnmount(() => {
  if (map) {
    try { map.destroy() } catch {}
    map = null
  }
  pinMarker = null
  gpsMarker = null
  ymaps3Ref = null
})
</script>

<style scoped>
.map-picker-root {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.map-shell {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface-2);
}

.map-canvas {
  width: 100%;
  height: 100%;
}

.map-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}

.coords {
  font-size: 0.8rem;
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}
.coords-hint {
  font-size: 0.8rem;
  color: var(--text-3, var(--text-2));
  font-style: italic;
}

.locate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}
.locate-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}
.locate-btn:disabled { opacity: 0.7; cursor: wait; }
.locate-icon { font-size: 0.95rem; line-height: 1; }

.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  font-size: 0.9rem;
}

.fallback {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fallback-msg {
  font-size: 0.85rem;
  color: var(--text-2);
}
.fallback-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 640px) {
  .fallback-row { grid-template-columns: 1fr; }
}
</style>

<style>
.mp-gps {
  position: relative;
  width: 0;
  height: 0;
  pointer-events: none;
}
.mp-gps-core {
  position: absolute;
  width: 14px;
  height: 14px;
  left: -7px;
  top: -7px;
  border-radius: 50%;
  background: #1976d2;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.35);
}
.mp-gps-pulse {
  position: absolute;
  width: 24px;
  height: 24px;
  left: -12px;
  top: -12px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.45);
  animation: mp-gps-pulse 2s ease-out infinite;
}
@keyframes mp-gps-pulse {
  0%   { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(3);   opacity: 0;   }
}
</style>
