<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-inner">
      <!-- Logo -->
      <RouterLink to="/" class="nav-logo">
        <span class="logo-icon">🗺️</span>
        <span class="logo-text">Bu<span class="logo-accent">Yelp</span>.uz</span>
      </RouterLink>

      <!-- Center nav links -->
      <div class="nav-links" :class="{ open: mobileOpen }">
        <RouterLink to="/" class="nav-link" @click="mobileOpen = false">{{ t('nav.home') }}</RouterLink>
        <RouterLink to="/search" class="nav-link" @click="mobileOpen = false">{{ t('nav.search') }}</RouterLink>
        <template v-if="store.isLoggedIn">
          <RouterLink to="/places/new" class="nav-link" @click="mobileOpen = false">+ Add place</RouterLink>
          <RouterLink to="/profile" class="nav-link" @click="mobileOpen = false">{{ t('nav.profile') }}</RouterLink>
          <RouterLink v-if="store.user?.owns_place" to="/business" class="nav-link" @click="mobileOpen = false">{{ t('nav.business') }}</RouterLink>
        </template>
      </div>

      <!-- Right actions -->
      <div class="nav-actions">
        <!-- Lang toggle -->
        <button class="lang-toggle" @click="toggleLang" :title="locale === 'en' ? 'Switch to Uzbek' : 'Switch to English'">
          <span class="lang-flag">{{ locale === 'en' ? '🇬🇧' : '🇺🇿' }}</span>
          <span class="lang-text">{{ locale === 'en' ? 'EN' : 'UZ' }}</span>
        </button>

        <!-- Theme toggle -->
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>

        <!-- Auth buttons -->
        <template v-if="!store.isLoggedIn">
          <RouterLink to="/login" class="btn btn-ghost btn-sm">{{ t('nav.login') }}</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">{{ t('nav.register') }}</RouterLink>
        </template>
        <template v-else>
          <div class="user-menu" @click="userMenuOpen = !userMenuOpen">
            <img :src="userAvatar" :alt="store.user.name" class="avatar" width="34" height="34" />
            <span class="user-name">{{ store.user.name.split(' ')[0] }}</span>
            <span class="chevron" :class="{ rotated: userMenuOpen }">▾</span>
          </div>
          <div class="user-dropdown" v-if="userMenuOpen" @click.stop>
            <RouterLink to="/profile" class="dropdown-item" @click="userMenuOpen = false">
              👤 {{ t('nav.profile') }}
            </RouterLink>
            <RouterLink v-if="store.user?.owns_place" to="/business" class="dropdown-item" @click="userMenuOpen = false">
              🏢 {{ t('nav.business') }}
            </RouterLink>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="logout">
              🚪 {{ t('nav.logout') }}
            </button>
          </div>
        </template>

        <!-- Hamburger -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span :class="{ active: mobileOpen }"></span>
          <span :class="{ active: mobileOpen }"></span>
          <span :class="{ active: mobileOpen }"></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- Overlay for mobile menu / user dropdown -->
  <div
    v-if="mobileOpen || userMenuOpen"
    class="nav-overlay"
    @click="mobileOpen = false; userMenuOpen = false"
  ></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { t, i18nState, setLocale } from '../i18n/index.js'
import { store } from '../store/index.js'
import { staticUrl } from '../api/client.js'

const userAvatar = computed(() => {
  const u = store.user
  if (!u) return ''
  if (u.avatar_key) return staticUrl(u.avatar_key)
  if (u.avatar_url) return u.avatar_url
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=0D9488&color=fff&size=128`
})

const router = useRouter()
const route = useRoute()
const isScrolled = ref(false)
const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark')
const locale = computed(() => i18nState.locale)

function onScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleLang() {
  setLocale(i18nState.locale === 'en' ? 'uz' : 'en')
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('s101__theme', isDark.value ? 'dark' : 'light')
}

watch(route, () => {
  mobileOpen.value = false
  userMenuOpen.value = false
})

function logout() {
  store.logout()
  userMenuOpen.value = false
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
  const savedTheme = localStorage.getItem('s101__theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--nav-height);
  background: transparent;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .navbar.scrolled {
  background: rgba(20, 28, 46, 0.9);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 24px;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary);
  flex-shrink: 0;
}

.logo-icon { font-size: 1.4rem; }
.logo-text { color: var(--text); }
.logo-accent { color: var(--primary); }

/* Nav links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-2);
  transition: all var(--transition);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary);
  background: rgba(13, 148, 136, 0.08);
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  position: relative;
}

.lang-toggle,
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: var(--surface-2);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-2);
  transition: all var(--transition);
}

.lang-toggle:hover,
.theme-toggle:hover {
  background: var(--border);
  color: var(--text);
}

.lang-flag { font-size: 1rem; }
.lang-text { font-size: 0.75rem; }

/* User menu */
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all var(--transition);
}

.user-menu:hover { border-color: var(--primary); }

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
}

.chevron {
  font-size: 0.7rem;
  color: var(--text-3);
  transition: transform var(--transition);
}

.chevron.rotated { transform: rotate(180deg); }

.user-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 180px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  animation: fadeUp 0.2s ease;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  transition: background var(--transition);
  width: 100%;
  text-align: left;
}

.dropdown-item:hover { background: var(--surface-2); }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background: rgba(239, 68, 68, 0.08); }

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 6px;
}

.hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 16px;
    gap: 4px;
    z-index: 1000;
    transform: translateY(-110%);
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-md);
  }
  .nav-links.open { transform: translateY(0); }
  .nav-link { width: 100%; padding: 12px 16px; }
  .user-name { display: none; }
  .lang-text { display: none; }
}
</style>
