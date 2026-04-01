<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">🗺️ Bu<span>Yelp</span>.uz</span>
        <p class="footer-desc">Discover the best places and services in Uzbekistan.</p>
      </div>
      <div class="footer-links">
        <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/search">{{ t('nav.search') }}</RouterLink>
        <RouterLink to="/login">{{ t('nav.login') }}</RouterLink>
        <RouterLink to="/register">{{ t('nav.register') }}</RouterLink>
      </div>
      <div class="footer-copy">
        © {{ new Date().getFullYear() }} BuYelp.uz — Capstone Project
      </div>
    </div>
  </footer>
</template>

<script setup>
import { t } from '../i18n/index.js'
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding: 40px 0 24px;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  text-align: center;
}

.footer-logo {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text);
}

.footer-logo span { color: var(--primary); }

.footer-desc {
  font-size: 0.85rem;
  color: var(--text-2);
  margin-top: 6px;
}

.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a {
  font-size: 0.875rem;
  color: var(--text-2);
  font-weight: 500;
  transition: color var(--transition);
}

.footer-links a:hover { color: var(--primary); }

.footer-copy {
  font-size: 0.8rem;
  color: var(--text-3);
}
</style>
