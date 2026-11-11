<template>
  <FormDialog
    :open="open"
:title="form.id ? 'Ubah termin' : issueNow ? 'Buat invoice' : 'Tambah termin'"
    :submit-label="issueNow ? 'Terbitkan invoice' : 'Simpan'"
    :deletable="!!form.id"
    delete-label="Hapus termin"
    :delete-blocked-reason="form.id ? store.deleteBlocker('milestones', form.id) : ''"
    @update:open="$emit('update:open', $event)"
    @submit="save"
    @delete="remove"
  >
    <!-- Nilai, yang sudah diinvoice, dan sisanya: dasar untuk menentukan jumlah invoice/termin -->
    <div v-if="!locked" class="remaining">
      <p>
        {{ addendum ? `Tambahan "${addendum.title}"` : 'Nilai kontrak awal' }}: <strong>{{ formatRupiah(contractValue) }}</strong>
        · Sudah diinvoice: <strong>{{ formatRupiah(contractValue - remaining) }}</strong>
        · Sisa: <strong>{{ formatRupiah(remaining) }}</strong>
      </p>
      <button v-if="remaining > 0" type="button" class="btn-text" @click="fillRemaining">Isi sisa {{ formatRupiah(remaining) }}</button>
    </div>

    <div class="form-group">
      <label class="form-label" for="ms-title">{{ issueNow ? 'Deskripsi invoice' : 'Nama termin' }}</label>
      <input id="ms-title" v-model.trim="form.title" type="text" required autofocus class="form-input" aria-describedby="ms-title-hint" />
      <p id="ms-title-hint" class="field-hint">Muncul sebagai deskripsi di invoice.</p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="ms-type">Jenis</label>
        <select id="ms-type" v-model="form.type" class="form-select">
          <option value="downPayment">Uang muka (DP)</option>
          <option value="intermediateTermin">Termin</option>
          <option value="finalSettlement">Pelunasan</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="ms-due">Target tanggal bayar</label>
        <input id="ms-due" v-model="form.dueDate" type="date" class="form-input" />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="ms-amount">Jumlah (Rp)</label>
      <MoneyInput
        id="ms-amount"
        v-model="form.amount"
        required
        :min="1"
        :max="issueNow ? remaining : null"
        :disabled="locked"
        class="form-input"
        aria-describedby="ms-amount-hint"
      />
      <p id="ms-amount-hint" class="field-hint">
        <template v-if="locked">Jumlah terkunci karena invoice termin ini sudah terbit.</template>
        <template v-else-if="contractValue">
          {{ percentage }}% dari {{ addendum ? `tambahan "${addendum.title}"` : 'nilai kontrak awal' }} {{ formatRupiah(contractValue) }}. Total termin lain: {{ formatRupiah(otherTotal) }}.
        </template>
      </p>
    </div>

    <label v-if="!issueNow" class="check">
      <input v-model="form.isBastRequired" type="checkbox" :aria-describedby="form.bastNumber ? 'ms-bast-hint' : undefined" />
      <span>Wajib BAST sebelum pembayaran termin ini dicatat</span>
    </label>
    <!-- Nomor BAST tetap disimpan agar tidak terpakai ulang; centang lagi untuk memakainya kembali -->
    <p v-if="form.bastNumber" id="ms-bast-hint" class="field-hint">
      {{ form.isBastRequired
        ? `BAST ${form.bastNumber} sudah terbit. Hapus centang jika termin ini tidak jadi memakai BAST.`
        : `BAST ${form.bastNumber} tidak dipakai lagi. Centang lagi untuk memakainya kembali.` }}
    </p>
  </FormDialog>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { MilestoneModel } from '../../models/MilestoneModel';
import { formatRupiah } from '../../utils/finance';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true },
  open: { type: Boolean, default: false },
  contractId: { type: String, default: '' },
  addendumId: { type: String, default: '' }, // termin baru untuk tambahan kontrak ini
  milestone: { type: Object, default: null },
  issueNow: { type: Boolean, default: false } // simpan sebagai termin lalu langsung terbitkan invoice-nya
});

const emit = defineEmits(['update:open', 'issued']);

const form = reactive({});

watch(() => props.open, (open) => {
  if (!open) return;
  Object.assign(form, props.milestone
    ? props.milestone.toJson()
    : { ...new MilestoneModel({ contractId: props.contractId, addendumId: props.addendumId, amount: null, type: props.issueNow ? 'intermediateTermin' : 'downPayment' }).toJson(), id: '', amount: null });
}, { immediate: true });

const locked = computed(() => !!form.id && props.store.milestoneHasInvoice(form.id));
// Persentase dihitung dari nilai tambahannya (termin tambahan) atau dari nilai kontrak awal (termin biasa)
const addendum = computed(() => props.store.milestoneAddendum(form));
const contractValue = computed(() => addendum.value?.value
  ?? props.store.contracts.find(c => c.id === form.contractId)?.totalContractValue ?? 0);
const percentage = computed(() => contractValue.value ? Math.round((Number(form.amount) || 0) / contractValue.value * 100) : 0);
const otherTotal = computed(() => props.store.milestones
  .filter(m => m.contractId === form.contractId && m.id !== form.id && props.store.milestoneAddendum(m)?.id === addendum.value?.id)
  .reduce((sum, m) => sum + m.amount, 0));

const remaining = computed(() => props.store.uninvoicedValue(form.contractId, addendum.value?.id || ''));

const fillRemaining = () => {
  form.amount = remaining.value;
  if (props.issueNow) form.type = 'finalSettlement';
};

const save = () => {
  const id = props.store.saveRecord('milestones', { ...form, percentage: percentage.value, isBastRequired: props.issueNow ? false : form.isBastRequired });
  if (props.issueNow) emit('issued', props.store.issueInvoice(id));
  emit('update:open', false);
};

const remove = async () => {
  if (await askConfirm({
    title: 'Hapus termin?',
    message: `"${form.title}" akan dihapus.`,
    note: 'Tindakan ini tidak bisa dibatalkan.',
    confirmLabel: 'Hapus termin',
    tone: 'danger'
  }) && props.store.deleteRecord('milestones', form.id)) {
    emit('update:open', false);
  }
};
</script>

<style scoped>
.remaining {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  color: var(--text-secondary);
}
</style>
