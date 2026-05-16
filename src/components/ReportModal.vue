<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')" @keydown.esc.window="$emit('close')">
      <div class="modal-box" role="dialog" aria-modal="true">
        <button class="modal-close" aria-label="Close" @click="$emit('close')">✕</button>
        <h3 class="modal-title">{{ t(`report.title_${targetType}`) }}</h3>

        <div v-if="metaLoading" class="text-muted text-sm">{{ t('common.loading') }}</div>
        <template v-else>
          <label class="form-row">
            <span>{{ t('report.label_reason') }}</span>
            <select v-model="form.type" class="form-input">
              <option value="">{{ t('report.select_reason') }}</option>
              <option v-for="rt in reportTypes" :key="rt.value" :value="rt.value">{{ rt.label }}</option>
            </select>
          </label>
          <label class="form-row">
            <span>{{ t('report.label_details') }}</span>
            <textarea
              v-model="form.text"
              class="form-input"
              rows="3"
              :maxlength="textLimit"
              :placeholder="t('report.placeholder_details')"
            ></textarea>
            <span class="char-count">{{ form.text.length }} / {{ textLimit }}</span>
          </label>
          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
          <div class="modal-actions">
            <button class="btn btn-primary btn-sm" :disabled="!form.type || submitting" @click="submit">
              {{ submitting ? t('report.submitting') : t('report.submit') }}
            </button>
            <button class="btn btn-ghost btn-sm" @click="$emit('close')">{{ t('common.cancel') }}</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { t } from '../i18n/index.js'
import { getReportMeta, submitReport } from '../api/reports.js'

const props = defineProps({
  targetId: { type: String, required: true },
  targetType: { type: String, required: true }, // 'review' | 'place'
})
const emit = defineEmits(['close', 'submitted'])

const metaLoading = ref(true)
const reportTypes = ref([])
const textLimit = ref(500)
const submitting = ref(false)
const errorMsg = ref('')

const form = reactive({ type: '', text: '' })

onMounted(async () => {
  try {
    const meta = await getReportMeta()
    textLimit.value = meta.text_input_limit || 500
    reportTypes.value = (meta.types || []).map((rt) => ({
      value: rt.value,
      label: rt.label?.en || rt.value,
    }))
  } catch (_) {}
  finally { metaLoading.value = false }
})

async function submit() {
  if (!form.type) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await submitReport({
      target_id: props.targetId,
      target_type: props.targetType,
      type: form.type,
      text: form.text,
    })
    emit('submitted')
    emit('close')
  } catch (e) {
    errorMsg.value = e.message || t('report.error')
  } finally { submitting.value = false }
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
  max-width: 440px;
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

.modal-title { font-size: 1.05rem; font-weight: 700; color: var(--text); margin: 0; text-transform: capitalize; }

.form-row { display: flex; flex-direction: column; gap: 5px; font-size: 0.85rem; color: var(--text-2); }
.form-input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.875rem; resize: vertical; }
.char-count { font-size: 0.75rem; color: var(--text-3); text-align: right; }

.error-msg { font-size: 0.85rem; color: #dc2626; }
.modal-actions { display: flex; gap: 8px; }
</style>
