<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⚙️</span>
        <span class="brand-text">Admin</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="sidebar-link">
          <span class="link-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div v-if="adminStore.admin" class="admin-meta">
          <span class="admin-name">{{ adminStore.admin.name }}</span>
          <span class="admin-power">power {{ adminStore.admin.power }}</span>
        </div>
        <button class="lang-toggle" @click="toggleLang">
          {{ i18nState.locale === 'en' ? '🇬🇧 EN' : '🇺🇿 UZ' }}
        </button>
        <button class="sidebar-logout" @click="logout">Logout</button>
      </div>
    </aside>

    <div class="admin-body">
      <header class="admin-topbar">
        <button class="mobile-menu-btn" @click="sidebarOpen = !sidebarOpen">☰</button>
        <span class="topbar-title">{{ currentPageTitle }}</span>
      </header>
      <main class="admin-content">
        <RouterView />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    <aside v-if="sidebarOpen" class="admin-sidebar mobile-open">
      <div class="sidebar-brand">
        <span class="brand-icon">⚙️</span>
        <span class="brand-text">Admin</span>
        <button class="close-sidebar" @click="sidebarOpen = false">✕</button>
      </div>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="sidebar-link"
          @click="sidebarOpen = false"
        >
          <span class="link-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div v-if="adminStore.admin" class="admin-meta">
          <span class="admin-name">{{ adminStore.admin.name }}</span>
          <span class="admin-power">power {{ adminStore.admin.power }}</span>
        </div>
        <button class="lang-toggle" @click="toggleLang">
          {{ i18nState.locale === 'en' ? '🇬🇧 EN' : '🇺🇿 UZ' }}
        </button>
        <button class="sidebar-logout" @click="logout">Logout</button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminStore } from '../../store/adminStore.js'
import { i18nState, setLocale } from '../../i18n/index.js'

function toggleLang() {
  setLocale(i18nState.locale === 'en' ? 'uz' : 'en')
}

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const navItems = [
  { to: '/admin/reports', icon: '📋', label: 'Reports' },
  { to: '/admin/places', icon: '🏢', label: 'Places' },
  { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/claims', icon: '📝', label: 'Claims' },
  { to: '/admin/admins', icon: '🛡️', label: 'Admins' },
]

const currentPageTitle = computed(() => {
  const match = navItems.find((item) => route.path.startsWith(item.to))
  return match ? match.label : 'Admin'
})

function logout() {
  adminStore.adminLogout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--primary);
}

.brand-icon { font-size: 1.3rem; }
.brand-text { flex: 1; }

.close-sidebar {
  font-size: 1rem;
  color: var(--text-2);
  padding: 2px 6px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-2);
  transition: all var(--transition);
}

.sidebar-link:hover {
  background: var(--surface-2);
  color: var(--text);
}

.sidebar-link.router-link-active {
  background: rgba(13, 148, 136, 0.1);
  color: var(--primary);
  font-weight: 600;
}

.link-icon { font-size: 1rem; width: 20px; text-align: center; }

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-meta {
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.admin-power {
  font-size: 0.72rem;
  color: var(--text-3);
}

.lang-toggle {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-2);
  text-align: left;
  transition: background var(--transition);
}

.lang-toggle:hover { background: var(--surface-2); color: var(--text); }

.sidebar-logout {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: #ef4444;
  text-align: left;
  transition: background var(--transition);
}

.sidebar-logout:hover { background: rgba(239, 68, 68, 0.08); }

.admin-body {
  flex: 1;
  margin-left: 220px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-topbar {
  height: 52px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.mobile-menu-btn {
  display: none;
  font-size: 1.2rem;
  color: var(--text-2);
  padding: 4px 8px;
}

.topbar-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
}

.admin-content {
  flex: 1;
  padding: 24px;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .admin-sidebar:not(.mobile-open) { display: none; }
  .admin-sidebar.mobile-open {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    box-shadow: var(--shadow-lg);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 199;
  }
  .admin-body { margin-left: 0; }
  .mobile-menu-btn { display: block; }
  .admin-content { padding: 16px; }
}
</style>
