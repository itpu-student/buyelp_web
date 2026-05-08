<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="lb-backdrop"
      @click.self="emit('close')"
    >
      <button class="lb-close" aria-label="Close" @click="emit('close')">✕</button>
      <div class="lb-counter">{{ lbIndex + 1 }} / {{ images.length }}</div>

      <div class="lb-track-wrap" @click.self="emit('close')">
        <div class="lb-track" :style="lbTrackStyle">
          <div
            v-for="(src, i) in images"
            :key="i"
            class="lb-slide"
            @click="emit('close')"
          >
            <img :src="src" :alt="`Photo ${i + 1}`" class="lb-img" />
          </div>
        </div>
      </div>

      <button v-if="images.length > 1" class="lb-btn lb-btn--prev" aria-label="Previous" @click="lbPrev">&#8592;</button>
      <button v-if="images.length > 1" class="lb-btn lb-btn--next" aria-label="Next" @click="lbNext">&#8594;</button>

      <div v-if="images.length > 1" class="lb-dots">
        <button
          v-for="(_, i) in images"
          :key="i"
          class="lb-dot"
          :class="{ 'lb-dot--active': i === lbIndex }"
          @click="lbIndex = i"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  images: { type: Array, required: true },
  startIndex: { type: Number, default: 0 },
  open: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])

const lbIndex = ref(props.startIndex)

watch(() => props.open, (val) => {
  if (val) {
    lbIndex.value = props.startIndex
    document.addEventListener('keydown', onKey)
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  } else {
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchend', onTouchEnd)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
})

const lbTrackStyle = computed(() => ({
  transform: `translateX(-${lbIndex.value * 100}%)`,
  transition: 'transform 0.5s ease',
}))

function lbPrev() {
  const n = props.images.length
  lbIndex.value = (lbIndex.value - 1 + n) % n
}
function lbNext() {
  lbIndex.value = (lbIndex.value + 1) % props.images.length
}

function onKey(e) {
  if (!props.open) return
  if (e.key === 'ArrowLeft')  { e.preventDefault(); lbPrev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); lbNext() }
  if (e.key === 'Escape')     { e.preventDefault(); emit('close') }
}

let touchStartX = 0
function onTouchStart(e) {
  if (!props.open) return
  touchStartX = e.touches[0].clientX
}
function onTouchEnd(e) {
  if (!props.open) return
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 40) dx < 0 ? lbNext() : lbPrev()
}
</script>

<style scoped>
.lb-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lb-in 0.12s ease;
}

@keyframes lb-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lb-track-wrap {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.lb-track {
  display: flex;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.lb-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 10px 44px;
  box-sizing: border-box;
}

.lb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  user-select: none;
  -webkit-user-drag: none;
}

.lb-close {
  position: fixed;
  top: 18px;
  right: 22px;
  z-index: 10001;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease;
}
.lb-close:hover { background: rgba(255,255,255,0.25); }

.lb-counter {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  color: rgba(255,255,255,0.75);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  pointer-events: none;
}

.lb-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10001;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-size: 1.3rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease;
}
.lb-btn:hover { background: rgba(255,255,255,0.25); }
.lb-btn--prev { left: 18px; }
.lb-btn--next { right: 18px; }

.lb-dots {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  display: flex;
  gap: 8px;
}

.lb-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 0;
  transition: background 0.1s ease, transform 0.1s ease;
}
.lb-dot--active {
  background: #fff;
  transform: scale(1.35);
}
</style>
