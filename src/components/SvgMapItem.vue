<template>
  <div class="svg-map-item" ref="hostRef" v-on:click="openInGoogleMaps">
    <div v-if="loadError" class="svg-map-error">
      <span class="svg-map-error-icon">🗺️</span>
      <span>{{ loadError }}</span>
    </div>
    <div v-else-if="!svgLoaded" class="svg-map-skeleton skeleton" />
    <!-- SVG is injected here via JS -->
    <div class="svg-map-host" ref="svgHost" />

    <!-- Optional coordinate label -->
    <!-- <div v-if="svgLoaded && showCoords && lat != null && lon != null" class="svg-map-coords">
      <span class="svg-map-pin-icon">📍</span>
      {{ lat.toFixed(4) }}, {{ lon.toFixed(4) }}
    </div> -->
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { defaultMarkerStyle } from './svgMapMarkers.js'

const props = defineProps({
  /**
   * Path/URL to the SVG file to load.
   * Defaults to the Tashkent city map in /public.
   */
  svgSrc: {
    type: String,
    default: '/Tashkent_map_with_captions.svg',
  },

  /** Latitude of the point to mark. */
  lat: {
    type: Number,
    default: null,
  },

  /** Longitude of the point to mark. */
  lon: {
    type: Number,
    default: null,
  },

  /**
   * Optional override for geographic bounding box.
   * If not provided, the component reads s101-geodata-* attributes from the SVG.
   */
  geoBounds: {
    type: Object,
    default: null,
  },

  /** Marker circle radius in SVG user units. */
  markerRadius: {
    type: Number,
    default: 9,
  },

  /** Marker fill colour. */
  markerColor: {
    type: String,
    default: '#e11d2e',
  },

  /** Whether to show a lat/lon label below the map. */
  showCoords: {
    type: Boolean,
    default: false,
  },
})

const hostRef = ref(null)
const svgHost = ref(null)
const svgLoaded = ref(false)
const loadError = ref(null)

let svgEl = null
let markerEl = null
let drawnBounds = null
const geoBoundsFromSvg = ref(null)

/** Compute the bounding box covered by all <path> elements in the loaded SVG. */
function calcDrawnBounds(svg) {
  const paths = Array.from(svg.querySelectorAll('path'))
  if (!paths.length) throw new Error('No path elements found in SVG.')
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of paths) {
    const b = p.getBBox()
    minX = Math.min(minX, b.x)
    minY = Math.min(minY, b.y)
    maxX = Math.max(maxX, b.x + b.width)
    maxY = Math.max(maxY, b.y + b.height)
  }
  return { minX, minY, maxX, maxY }
}

/**
 * Extract geographic bounds from s101-geodata-* attributes on the SVG root element.
 */
function extractGeoBounds(svg) {
  const minLat = parseFloat(svg.getAttribute('s101-geodata-min-lat'))
  const maxLat = parseFloat(svg.getAttribute('s101-geodata-max-lat'))
  const minLon = parseFloat(svg.getAttribute('s101-geodata-min-lon'))
  const maxLon = parseFloat(svg.getAttribute('s101-geodata-max-lon'))
  if ([minLat, maxLat, minLon, maxLon].some(Number.isNaN)) return null
  return { minLat, maxLat, minLon, maxLon }
}

/** Convert geographic lat/lon to SVG x/y coordinates. */
function geoToSvg(lat, lon, geo, map) {
  const lonRatio = (lon - geo.minLon) / (geo.maxLon - geo.minLon)
  const latRatio = (lat - geo.minLat) / (geo.maxLat - geo.minLat)
  const x = map.minX + lonRatio * (map.maxX - map.minX)
  const y = map.maxY - latRatio * (map.maxY - map.minY)
  return { x, y }
}

/** Resolve the active geo bounds: prop override > SVG-embedded > null */
function activeGeoBounds() {
  return props.geoBounds || geoBoundsFromSvg.value || null
}

function updateMarker() {
  const geo = activeGeoBounds()
  if (!svgEl || !drawnBounds || !geo || props.lat == null || props.lon == null) return
  const { x, y } = geoToSvg(props.lat, props.lon, geo, drawnBounds)
  markerEl = defaultMarkerStyle(svgEl, markerEl, x, y, {
    radius: props.markerRadius,
    color: props.markerColor,
  })
}

async function loadSvg() {
  svgLoaded.value = false
  loadError.value = null
  markerEl = null
  svgEl = null
  drawnBounds = null

  if (svgHost.value) svgHost.value.innerHTML = ''

  try {
    const res = await fetch(props.svgSrc)
    if (!res.ok) throw new Error(`Could not load SVG: ${props.svgSrc}`)
    const text = await res.text()
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
    svgEl = doc.documentElement

    // Ensure viewBox is set
    if (!svgEl.getAttribute('viewBox')) {
      const w = Number(svgEl.getAttribute('width')) || 920
      const h = Number(svgEl.getAttribute('height')) || 920
      svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`)
    }
    svgEl.removeAttribute('width')
    svgEl.removeAttribute('height')
    svgEl.style.width = '100%'
    svgEl.style.height = '100%'
    svgEl.style.display = 'block'

    // Extract geo bounds from SVG data attributes before appending
    geoBoundsFromSvg.value = extractGeoBounds(svgEl)

    svgHost.value.appendChild(svgEl)
    svgLoaded.value = true

    // getBBox requires the element to be in DOM – defer one frame
    await new Promise((r) => requestAnimationFrame(r))
    drawnBounds = calcDrawnBounds(svgEl)
    updateMarker()
  } catch (err) {
    loadError.value = err?.message || 'Failed to load map.'
  }
}

onMounted(() => {
  loadSvg()
})

// Re-load when SVG source changes
watch(() => props.svgSrc, loadSvg)

// Re-place marker when coordinates or bounds change
watch(
  () => [props.lat, props.lon, props.geoBounds],
  updateMarker,
  { deep: true },
)

onBeforeUnmount(() => {
  svgEl = null
  markerEl = null
  drawnBounds = null
})

function openInGoogleMaps() {
  if (props.lat == null || props.lon == null) return
  const url = `https://www.google.com/maps/search/?api=1&query=${props.lat},${props.lon}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

</script>

<style scoped>
.svg-map-item {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 140px;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.svg-map-host {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
}

.svg-map-host :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.svg-map-skeleton {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
}

.svg-map-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-3);
  font-size: 0.8rem;
  text-align: center;
  padding: 12px;
}

.svg-map-error-icon {
  font-size: 2rem;
}

.svg-map-coords {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
}

.svg-map-pin-icon {
  font-size: 0.75rem;
}
</style>
