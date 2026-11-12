<template>
  <FormDialog
    :open="open"
    :title="form.id ? 'Ubah tambahan kontrak' : 'Tambah nilai kontrak'"
    wide
    :deletable="!!form.id"
    delete-label="Hapus tambahan"
    :delete-blocked-reason="deleteBlocked"
    @update:open="$emit('update:open', $event)"
    @submit="save"
    @delete="remove"
  >
    <div class="form-group">
      <label class="form-label" for="ad-title">Tambahan untuk</label>
      <input id="ad-title" v-model.trim="form.title" type="text" required autofocus class="form-input" aria-describedby="ad-title-hint" />
      <p id="ad-title-hint" class="field-hint">Contoh: Fitur export laporan PDF</p>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="ad-value">Nilai tambahan (Rp)</label>
        <MoneyInput id="ad-value" v-model="form.value" required :min="1" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label" for="ad-date">Tanggal disepakati</label>
        <input id="ad-date" v-model="form.date" type="date" required class="form-input" />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="ad-desc">Deskripsi (boleh kosong)</label>
      <textarea id="ad-desc" v-model.trim="form.description" rows="6" class="form-textarea" aria-describedby="ad-desc-hint"></textarea>
      <p id="ad-desc-hint" class="field-hint">Rincian fitur, alasan perubahan, atau kesepakatan dengan klien. Boleh beberapa baris.</p>
    </div>

    <label class="check">
      <input v-model="form.isReimbursement" type="checkbox" aria-describedby="ad-reimb-hint" />
      <span>Penggantian biaya (talangan), tidak kena PPh 0,5%</span>
    </label>
    <p id="ad-reimb-hint" class="field-hint">Untuk biaya pihak ketiga yang kamu bayarkan dulu lalu diganti klien sebesar harga beli, misalnya domain, server, atau lisensi atas nama klien. Pajaknya sudah dibayar ke penjual, jadi tidak dihitung sebagai omzet dan tidak kena PPh 0,5%.</p>

    <!-- Tambahan baru biasanya ditagih tersendiri: langsung buatkan termin-nya supaya tidak perlu langkah terpisah -->
    <template v-if="!form.id">
      <label class="check">
        <input v-model="withMilestone" type="checkbox" />
        <span>Buat termin pembayaran untuk tambahan ini</span>
      </label>
      <label v-if="withMilestone" class="check">
        <input v-model="withBast" type="checkbox" />
        <span>Wajib BAST sebelum pembayarannya dicatat</span>
      </label>
    </template>
  </FormDialog>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { dateJkt, formatRupiah } from '../../utils/finance';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true },
  open: { type: Boolean, default: false },
  contract: { type: Object, default: null },
  addendum: { type: Object, default: null }
});

const emit = defineEmits(['update:open']);

const form = reactive({ id: '', title: '', value: null, date: '', description: '', isReimbursement: false });
const withMilestone = ref(true);
const withBast = ref(true);

watch(() => props.open, (open) => {
  if (!open) return;
  Object.assign(form, props.addendum ? { ...props.addendum } : { id: '', title: '', value: null, date: dateJkt(), description: '', isReimbursement: false });
  withMilestone.value = true;
  withBast.value = true;
}, { immediate: true });

const saveAddenda = (addenda) => props.store.saveRecord('contracts', { ...props.contract.toJson(), addenda });

const save = () => {
  // Termin lama dikenali dari judulnya; tautkan dulu lewat addendumId supaya tidak lepas saat judul tambahan diubah
  ownMilestones.value.filter(m => !m.addendumId).forEach(m => props.store.saveRecord('milestones', { ...m.toJson(), addendumId: form.id }));
  const others = props.contract.addenda.filter(a => a.id !== form.id);
  const item = { ...form, id: form.id || `add_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` };
  saveAddenda([...others, item].sort((a, b) => a.date.localeCompare(b.date)));

  if (withMilestone.value && !form.id) {
    props.store.saveRecord('milestones', {
      contractId: props.contract.id,
      addendumId: item.id,
      title: `Tambahan: ${item.title}`,
      type: 'finalSettlement',
      amount: item.value,
      percentage: 100,
      isBastRequired: withBast.value,
      isReimbursement: item.isReimbursement
    });
  }
  emit('update:open', false);
};

const ownMilestones = computed(() => props.store.milestones.filter(m => props.store.milestoneAddendum(m)?.id === form.id));

// Termin tambahan ikut terhapus; ditolak jika salah satunya sudah ditagih atau ber-BAST
const deleteBlocked = computed(() => form.id && ownMilestones.value.some(m => props.store.deleteBlocker('milestones', m.id))
  ? 'Tambahan ini punya termin yang sudah ditagih atau punya BAST, jadi tidak bisa dihapus.'
  : '');

const remove = async () => {
  const count = ownMilestones.value.length;
  if (await askConfirm({
    title: `Hapus tambahan "${form.title}"?`,
    message: count ? `Tambahan ini beserta ${count} termin-nya akan dihapus.` : 'Tambahan ini akan dihapus dari kontrak.',
    facts: [['Nilai kontrak berkurang', formatRupiah(form.value)]],
    confirmLabel: 'Hapus tambahan',
    tone: 'danger'
  })) {
    ownMilestones.value.forEach(m => props.store.deleteRecord('milestones', m.id));
    saveAddenda(props.contract.addenda.filter(a => a.id !== form.id));
    emit('update:open', false);
  }
};
</script>
