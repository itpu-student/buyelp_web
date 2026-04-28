<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>🗺️</span>
        <span class="logo-text">Bu<span class="logo-accent">Yelp</span>.uz</span>
      </div>

      <h1 class="auth-title">Sign in</h1>
      <p class="auth-subtitle">
        Open our Telegram bot, request a code, and paste the 6 digits below.
        First time? An account is created automatically.
      </p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="login-code">6-digit code</label>
          <input
            id="login-code"
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            pattern="\d{6}"
            class="form-input code-input"
            placeholder="123456"
            required
          />
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading || code.length !== 6">
          <span v-if="loading">⏳ Verifying…</span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <p class="auth-switch">
        Don't have a code yet?
        <RouterLink to="/register" class="text-primary font-semibold">How to get one</RouterLink>
      </p>
    </div>

    <div class="auth-deco" aria-hidden="true">
      <img src="/login_bg.png" alt="" class="deco-image" />
      <div class="deco-overlay">
        <p class="deco-quote">"Choyxona, tog', stadion — do'stlar bilan har joy yoqimli."</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { verifyCode } from '../api/auth.js'

const router = useRouter()
const code = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  if (!/^\d{6}$/.test(code.value)) {
    error.value = 'Enter the 6-digit code.'
    return
  }
  loading.value = true
  try {
    const res = await verifyCode(code.value)
    store.setSession({ token: res.token, user: res.user })
    router.push('/')
  } catch (e) {
    error.value = e.status === 403 ? 'Account is blocked.' : 'Invalid or expired code.'
  } finally {
    loading.value = false
  }
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
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-input {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.5rem;
  letter-spacing: 0.4em;
  text-align: center;
}

.auth-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: 0.875rem;
}

.auth-switch {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-2);
}

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
