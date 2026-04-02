<template>
  <div class="review-card">
    <div class="review-header">
      <img
        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=0D9488&color=fff&size=64`"
        :alt="review.author"
        class="avatar"
        width="40"
        height="40"
      />
      <div class="review-meta">
        <span class="author-name">{{ review.author }}</span>
        <span class="review-date">{{ formatDate(review.date) }}</span>
      </div>
      <StarRating :rating="review.rating" :size="15" mode="simple" />
    </div>
    <p class="review-text">{{ review.text }}</p>
  </div>
</template>

<script setup>
import StarRating from './StarRating.vue'

defineProps({
  review: { type: Object, required: true },
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.review-card {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar { border-radius: 50%; flex-shrink: 0; }

.review-meta {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.author-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
}

.review-date {
  font-size: 0.78rem;
  color: var(--text-3);
}

.review-stars {
  color: var(--accent);
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.review-text {
  font-size: 0.9rem;
  color: var(--text-2);
  line-height: 1.6;
}
</style>
