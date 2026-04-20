<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <span>🗺️</span>
        <span class="logo-text">Bu<span class="logo-accent">Yelp</span>.uz</span>
      </div>

      <h1 class="auth-title">Create your account</h1>
      <p class="auth-subtitle">
        We don't use passwords. Sign up by verifying a one-time code from our Telegram bot —
        your account is created the first time you log in.
      </p>

      <ol class="steps">
        <li>
          Open
          <a href="https://t.me/buyelp_bot" target="_blank" rel="noopener" class="text-primary font-semibold">
            @buyelp_bot
          </a>
          on Telegram.
        </li>
        <li>Send <code>/start</code> and follow the prompts.</li>
        <li>Copy the 6-digit code it replies with.</li>
        <li>Paste it on the sign-in page.</li>
      </ol>

      <RouterLink to="/login" class="btn btn-primary btn-block btn-lg">
        Continue to sign in
      </RouterLink>
    </div>

    <div class="auth-deco" aria-hidden="true">
      <img src="/register_bg.jpeg" alt="" class="deco-image" />
      <div class="deco-overlay">
        <p class="deco-quote">"Futbol, piknik, sauna — yaqinlaringiz bilan birga bo'ling."</p>
      </div>
    </div>
  </div>
</template>

<script setup>
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
}

.logo-text { color: var(--text); }
.logo-accent { color: var(--primary); }

.auth-title { font-size: 1.8rem; font-weight: 800; color: var(--text); }
.auth-subtitle { font-size: 0.9rem; color: var(--text-2); margin-top: -8px; line-height: 1.5; }

.steps {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--text);
}

.steps code {
  background: var(--border);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
}

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
