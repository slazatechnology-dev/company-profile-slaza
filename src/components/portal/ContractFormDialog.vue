<template>
  <FormDialog
    :open="open"
    wide
    :title="form.id ? 'Ubah kontrak' : 'Tambah kontrak'"
    :submit-disabled="!store.clients.length"
    :deletable="!!form.id"
    delete-label="Hapus kontrak"
    :delete-blocked-reason="form.id ? store.deleteBlocker('contracts', form.id) : ''"
    @update:open="$emit('update:open', $event)"
    @submit="save"
    @delete="remove"
  >
    <p v-if="!store.clients.length" class="dialog-hint text-block">
      Belum ada klien. Tambahkan klien dulu di menu Klien.
    </p>

    <div class="form-group">
      <label class="form-label" for="ct-title">Judul proyek</label>
      <input id="ct-title" v-model.trim="form.projectTitle" type="text" required autofocus class="form-input" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="ct-client">Klien</label>
        <select id="ct-client" v-model="form.clientId" required class="form-select">
          <option value="" disabled>Pilih klien</option>
          <option v-for="c in store.clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="ct-type">Jenis proyek</label>
        <select id="ct-type" v-model="form.projectType" class="form-select">
          <option value="softwareOnly">Software</option>
          <option value="iotHardwareOnly">Hardware IoT</option>
          <option value="integratedSoftwareAndIot">Software & hardware IoT</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="ct-value">Nilai kontrak awal (Rp)</label>
        <MoneyInput id="ct-value" v-model="form.totalContractValue" required :min="0" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label" for="ct-status">Status</label>
        <select id="ct-status" v-model="form.status" class="form-select">
          <option value="draft">Draf</option>
          <option value="sent">Terkirim ke klien</option>
          <option value="signed">Ditandatangani</option>
          <option value="inProgress">Berjalan</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="ct-start">Tanggal mulai</label>
        <input id="ct-start" v-model="form.startDate" type="date" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label" for="ct-end">Tanggal selesai (boleh dikosongkan)</label>
        <input id="ct-end" v-model="form.endDate" type="date" :min="form.startDate" class="form-input" />
      </div>
    </div>

    <!-- Catatan pribadi, tidak dicetak di dokumen mana pun: tertutup kecuali sudah ada isinya -->
    <details class="form-group scope-field" :open="!!scopeText">
      <summary>Catatan ruang lingkup (opsional)</summary>
      <label class="visually-hidden" for="ct-scope">Catatan ruang lingkup</label>
      <textarea id="ct-scope" v-model="scopeText" rows="4" class="form-textarea" aria-describedby="ct-scope-hint"></textarea>
      <p id="ct-scope-hint" class="field-hint">Tulis bebas, misalnya fitur yang disepakati. Hanya untuk catatanmu, tidak muncul di invoice atau BAST.</p>
    </details>
  </FormDialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { ContractModel } from '../../models/ContractModel';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true },
  open: { type: Boolean, default: false },
  contract: { type: Object, default: null }
});

const emit = defineEmits(['update:open']);

const form = reactive({});
const scopeText = ref('');

// Isi ulang form setiap kali dialog dibuka
watch(() => props.open, (open) => {
  if (!open) return;
  const data = props.contract ? props.contract.toJson() : { ...new ContractModel({ status: 'draft' }).toJson(), id: '', totalContractValue: null };
  Object.assign(form, data);
  scopeText.value = data.scopeOfWork.join('\n');
}, { immediate: true });

const save = () => {
  const scopeOfWork = scopeText.value.split('\n').map(s => s.trim()).filter(Boolean);
  props.store.saveRecord('contracts', { ...form, scopeOfWork });
  emit('update:open', false);
};

const remove = async () => {
  if (await askConfirm({
    title: 'Hapus kontrak?',
    message: `"${form.projectTitle}" beserta termin dan tagihan rutinnya akan dihapus.`,
    note: 'Tindakan ini tidak bisa dibatalkan.',
    confirmLabel: 'Hapus kontrak',
    tone: 'danger'
  }) && props.store.deleteRecord('contracts', form.id)) {
    emit('update:open', false);
  }
};
</script>

<style scoped>
.scope-field summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.scope-field summary:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
</style>
