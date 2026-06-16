<template>
  <div v-if="metrics.length" class="rating-breakdown">
    <div v-for="m in metrics" :key="m.key" class="rb-metric">
      <span class="rb-label">{{ m.label }}</span>
      <div class="rb-boxes" :style="{ '--rb-box': size + 'px' }">
        <div
          v-for="(icon, i) in m.icons"
          :key="i"
          class="rb-box"
          :class="{ filled: offset(m.value, i) > 0 }"
        >
          <div class="rb-fill" :style="{ width: offset(m.value, i) + '%', background: m.color }"></div>
          <span class="rb-emoji">{{ icon }}</span>
        </div>
      </div>
      <span class="rb-val">{{ m.value.toFixed(1) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { t } from '../i18n/index.js'
import { PRICE_ICONS, QUALITY_ICONS } from '../data/ratingScales.js'

const props = defineProps({
  price: { type: Number, default: 0 },
  quality: { type: Number, default: 0 },
  size: { type: Number, default: 24 },
})

// How much of box `i` (0-based) is reached by `value`, as a 0–100 width.
function offset(value, i) {
  const d = value - i
  if (d <= 0) return 0
  if (d >= 1) return 100
  return d * 100
}

const metrics = computed(() => [
  { key: 'price', label: t('review.price'), icons: PRICE_ICONS, color: 'rgba(21, 128, 61, 0.85)', value: props.price }, // TODO: I might want ot change this color
  { key: 'quality', label: t('review.quality'), icons: QUALITY_ICONS, color: 'rgba(13, 148, 136, 0.85)', value: props.quality },
].filter((m) => m.value > 0))
</script>

<style scoped>
.rating-breakdown {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.rating-breakdown::-webkit-scrollbar { display: none; }
.rb-metric { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.rb-label { font-size: 0.8rem; color: var(--text-3); }
.rb-boxes { display: flex; gap: 3px; }

.rb-box {
  position: relative;
  width: var(--rb-box, 24px);
  height: var(--rb-box, 24px);
  border-radius: 6px;
  overflow: hidden;
  background: var(--surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.rb-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s ease;
}
.rb-emoji {
  position: relative;
  z-index: 1;
  font-size: calc(var(--rb-box, 24px) * 0.6);
  line-height: 1;
  filter: grayscale(1);
  opacity: 0.4;
  transition: filter 0.2s ease, opacity 0.2s ease;
}
.rb-box.filled .rb-emoji { filter: none; opacity: 1; }

.rb-val { font-size: 0.82rem; font-weight: 700; color: var(--text-2); }
</style>
