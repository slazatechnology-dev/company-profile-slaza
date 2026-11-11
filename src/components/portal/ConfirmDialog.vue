<template>
  <!-- Dialog konfirmasi portal. Escape / klik di luar = batal. Fokus awal di tombol yang aman. -->
  <dialog
    ref="dialogEl"
    class="confirm-dialog"
    :class="state.tone"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @close="answerConfirm(false)"
    @click="closeOnBackdrop"
  >
    <div class="confirm-body">
      <span class="confirm-mark" aria-hidden="true">{{ state.noticeOnly ? 'i' : state.tone === 'danger' ? '!' : '?' }}</span>
      <div class="confirm-text">
        <h2 id="confirm-title" class="confirm-title">{{ state.title }}</h2>
        <p v-if="state.message" id="confirm-message" class="confirm-message">{{ state.message }}</p>

        <dl v-if="state.facts.length" class="confirm-facts">
          <div v-for="[label, value] in state.facts" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>

        <p v-if="state.note" class="confirm-note">{{ state.note }}</p>
      </div>
    </div>

    <div class="confirm-footer">
      <button v-if="!state.noticeOnly" ref="cancelEl" type="button" class="btn btn-secondary" @click="answerConfirm(false)">Batal</button>
      <button
        ref="okEl"
        type="button"
        class="btn"
        :class="state.tone === 'danger' && !state.noticeOnly ? 'btn-danger-solid' : 'btn-primary'"
        @click="answerConfirm(true)"
      >
        {{ state.confirmLabel }}
      </button>
    </div>
  </dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { confirmState as state, answerConfirm } from '../../composables/useConfirm';

const dialogEl = ref(null);
const cancelEl = ref(null);
const okEl = ref(null);

watch(() => state.open, async (open) => {
  const el = dialogEl.value;
  if (!el) return;
  if (open && !el.open) {
    el.showModal();
    await nextTick();
    // Tindakan berbahaya: fokus di Batal, supaya Enter tidak langsung menghapus
    (state.tone === 'danger' && !state.noticeOnly ? cancelEl.value : okEl.value)?.focus();
  }
  if (!open && el.open) el.close();
});

const closeOnBackdrop = (event) => {
  if (event.target === dialogEl.value) dialogEl.value.close();
};
</script>

<style scoped>
.confirm-dialog {
  margin: auto;
  width: min(460px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 16px 40px rgba(9, 13, 22, 0.28);
  color: var(--text-primary);
  background: #ffffff;
}

.confirm-dialog::backdrop {
  background: rgba(9, 13, 22, 0.55);
}

.confirm-dialog[open] {
  animation: confirm-in 140ms ease-out;
}

@keyframes confirm-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .confirm-dialog[open] {
    animation: none;
  }
}

.confirm-body {
  display: flex;
  gap: 16px;
  padding: 24px 24px 20px;
}

/* Penanda nada: cobalt untuk konfirmasi biasa, merah untuk hapus/timpa data */
.confirm-mark {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #dbeafe;
  color: var(--accent-primary);
  font-weight: 800;
  font-size: 1.1rem;
}

.danger .confirm-mark {
  background: #fee2e2;
  color: #b91c1c;
}

.confirm-text {
  flex: 1;
  min-width: 0;
}

.confirm-title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.35;
  margin: 8px 0 6px;
  overflow-wrap: anywhere;
}

.confirm-message {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.confirm-facts {
  margin-top: 14px;
  padding: 4px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.confirm-facts div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  font-size: 0.9rem;
}

.confirm-facts div + div {
  border-top: 1px solid var(--card-border);
}

.confirm-facts dt {
  flex-shrink: 0;
  max-width: 50%;
  color: var(--text-muted);
}

.confirm-facts dd {
  min-width: 0; /* nilai panjang turun baris, tidak melebarkan dialog di layar HP */
  font-weight: 700;
  text-align: right;
  overflow-wrap: anywhere;
}

.confirm-note {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.danger .confirm-note {
  color: #b91c1c;
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid var(--card-border);
  background: var(--bg-secondary);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.confirm-footer .btn {
  min-height: 44px;
}

.btn-danger-solid {
  background: #b91c1c;
  border: 1px solid #b91c1c;
  color: #ffffff;
}

.btn-danger-solid:hover {
  background: #991b1b;
}

.btn-danger-solid:focus-visible {
  outline: 2px solid #b91c1c;
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .confirm-footer .btn {
    flex: 1;
  }
}
</style>
