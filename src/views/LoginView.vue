<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>🗺️</span>
        <span class="logo-text">Bu<span class="logo-accent">Yelp</span>.uz</span>
      </div>

      <h1 class="auth-title">{{ t('auth.login_title') }}</h1>
      <p class="auth-subtitle">{{ t('auth.login_subtitle') }}</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="login-email">{{ t('auth.email') }}</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="login-password">{{ t('auth.password') }}</label>
          <div class="password-wrap">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="••••••••"
              required
            />
            <button type="button" class="pw-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
          <span v-if="loading">⏳ Signing in…</span>
          <span v-else>{{ t('auth.login_btn') }}</span>
        </button>
      </form>

      <div class="divider-text">
        <span>OR</span>
      </div>

      <button class="btn btn-ghost btn-block" disabled style="opacity:0.5; cursor:not-allowed;">
        🔑 Continue with Google (soon)
      </button>

      <p class="auth-switch">
        {{ t('auth.no_account') }}
        <RouterLink to="/register" class="text-primary font-semibold">{{ t('auth.signup_link') }}</RouterLink>
      </p>
    </div>

    <!-- Decorative side -->
    <div class="auth-deco" aria-hidden="true">
      <img
        src="/login_bg.png"
        alt="Do'stlar birga vaqt o'tkazmoqda"
        class="deco-image"
      />
      <div class="deco-overlay">
        <p class="deco-quote">“Choyxona, tog', stadion — do'stlar bilan har joy yoqimli.”</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { t } from '../i18n/index.js'
import { store } from '../store/index.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }
  loading.value = true
  error.value = ''
  // Simulate async login
  await new Promise((r) => setTimeout(r, 800))
  store.login(email.value, password.value)
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
  gap: 20px;
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
  margin-bottom: 8px;
}

.logo-text { color: var(--text); }
.logo-accent { color: var(--primary); }

.auth-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}

.auth-subtitle {
  font-size: 0.9rem;
  color: var(--text-2);
  margin-top: -10px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-wrap {
  position: relative;
}

.password-wrap .form-input { padding-right: 44px; }

.pw-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.auth-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: 0.875rem;
}

.divider-text {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-3);
  font-size: 0.8rem;
}

.divider-text::before,
.divider-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.auth-switch {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-2);
}

/* Deco */
.auth-deco {
  position: relative;
  overflow: hidden;
}

.deco-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deco-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
  display: flex;
  align-items: flex-end;
  padding: 40px;
}

.deco-quote {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  font-style: italic;
  line-height: 1.5;
  max-width: 380px;
}

@media (max-width: 768px) {
  .auth-page { grid-template-columns: 1fr; }
  .auth-deco { display: none; }
  .auth-card { padding: 32px 24px; }
}
</style>
