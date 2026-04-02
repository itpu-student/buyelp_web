<template>
  <div class="star-rating" :style="{ '--star-size': size + 'px' }">
    <div v-for="i in 5" :key="i" class="star-box">
      <!-- Background of the box (gray) -->
      <div class="star-bg"></div>
      
      <!-- Colored fill of the box -->
      <div 
        class="star-fill" 
        :style="{ 
          width: getOffset(i) + '%',
          backgroundColor: color || 'var(--accent)'
        }"
      ></div>

      <!-- Star mask (white star shape cutout) -->
      <svg viewBox="0 0 24 24" class="star-mask" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: { type: Number, required: true, default: 0 },
  size: { type: Number, default: 18 },
  color: { type: String, default: '' }
})

const getOffset = (index) => {
  const diff = props.rating - (index - 1)
  if (diff <= 0) return 0
  if (diff >= 1) return 100
  return diff * 100
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 2px;
}

.star-box {
  position: relative;
  width: var(--star-size);
  height: var(--star-size);
  border-radius: 2px;
  overflow: hidden;
  background: var(--border-light, #f1f5f9); /* Default gray bg */
}

.star-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s ease;
}

.star-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  fill: var(--surface, #ffffff); /* Matches background surface */
}

/* data-theme compatibility */
[data-theme="dark"] .star-mask {
  fill: var(--surface, #141c2e);
}
</style>
