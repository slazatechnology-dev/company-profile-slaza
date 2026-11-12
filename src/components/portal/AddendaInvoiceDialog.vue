<template>
  <FormDialog
    :open="open"
    wide
    title="Buat invoice tambahan kontrak"
    submit-label="Terbitkan invoice"
    :submit-disabled="!total"
    @update:open="$emit('update:open', $event)"
    @submit="issue"
  >
    <div class="form-group">
      <label class="form-label" for="aip-contract">Kontrak yang ditagih</label>
      <select id="aip-contract" v-model="contractId" required class="form-select">
        <option v-for="c in billable" :key="c.id" :value="c.id">
          {{ c.projectTitle }} · {{ clientName(c) }}
        </option>
      </select>
    </div>

    <p class="dialog-hint">Pilih tambahan yang dilampirkan di invoice ini. Setiap tambahan jadi satu baris di invoice. Jumlahnya bisa diubah, misalnya untuk DP 50%.</p>

    <ul class="pick-list">
      <li v-for="row in rows" :key="row.key" class="pick-row">
        <label class="check">
          <input v-model="row.checked" type="checkbox" :disabled="!!row.note" />
          <span>
            <strong>{{ row.addendumTitle }}</strong> · {{ row.label }}
            <span v-if="row.reimbursement" class="tag">Talangan, tanpa PPh</span>
            <span class="field-hint">{{ row.note || row.hint }}</span>
          </span>
        </label>
        <div v-if="row.checked && row.editable" class="amount">
          <label class="visually-hidden" :for="`aip-${row.key}`">Jumlah untuk {{ row.addendumTitle }} (Rp)</label>
          <MoneyInput
            :id="`aip-${row.key}`"
            v-model="row.amount"
            required
            :min="1"
            :max="row.max"
            class="form-input"
          />
        </div>
        <strong v-else-if="row.checked" class="fixed-amount">{{ formatRupiah(row.amount) }}</strong>
      </li>
    </ul>

    <p v-if="rows.length && rows.every(r => r.note)" class="dialog-hint">
      Semua tambahan di kontrak ini sudah lunas. Tambahkan nilai kontrak baru dulu, atau pilih kontrak lain.
    </p>

    <p class="total">Total invoice: <strong>{{ formatRupiah(total) }}</strong></p>
  </FormDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { formatRupiah } from '../../utils/finance';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';

const props = defineProps({
  store: { type: Object, required: true },
  open: { type: Boolean, default: false },
  contract: { type: Object, default: null }
});

const emit = defineEmits(['update:open', 'issued']);

// Semua kontrak yang punya tambahan; yang masih ada sisa belum diinvoice didahulukan
const hasRemaining = (c) => c.addenda.some(a => props.store.uninvoicedValue(c.id, a.id) > 0);
const billable = computed(() => props.store.contracts
  .filter(c => c.addenda.length)
  .sort((a, b) => hasRemaining(b) - hasRemaining(a)));
const clientName = (c) => props.store.clients.find(cl => cl.id === c.clientId)?.companyName || '-';

const contractId = ref('');
const selected = computed(() => props.store.contracts.find(c => c.id === contractId.value));

// Satu baris per hal yang bisa ditagih dari tambahan kontrak:
// - termin tambahan yang belum diinvoice (jumlah tetap, sesuai termin)
// - sisa nilai tambahan yang belum dijadwalkan jadi termin (jumlah bisa diubah, misalnya DP 50%)
// - invoice tambahan yang sudah terbit tapi belum dibayar: ikut digabung, invoice lamanya dibatalkan
// Invoice yang sudah lunas tetap tampil sebagai keterangan, tapi tidak bisa dipilih.
const rows = ref([]);
const buildRows = () => {
  const c = selected.value;
  const s = props.store;
  if (!c) return (rows.value = []);
  const seenInvoices = new Set();
  rows.value = c.addenda.flatMap(a => {
    const out = [];
    const reimbursement = a.isReimbursement;
    const termins = s.addendumMilestones(c.id, a.id);
    for (const m of termins.filter(m => !s.milestoneHasInvoice(m.id) && m.status !== 'paid')) {
      out.push({
        key: m.id, addendumTitle: a.title, label: m.title, milestoneId: m.id, amount: m.amount, checked: true, reimbursement: reimbursement || m.isReimbursement,
        hint: m.isBastRequired && !m.isBastSigned ? 'Termin ber-BAST: pembayaran baru bisa dicatat setelah BAST ditandatangani.' : 'Termin yang sudah dijadwalkan, belum diinvoice.'
      });
    }
    const rest = s.unscheduledValue(c.id, a.id);
    if (rest > 0) {
      out.push({ key: `${a.id}-rest`, addendumTitle: a.title, label: 'Sisa belum dijadwalkan', addendumId: a.id, reimbursement, amount: rest, max: rest, editable: true, checked: true, hint: `Maksimal ${formatRupiah(rest)}` });
    }
    for (const inv of termins.map(m => s.invoiceOfMilestone(m.id)).filter(Boolean)) {
      if (seenInvoices.has(inv.id)) continue;
      seenInvoices.add(inv.id);
      const mergeable = s.mergeableInvoice(c.id, inv);
      out.push({
        key: inv.id, addendumTitle: a.title, label: `Invoice ${inv.invoiceNumber}`, invoiceId: inv.id, amount: inv.grossAmount,
        checked: false,
        hint: 'Sudah terbit, belum dibayar. Jika dipilih, invoice ini dibatalkan dan isinya pindah ke invoice gabungan.',
        note: mergeable ? '' : inv.status === 'paid' ? 'Sudah lunas, tidak bisa digabung.' : 'Berisi termin kontrak awal, tidak bisa digabung di sini.'
      });
    }
    return out;
  });
};
watch(contractId, buildRows);

// Dibuka dari kartu kontrak: kontrak itu terpilih; dari atas halaman: kontrak pertama yang bisa ditagih.
// Baris selalu dihitung ulang saat dibuka, karena sisa bisa berubah setelah invoice sebelumnya.
watch(() => props.open, (open) => {
  if (!open) return;
  contractId.value = props.contract?.id || billable.value[0]?.id || '';
  buildRows();
}, { immediate: true });

const picked = computed(() => rows.value.filter(r => r.checked));
const total = computed(() => picked.value.reduce((sum, r) => sum + (Number(r.amount) || 0), 0));

// Batas jumlah (min/max) sudah diperiksa browser sebelum submit
const issue = () => {
  const invoice = props.store.issueAddendaInvoice(contractId.value, picked.value
    .map(r => (r.invoiceId ? { invoiceId: r.invoiceId }
      : r.milestoneId ? { milestoneId: r.milestoneId }
        : { addendumId: r.addendumId, amount: Number(r.amount) })));
  if (invoice) emit('issued', invoice);
  emit('update:open', false);
};
</script>

<style scoped>
.pick-list {
  list-style: none;
  border-top: 1px solid var(--card-border);
}

.pick-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
}

.pick-row .field-hint {
  display: block;
  margin-top: 0;
}

.amount {
  width: 180px;
}

.fixed-amount {
  white-space: nowrap;
}

.total {
  margin-top: 16px;
  text-align: right;
  font-size: 1rem;
}
</style>
