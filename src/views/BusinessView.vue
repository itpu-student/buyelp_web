<template>
  <div class="page-content">
    <div class="container">
      <div class="business-placeholder">
        <span class="placeholder-icon">🏢</span>
        <h1 class="placeholder-title">Business Dashboard</h1>
        <p class="text-muted">Business management tools are coming soon.</p>
        <p class="text-muted text-sm">You can manage your claimed place here once this feature is ready.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.business-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 24px;
  gap: 12px;
}

.placeholder-icon { font-size: 3rem; }
.placeholder-title { font-size: 1.6rem; font-weight: 800; color: var(--text); }
.text-muted { color: var(--text-2); }
.text-sm { font-size: 0.875rem; }
</style>
