<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')" @keydown.esc.window="$emit('close')">
      <div class="modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close" @click="$emit('close')">✕</button>
        <h3 class="modal-title">{{ t('claim.title') }}</h3>
        <p class="modal-hint">{{ t('claim.hint') }}</p>

        <label class="form-row">
          <span>{{ t('claim.label_phone') }} <span class="required">*</span></span>
          <input v-model="phone" class="form-input" placeholder="+998 ..." />
        </label>
        <label class="form-row">
          <span>{{ t('claim.label_note') }}</span>
          <textarea v-model="note" class="form-input" rows="3" :placeholder="t('claim.placeholder_note')"></textarea>
        </label>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div class="modal-actions">
          <button class="btn btn-primary btn-sm" :disabled="!phone.trim() || submitting" @click="submit">
            {{ submitting ? t('claim.submitting') : t('claim.submit') }}
          </button>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { t } from '../i18n/index.js'
import { createClaim } from '../api/claims.js'

const props = defineProps({
  placeId: { type: String, required: true },
})
const emit = defineEmits(['close', 'submitted'])

const phone = ref('')
const note = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function submit() {
  if (!phone.value.trim()) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await createClaim({ place_id: props.placeId, phone: phone.value.trim(), note: note.value.trim() })
    emit('submitted')
    emit('close')
  } catch (e) {
    errorMsg.value = e.message || t('claim.error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  animation: fade-in 0.12s ease;
}
@keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }

.modal-box {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  padding: 28px 24px 24px;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.35));
}

.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; cursor: pointer;
  color: var(--text-3); font-size: 1rem;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), color var(--transition);
}
.modal-close:hover { background: var(--surface-2); color: var(--text); }

.modal-title { font-size: 1.05rem; font-weight: 700; color: var(--text); margin: 0; }
.modal-hint { font-size: 0.85rem; color: var(--text-3); margin: 0; }

.form-row { display: flex; flex-direction: column; gap: 5px; font-size: 0.85rem; color: var(--text-2); }
.form-input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.875rem; resize: vertical; }
.required { color: #dc2626; }

.error-msg { font-size: 0.85rem; color: #dc2626; }
.modal-actions { display: flex; gap: 8px; }
</style>
