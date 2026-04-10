/**
 * SVG Map Marker Styles
 *
 * Each marker function draws a distinct visual marker onto an SVG element.
 *
 * Signature:  (svgEl, markerEl, x, y, opts) => markerEl
 *   - svgEl:     the root SVG DOM element
 *   - markerEl:  existing marker group/element (null on first call)
 *   - x, y:      SVG coordinates for the marker
 *   - opts:      { radius, color }
 *   - returns:   the created/updated marker element (stored by caller)
 */

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Helper: ensure <defs> exists in the SVG */
function ensureDefs(svgEl) {
  return svgEl.querySelector('defs') || (() => {
    const d = document.createElementNS(SVG_NS, 'defs')
    svgEl.insertBefore(d, svgEl.firstChild)
    return d
  })()
}

// ═══════════════════════════════════════════════════════════════════════════════
// Pulsing Glow Ring
// A solid circle with a soft pulsing outer glow ring.
// ═══════════════════════════════════════════════════════════════════════════════
export function placeMarkerPulsingGlowRing(svgEl, markerEl, x, y, opts) {
  if (!svgEl) return markerEl
  const { radius: r, color } = opts

  if (!markerEl) {
    // Outer glow ring
    const glow = document.createElementNS(SVG_NS, 'circle')
    glow.setAttribute('r', String(r * 2))
    glow.setAttribute('fill', color)
    glow.setAttribute('opacity', '0.2')
    glow.id = 'latLonGlow'
    svgEl.appendChild(glow)

    // Main dot
    markerEl = document.createElementNS(SVG_NS, 'circle')
    markerEl.setAttribute('r', String(r))
    markerEl.setAttribute('fill', color)
    markerEl.setAttribute('stroke', '#ffffff')
    markerEl.setAttribute('stroke-width', '2.5')
    markerEl.id = 'latLonMarker'
    svgEl.appendChild(markerEl)

    // Pulse animation
    const style = document.createElementNS(SVG_NS, 'style')
    style.textContent = `
      #latLonGlow { animation: svgPulse 2s ease-in-out infinite; transform-origin: ${x}px ${y}px; }
      @keyframes svgPulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.35;transform:scale(1.4)} }
    `
    svgEl.appendChild(style)

    const glowEl = svgEl.querySelector('#latLonGlow')
    if (glowEl) {
      glowEl.setAttribute('cx', String(x))
      glowEl.setAttribute('cy', String(y))
      glowEl.style.transformOrigin = `${x}px ${y}px`
    }
  }

  markerEl.setAttribute('cx', String(x))
  markerEl.setAttribute('cy', String(y))

  const glowEl = svgEl.querySelector('#latLonGlow')
  if (glowEl) {
    glowEl.setAttribute('cx', String(x))
    glowEl.setAttribute('cy', String(y))
  }

  return markerEl
}

// ═══════════════════════════════════════════════════════════════════════════════
// Classic Pin (Google Maps style)
// A teardrop map pin with a white inner dot. Drops in with a bounce.
// ═══════════════════════════════════════════════════════════════════════════════
export function placeMarkerClassicPin(svgEl, markerEl, x, y, opts) {
  if (!svgEl) return markerEl
  const { radius: r, color } = opts

  if (!markerEl) {
    const defs = ensureDefs(svgEl)

    // Drop shadow filter
    const filter = document.createElementNS(SVG_NS, 'filter')
    filter.id = 'pinShadow'
    filter.innerHTML = `
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35"/>
    `
    defs.appendChild(filter)

    // Pin group
    const g = document.createElementNS(SVG_NS, 'g')
    g.id = 'latLonPin'
    g.setAttribute('filter', 'url(#pinShadow)')

    // Teardrop path
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', `
      M ${x} ${y}
      C ${x - r * 0.6} ${y - r * 1.2}, ${x - r * 1.4} ${y - r * 1.8}, ${x - r * 1.4} ${y - r * 2.2}
      A ${r * 1.4} ${r * 1.4} 0 1 1 ${x + r * 1.4} ${y - r * 2.2}
      C ${x + r * 1.4} ${y - r * 1.8}, ${x + r * 0.6} ${y - r * 1.2}, ${x} ${y}
      Z
    `)
    path.setAttribute('fill', color)
    path.setAttribute('stroke', '#fff')
    path.setAttribute('stroke-width', '1.5')
    g.appendChild(path)

    // White inner dot
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', String(x))
    dot.setAttribute('cy', String(y - r * 2.2))
    dot.setAttribute('r', String(r * 0.55))
    dot.setAttribute('fill', '#ffffff')
    g.appendChild(dot)

    svgEl.appendChild(g)

    // Bounce-in animation
    const style = document.createElementNS(SVG_NS, 'style')
    style.textContent = `
      #latLonPin {
        animation: pinBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transform-origin: ${x}px ${y}px;
      }
      @keyframes pinBounce {
        0%   { transform: translateY(-40px) scale(0.3); opacity: 0; }
        60%  { transform: translateY(4px) scale(1.05); opacity: 1; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
    `
    svgEl.appendChild(style)
    markerEl = g
  }

  return markerEl
}

// ═══════════════════════════════════════════════════════════════════════════════
// Radar Sonar Ripple
// Expanding concentric rings that fade out. Uses SVG-native SMIL animations
// on r / opacity / stroke-width so they expand from center reliably.
// Apple-smooth with spline easing and a slow 4s cycle.
// ═══════════════════════════════════════════════════════════════════════════════
export function placeMarkerRadarSonarRipple(svgEl, markerEl, x, y, opts) {
  if (!svgEl) return markerEl
  const { radius: r, color } = opts
  const maxR = r * 13
  const dur = '4s'
  const ringCount = 2

  if (!markerEl) {
    const g = document.createElementNS(SVG_NS, 'g')
    g.id = 'latLonRadar'

    for (let i = 0; i < ringCount; i++) {
      const ring = document.createElementNS(SVG_NS, 'circle')
      ring.setAttribute('cx', String(x))
      ring.setAttribute('cy', String(y))
      ring.setAttribute('r', String(r * 0.7))
      ring.setAttribute('fill', 'none')
      ring.setAttribute('stroke', color)
      ring.setAttribute('stroke-width', '3')
      ring.setAttribute('opacity', '0')

      const delay = `${i * (4 / ringCount)}s`

      // Animate radius with ease-out spline
      const animR = document.createElementNS(SVG_NS, 'animate')
      animR.setAttribute('attributeName', 'r')
      animR.setAttribute('values', `${r * 0.7};${maxR}`)
      animR.setAttribute('keyTimes', '0;1')
      animR.setAttribute('calcMode', 'spline')
      animR.setAttribute('keySplines', '0.25 0.1 0.25 1')
      animR.setAttribute('dur', dur)
      animR.setAttribute('begin', delay)
      animR.setAttribute('repeatCount', 'indefinite')
      ring.appendChild(animR)

      // Animate opacity: gentle fade
      const animO = document.createElementNS(SVG_NS, 'animate')
      animO.setAttribute('attributeName', 'opacity')
      animO.setAttribute('values', '0.6;0.45;0.15;0')
      animO.setAttribute('keyTimes', '0;0.3;0.7;1')
      animO.setAttribute('calcMode', 'spline')
      animO.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1')
      animO.setAttribute('dur', dur)
      animO.setAttribute('begin', delay)
      animO.setAttribute('repeatCount', 'indefinite')
      ring.appendChild(animO)

      // Animate stroke-width: thick → thin
      const animS = document.createElementNS(SVG_NS, 'animate')
      animS.setAttribute('attributeName', 'stroke-width')
      animS.setAttribute('values', '3;1.5;0.4')
      animS.setAttribute('keyTimes', '0;0.5;1')
      animS.setAttribute('calcMode', 'spline')
      animS.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1')
      animS.setAttribute('dur', dur)
      animS.setAttribute('begin', delay)
      animS.setAttribute('repeatCount', 'indefinite')
      ring.appendChild(animS)

      g.appendChild(ring)
    }

    // Center dot
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', String(x))
    dot.setAttribute('cy', String(y))
    dot.setAttribute('r', String(r * 0.7))
    dot.setAttribute('fill', color)
    dot.setAttribute('stroke', '#fff')
    dot.setAttribute('stroke-width', '2')

    const dotPulse = document.createElementNS(SVG_NS, 'animate')
    dotPulse.setAttribute('attributeName', 'r')
    dotPulse.setAttribute('values', `${r * 0.7};${r * 0.85};${r * 0.7}`)
    dotPulse.setAttribute('keyTimes', '0;0.5;1')
    dotPulse.setAttribute('calcMode', 'spline')
    dotPulse.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1')
    dotPulse.setAttribute('dur', '4s')
    dotPulse.setAttribute('repeatCount', 'indefinite')
    dot.appendChild(dotPulse)

    g.appendChild(dot)
    svgEl.appendChild(g)
    markerEl = g
  }

  return markerEl
}

// ═══════════════════════════════════════════════════════════════════════════════
// Warm Gradient Blob
// Soft, organic shape with a radial gradient and gentle breathing animation.
// Feels friendly and human. Uses SMIL for reliable SVG animation.
// ═══════════════════════════════════════════════════════════════════════════════
export function placeMarkerWarmGradientBlob(svgEl, markerEl, x, y, opts) {
  if (!svgEl) return markerEl
  const { radius: r, color } = opts

  if (!markerEl) {
    const defs = ensureDefs(svgEl)

    // Radial gradient
    const grad = document.createElementNS(SVG_NS, 'radialGradient')
    grad.id = 'blobGrad'
    grad.innerHTML = `
      <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="${color}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
    `
    defs.appendChild(grad)

    const g = document.createElementNS(SVG_NS, 'g')
    g.id = 'latLonBlob'

    // Soft outer glow blob
    const blob = document.createElementNS(SVG_NS, 'circle')
    blob.setAttribute('cx', String(x))
    blob.setAttribute('cy', String(y))
    blob.setAttribute('r', String(r * 2.2))
    blob.setAttribute('fill', 'url(#blobGrad)')

    // Slow breathing: radius
    const blobR = document.createElementNS(SVG_NS, 'animate')
    blobR.setAttribute('attributeName', 'r')
    blobR.setAttribute('values', `${r * 2.2};${r * 2.8};${r * 2.2}`)
    blobR.setAttribute('keyTimes', '0;0.5;1')
    blobR.setAttribute('calcMode', 'spline')
    blobR.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1')
    blobR.setAttribute('dur', '5s')
    blobR.setAttribute('repeatCount', 'indefinite')
    blob.appendChild(blobR)

    // Subtle opacity breathing
    const blobO = document.createElementNS(SVG_NS, 'animate')
    blobO.setAttribute('attributeName', 'opacity')
    blobO.setAttribute('values', '0.75;1;0.75')
    blobO.setAttribute('keyTimes', '0;0.5;1')
    blobO.setAttribute('calcMode', 'spline')
    blobO.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1')
    blobO.setAttribute('dur', '5s')
    blobO.setAttribute('repeatCount', 'indefinite')
    blob.appendChild(blobO)

    g.appendChild(blob)

    // Inner white-outlined dot
    const core = document.createElementNS(SVG_NS, 'circle')
    core.setAttribute('cx', String(x))
    core.setAttribute('cy', String(y))
    core.setAttribute('r', String(r * 0.6))
    core.setAttribute('fill', '#ffffff')
    core.setAttribute('stroke', color)
    core.setAttribute('stroke-width', '1.5')

    // Gentle dot breathing
    const coreR = document.createElementNS(SVG_NS, 'animate')
    coreR.setAttribute('attributeName', 'r')
    coreR.setAttribute('values', `${r * 0.6};${r * 0.72};${r * 0.6}`)
    coreR.setAttribute('keyTimes', '0;0.5;1')
    coreR.setAttribute('calcMode', 'spline')
    coreR.setAttribute('keySplines', '0.4 0 0.2 1;0.4 0 0.2 1')
    coreR.setAttribute('dur', '4s')
    coreR.setAttribute('repeatCount', 'indefinite')
    core.appendChild(coreR)

    g.appendChild(core)
    svgEl.appendChild(g)
    markerEl = g
  }

  return markerEl
}


/** Default marker style (fallback). */
export const defaultMarkerStyle = placeMarkerRadarSonarRipple
// export const defaultMarkerStyle = placeMarkerClassicPin
