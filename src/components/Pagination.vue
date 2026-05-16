<template>
  <div class="pagination">
    <button class="page-btn" :disabled="current <= 1" @click="$emit('go', current - 1)">‹</button>
    <template v-for="p in pages" :key="p">
      <span v-if="p === '...'" class="page-ellipsis">…</span>
      <button v-else :class="['page-btn', { active: p === current }]" @click="$emit('go', p)">{{ p }}</button>
    </template>
    <button class="page-btn" :disabled="current >= total" @click="$emit('go', current + 1)">›</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
defineEmits(['go'])

const pages = computed(() => {
  const { current: c, total: t } = props
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const out = [1]
  if (c > 3) out.push('...')
  for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) out.push(i)
  if (c < t - 2) out.push('...')
  out.push(t)
  return out
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-2);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--surface-2);
  color: var(--text);
}

.page-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-ellipsis {
  color: var(--text-3);
  font-size: 0.875rem;
  padding: 0 4px;
  user-select: none;
}
</style>
