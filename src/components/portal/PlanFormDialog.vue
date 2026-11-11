<template>
  <FormDialog
    :open="open"
    :title="form.id ? 'Ubah tagihan rutin' : 'Tambah tagihan rutin'"
    :deletable="!!form.id"
    delete-label="Hapus tagihan"
    @update:open="$emit('update:open', $event)"
    @submit="save"
    @delete="remove"
  >
    <div class="form-group">
      <label class="form-label" for="pl-kind">Jenis tagihan</label>
      <select id="pl-kind" v-model="form.kind" autofocus class="form-select">
        <option value="server">Biaya server / hosting</option>
        <option value="maintenance">Maintenance</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label" for="pl-title">Nama tagihan</label>
      <input id="pl-title" v-model.trim="form.title" type="text" required class="form-input" aria-describedby="pl-title-hint" />
      <p id="pl-title-hint" class="field-hint">{{ form.kind === 'server' ? 'Contoh: VPS produksi aplikasi kasir' : 'Contoh: Pemeliharaan aplikasi & monitoring IoT' }}. Muncul di invoice.</p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="pl-fee">Biaya per bulan (Rp)</label>
        <MoneyInput id="pl-fee" v-model="form.monthlyFee" required :min="1" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label" for="pl-day">Tanggal tagih tiap bulan</label>
        <input id="pl-day" v-model.number="form.billingDayOfMonth" type="number" required min="1" max="28" step="1" class="form-input" />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="pl-sla">Keterangan (boleh kosong)</label>
      <textarea id="pl-sla" v-model.trim="form.slaDetails" rows="3" class="form-textarea" aria-describedby="pl-sla-hint"></textarea>
      <p id="pl-sla-hint" class="field-hint">{{ form.kind === 'server' ? 'Contoh: 4 vCPU / 8 GB RAM, backup harian, domain termasuk' : 'Contoh: perbaikan bug prioritas, monitoring uptime' }}</p>
    </div>
  </FormDialog>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { MaintenancePlanModel } from '../../models/MaintenancePlanModel';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true },
  open: { type: Boolean, default: false },
  contractId: { type: String, default: '' },
  plan: { type: Object, default: null }
});

const emit = defineEmits(['update:open']);

const form = reactive({});

watch(() => props.open, (open) => {
  if (!open) return;
  Object.assign(form, props.plan
    ? props.plan.toJson()
    : { ...new MaintenancePlanModel({ contractId: props.contractId, kind: 'server' }).toJson(), id: '', title: '', monthlyFee: null, slaDetails: '' });
}, { immediate: true });

const save = () => {
  props.store.saveRecord('maintenancePlans', { ...form });
  emit('update:open', false);
};

// Invoice maintenance yang sudah terbit tetap tersimpan; hanya paketnya yang dihapus.
const remove = async () => {
  if (await askConfirm({
    title: 'Hapus tagihan rutin?',
    message: `"${form.title}" berhenti ditagih setiap bulan.`,
    note: 'Invoice yang sudah terbit tetap tersimpan.',
    confirmLabel: 'Hapus tagihan',
    tone: 'danger'
  }) && props.store.deleteRecord('maintenancePlans', form.id)) {
    emit('update:open', false);
  }
};
</script>
