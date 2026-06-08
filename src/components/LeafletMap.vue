<template>
  <div class="leaflet-map-root">
    <div ref="mapEl" class="leaflet-map-canvas" />
    <a
      v-if="lat != null && lon != null"
      :href="`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`"
      target="_blank"
      rel="noopener noreferrer"
      class="directions-btn"
    >
      Get Directions →
    </a>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps({
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
})

const mapEl = ref(null)
let map = null
let marker = null

const TASHKENT = { lat: 41.3111, lon: 69.2797 }

const pinIcon = L.divIcon({
  html: '<div style="font-size:26px;line-height:1;margin-top:-26px;margin-left:-13px;">📍</div>',
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
})

function initMap() {
  if (!mapEl.value) return
  const center = props.lat != null ? [props.lat, props.lon] : [TASHKENT.lat, TASHKENT.lon]
  const zoom = props.lat != null ? 15 : 12

  map = L.map(mapEl.value, { zoomControl: false, attributionControl: false }).setView(center, zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  if (props.lat != null) {
    marker = L.marker([props.lat, props.lon], { icon: pinIcon }).addTo(map)
  }
}

watch(() => [props.lat, props.lon], ([lat, lon]) => {
  if (!map || lat == null) return
  map.setView([lat, lon], 15)
  if (marker) {
    marker.setLatLng([lat, lon])
  } else {
    marker = L.marker([lat, lon], { icon: pinIcon }).addTo(map)
  }
})

onMounted(initMap)

onBeforeUnmount(() => {
  if (map) { map.remove(); map = null }
  marker = null
})
</script>

<style scoped>
.leaflet-map-root {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaflet-map-canvas {
  width: 100%;
  height: 180px;
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 0;
}

.directions-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  padding: 4px 0;
  transition: opacity var(--transition);
}
.directions-btn:hover { opacity: 0.75; }
</style>
