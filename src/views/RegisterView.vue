<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>🗺️</span>
        <span class="logo-text">Bu<span class="logo-accent">Yelp</span>.uz</span>
      </div>

      <h1 class="auth-title">{{ t('auth.register_title') }}</h1>
      <p class="auth-subtitle">{{ t('auth.register_subtitle') }}</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="reg-name">{{ t('auth.name') }}</label>
          <input id="reg-name" v-model="name" type="text" class="form-input" placeholder="Sherzod Abdullayev" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-email">{{ t('auth.email') }}</label>
          <input id="reg-email" v-model="email" type="email" class="form-input" placeholder="you@example.com" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-password">{{ t('auth.password') }}</label>
          <div class="password-wrap">
            <input
              id="reg-password"
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              class="form-input"
              placeholder="Min. 8 characters"
              required
            />
            <button type="button" class="pw-toggle" @click="showPw = !showPw">
              {{ showPw ? '🙈' : '👁️' }}
            </button>
          </div>
          <!-- password strength -->
          <div class="pw-strength" v-if="password.length">
            <div class="pw-bar" :style="{ width: pwStrengthPct + '%', background: pwStrengthColor }"></div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="reg-confirm">{{ t('auth.confirm_password') }}</label>
          <input
            id="reg-confirm"
            v-model="confirm"
            :type="showPw ? 'text' : 'password'"
            class="form-input"
            :class="{ 'input-error': confirm && confirm !== password }"
            placeholder="Repeat password"
            required
          />
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
          <span v-if="loading">⏳ Creating account…</span>
          <span v-else>{{ t('auth.register_btn') }}</span>
        </button>
      </form>

      <p class="auth-switch">
        {{ t('auth.have_account') }}
        <RouterLink to="/login" class="text-primary font-semibold">{{ t('auth.signin_link') }}</RouterLink>
      </p>
    </div>

    <div class="auth-deco" aria-hidden="true">
      <img
        src="https://images.unsplash.com/photo-1591522810850-58128c5fb089?w=900&q=80"
        alt="Samarkand"
        class="deco-image"
      />
      <div class="deco-overlay">
        <p class="deco-quote">"Join thousands of Uzbekistan locals sharing their favourite spots."</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../i18n/index.js'
import { store } from '../store/index.js'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const showPw = ref(false)
const loading = ref(false)
const error = ref('')

const pwStrengthPct = computed(() => {
  const len = password.value.length
  if (len === 0) return 0
  if (len < 6) return 25
  if (len < 10) return 60
  return 100
})

const pwStrengthColor = computed(() => {
  const p = pwStrengthPct.value
  if (p < 30) return '#ef4444'
  if (p < 65) return '#f59e0b'
  return '#22c55e'
})

async function handleRegister() {
  error.value = ''
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters.'
    return
  }
  loading.value = true
  await new Promise((r) => setTimeout(r, 900))
  store.register(name.value, email.value, password.value)
  loading.value = false
  router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.auth-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  border-radius: 0;
  border: none;
  box-shadow: none;
  border-right: 1px solid var(--border);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 800;
}

.logo-text { color: var(--text); }
.logo-accent { color: var(--primary); }

.auth-title { font-size: 1.8rem; font-weight: 800; color: var(--text); }
.auth-subtitle { font-size: 0.9rem; color: var(--text-2); margin-top: -8px; }

.auth-form { display: flex; flex-direction: column; gap: 14px; }

.password-wrap { position: relative; }
.password-wrap .form-input { padding-right: 44px; }
.pw-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 1rem; }

.pw-strength {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}

.pw-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease, background 0.3s ease;
}

.input-error { border-color: #ef4444 !important; }

.auth-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: 0.875rem;
}

.auth-switch { text-align: center; font-size: 0.875rem; color: var(--text-2); }

.auth-deco { position: relative; overflow: hidden; }
.deco-image { width: 100%; height: 100%; object-fit: cover; }
.deco-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
  display: flex; align-items: flex-end; padding: 40px;
}
.deco-quote { font-size: 1.3rem; font-weight: 600; color: #fff; font-style: italic; line-height: 1.5; max-width: 380px; }

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-deco { display: none; }
  .auth-card { padding: 32px 24px; }
}
</style>
