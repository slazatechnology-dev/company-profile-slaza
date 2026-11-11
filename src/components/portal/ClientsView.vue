<template>
  <section class="panel" aria-labelledby="clients-title">
    <div class="panel-head">
      <div>
        <h2 id="clients-title" class="panel-title">Klien</h2>
        <p class="panel-desc">Data klien dipakai di invoice dan BAST. Klien bisa perusahaan atau perorangan. Pastikan nama, alamat, dan NPWP/NIK sesuai dokumen resmi klien.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="openForm(null)">Tambah klien</button>
    </div>

    <div v-if="store.clients.length" class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Nama</th>
            <th scope="col">Kontak</th>
            <th scope="col">NPWP / NIK</th>
            <th scope="col" class="num">Kontrak</th>
            <th scope="col" class="num">Tagihan belum dibayar</th>
            <th scope="col"><span class="visually-hidden">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in store.clients" :key="client.id">
            <td>
              <strong>{{ client.companyName }}</strong>
              <span class="cell-sub">{{ client.type === 'individual' ? 'Perorangan' : `u.p. ${client.picName || '-'}` }}</span>
            </td>
            <td>
              {{ client.email || '-' }}
              <span class="cell-sub">{{ client.phone || '-' }}</span>
            </td>
            <td class="mono">{{ client.npwp || '-' }}</td>
            <td class="num">{{ contractCount(client.id) }}</td>
            <td class="num" :class="{ 'text-wait': unpaidOf(client.id) > 0 }"><strong>{{ formatRupiah(unpaidOf(client.id)) }}</strong></td>
            <td>
              <button type="button" class="btn btn-secondary btn-sm" :aria-label="`Ubah ${client.companyName}`" @click="openForm(client)">
                Ubah
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="empty-state">
      <strong>Belum ada klien.</strong>
      Tambahkan klien dulu, lalu buat kontraknya di menu Proyek & termin.
    </div>

    <FormDialog
      v-model:open="isOpen"
      :title="form.id ? 'Ubah klien' : 'Tambah klien'"
      :deletable="!!form.id"
      delete-label="Hapus klien"
      :delete-blocked-reason="form.id ? store.deleteBlocker('clients', form.id) : ''"
      @submit="save"
      @delete="remove"
    >
      <fieldset class="form-group type-choice">
        <legend class="form-label">Jenis klien</legend>
        <label class="type-option">
          <input v-model="form.type" type="radio" value="company" />
          Perusahaan / instansi
        </label>
        <label class="type-option">
          <input v-model="form.type" type="radio" value="individual" />
          Perorangan
        </label>
      </fieldset>
      <div class="form-group">
        <label class="form-label" for="cl-company">{{ isPerson ? 'Nama lengkap' : 'Nama perusahaan' }}</label>
        <input id="cl-company" v-model.trim="form.companyName" type="text" required autofocus :autocomplete="isPerson ? 'name' : 'organization'" class="form-input" />
      </div>
      <div class="form-row">
        <div v-if="!isPerson" class="form-group">
          <label class="form-label" for="cl-pic">Nama PIC</label>
          <input id="cl-pic" v-model.trim="form.picName" type="text" autocomplete="name" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cl-npwp">{{ isPerson ? 'NIK / NPWP' : 'NPWP' }}</label>
          <input id="cl-npwp" v-model.trim="form.npwp" type="text" inputmode="numeric" class="form-input mono" aria-describedby="cl-npwp-hint" />
          <p v-if="isPerson" id="cl-npwp-hint" class="field-hint">Boleh kosong. NIK berlaku sebagai NPWP orang pribadi.</p>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="cl-email">Email</label>
          <input id="cl-email" v-model.trim="form.email" type="email" autocomplete="email" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cl-phone">Telepon</label>
          <input id="cl-phone" v-model.trim="form.phone" type="tel" autocomplete="tel" class="form-input" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="cl-address">Alamat (untuk invoice)</label>
        <textarea id="cl-address" v-model.trim="form.address" rows="3" autocomplete="street-address" class="form-textarea"></textarea>
      </div>
    </FormDialog>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ClientModel } from '../../models/ClientModel';
import FormDialog from './FormDialog.vue';
import { formatRupiah } from '../../utils/finance';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true }
});

const isOpen = ref(false);
const form = reactive(new ClientModel().toJson());

const isPerson = computed(() => form.type === 'individual');

// Tagihan belum dibayar dari semua kontrak klien ini (invoice belum lunas + sisa kontrak belum ditagih)
const unpaidOf = (clientId) => props.store.contracts
  .filter(c => c.clientId === clientId)
  .reduce((sum, c) => sum + props.store.projectUnpaid(c.id), 0);

const contractCount = (clientId) => props.store.contracts.filter(c => c.clientId === clientId).length;

const openForm = (client) => {
  Object.assign(form, client ? client.toJson() : { ...new ClientModel().toJson(), id: '' });
  isOpen.value = true;
};

const save = () => {
  // Perorangan tidak punya PIC: dokumen memakai namanya sendiri
  props.store.saveRecord('clients', { ...form, picName: isPerson.value ? '' : form.picName });
  isOpen.value = false;
};

const remove = async () => {
  if (await askConfirm({
    title: 'Hapus klien?',
    message: `"${form.companyName}" akan dihapus dari daftar klien.`,
    note: 'Tindakan ini tidak bisa dibatalkan.',
    confirmLabel: 'Hapus klien',
    tone: 'danger'
  }) && props.store.deleteRecord('clients', form.id)) {
    isOpen.value = false;
  }
};
</script>

<style scoped>
.type-choice {
  border: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
}

.type-choice legend {
  width: 100%;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  cursor: pointer;
}

.type-option input {
  width: 20px;
  height: 20px;
  accent-color: var(--accent-primary);
}

.cell-sub {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
