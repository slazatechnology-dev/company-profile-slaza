<template>
  <dialog
    ref="dialogEl"
    class="portal-dialog"
    :class="{ wide }"
    :aria-labelledby="titleId"
    @close="$emit('update:open', false)"
    @click="closeOnBackdrop"
  >
    <form @submit.prevent="$emit('submit')">
      <div class="dialog-header">
        <h2 :id="titleId">{{ title }}</h2>
        <button type="button" class="btn-text" @click="dialogEl.close()">Tutup</button>
      </div>

      <div class="dialog-body">
        <slot />
      </div>

      <div class="dialog-footer">
        <div v-if="deletable" class="delete-area">
          <button
            type="button"
            class="btn btn-danger"
            :disabled="!!deleteBlockedReason"
            :aria-describedby="deleteBlockedReason ? reasonId : undefined"
            @click="$emit('delete')"
          >
            {{ deleteLabel }}
          </button>
          <p v-if="deleteBlockedReason" :id="reasonId" class="field-hint">{{ deleteBlockedReason }}</p>
        </div>
        <button type="button" class="btn btn-secondary" @click="dialogEl.close()">Batal</button>
        <button type="submit" class="btn btn-primary" :disabled="submitDisabled">{{ submitLabel }}</button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import { ref, watch, onMounted, useId } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  submitLabel: { type: String, default: 'Simpan' },
  submitDisabled: { type: Boolean, default: false },
  deletable: { type: Boolean, default: false },
  deleteLabel: { type: String, default: 'Hapus' },
  deleteBlockedReason: { type: String, default: '' },
  wide: { type: Boolean, default: false }
});

defineEmits(['update:open', 'submit', 'delete']);

const dialogEl = ref(null);
const titleId = useId();
const reasonId = useId();

// Dialog native: Escape, tombol Tutup, dan klik di luar dialog memicu "close" -> update:open false.
const sync = (open) => {
  const el = dialogEl.value;
  if (!el) return;
  if (open && !el.open) el.showModal();
  if (!open && el.open) el.close();
};
watch(() => props.open, sync);
onMounted(() => sync(props.open));

const closeOnBackdrop = (event) => {
  if (event.target === dialogEl.value) dialogEl.value.close();
};
</script>
