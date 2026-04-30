<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-header">
        <span class="login-icon">⚙️</span>
        <h1 class="login-title">Admin Login</h1>
        <p class="text-muted text-sm">Sign in to the admin panel</p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label class="form-label">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="admin"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '../../api/adminAuth.js'
import { adminStore } from '../../store/adminStore.js'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', password: '' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await adminLogin(form.value)
    adminStore.setAdminSession({ token: res.token, admin: res.admin })
    router.push('/admin/reports')
  } catch (e) {
    error.value = e.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg);
}

.login-card {
  width: 100%;
  max-width: 380px;
  padding: 36px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
.login-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }

.login-form { display: flex; flex-direction: column; gap: 18px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.85rem; font-weight: 600; color: var(--text-2); }
.form-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-size: 0.9rem;
  transition: border-color var(--transition);
}
.form-input:focus { outline: none; border-color: var(--primary); }

.error-msg {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: #ef4444;
  font-size: 0.85rem;
}

.w-full { width: 100%; }
</style>
