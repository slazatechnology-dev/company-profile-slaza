<template>
  <div class="expense-view">
    <!-- Biaya rutin (server, domain, langganan) yang periode ini belum dicatat -->
    <section v-if="store.recurringDue.length" class="panel" aria-labelledby="due-title">
      <h2 id="due-title" class="panel-title">Biaya rutin belum dicatat</h2>
      <p class="panel-desc">Sudah lewat satu periode sejak catatan terakhir. Jumlahnya bisa diubah sebelum disimpan kalau tagihannya berbeda.</p>
      <ul class="due-list">
        <li v-for="exp in store.recurringDue" :key="exp.id" class="due-item">
          <div class="due-info">
            <p class="due-title">{{ exp.description }}</p>
            <p class="muted small">
              {{ projectName(exp.contractId) }} · {{ REPEAT[exp.repeat] }} · terakhir {{ formatRupiah(exp.amount) }} pada {{ formatDate(exp.date) }}
            </p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" @click="openNext(exp)">
            Catat {{ exp.repeat === 'yearly' ? 'tahun' : 'bulan' }} ini
          </button>
        </li>
      </ul>
    </section>

    <section class="panel" aria-labelledby="expense-title">
      <div class="panel-head">
        <div>
          <h2 id="expense-title" class="panel-title">Pengeluaran</h2>
          <p class="panel-desc">
            Catat biaya per proyek (server, domain, bayaran FE/BE/DevOps per task) atau operasional PT. Selama memakai PPh Final 0,5%, pengeluaran tidak mengurangi pajak, karena pajak dihitung dari omzet bruto.
          </p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" @click="openForm(null)">Catat pengeluaran</button>
      </div>

      <div class="filter">
        <label class="form-label" for="exp-filter">Tampilkan</label>
        <select id="exp-filter" v-model="filter" class="form-select">
          <option value="all">Semua pengeluaran</option>
          <option value="">Operasional PT (tanpa proyek)</option>
          <option v-for="c in store.contracts" :key="c.id" :value="c.id">{{ c.projectTitle }}</option>
        </select>
      </div>

      <dl class="figures">
        <div v-for="cat in categoryTotals" :key="cat.id">
          <dt>{{ cat.label }}</dt>
          <dd>{{ formatRupiah(cat.total) }}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{{ formatRupiah(filteredTotal) }}</dd>
        </div>
      </dl>
    </section>

    <section class="panel" aria-labelledby="expense-list-title">
      <h2 id="expense-list-title" class="panel-title">Daftar pengeluaran</h2>
      <div v-if="filtered.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Tanggal</th>
              <th scope="col">Deskripsi</th>
              <th scope="col">Proyek</th>
              <th scope="col">Dibayar ke</th>
              <th scope="col" class="num">Jumlah</th>
              <th scope="col"><span class="visually-hidden">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exp in filtered" :key="exp.id">
              <td class="nowrap">{{ formatDate(exp.date) }}</td>
              <td>
                {{ exp.description }}
                <span class="cell-sub">
                  {{ CATEGORIES[exp.category] || 'Operasional lainnya' }}<template v-if="exp.repeat"> · {{ REPEAT[exp.repeat] }}</template>
                </span>
              </td>
              <td>{{ projectName(exp.contractId) }}</td>
              <td>{{ exp.vendor || '-' }}</td>
              <td class="num"><strong>{{ formatRupiah(exp.amount) }}</strong></td>
              <td>
                <button type="button" class="btn-text" :aria-label="`Ubah ${exp.description}`" @click="openForm(exp)">Ubah</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <strong>Belum ada pengeluaran{{ filter === 'all' ? '' : ' di pilihan ini' }}.</strong>
        Catat langganan server, domain, atau bayaran tim per task dengan tombol Catat pengeluaran.
      </div>
    </section>

    <FormDialog
      v-model:open="isOpen"
      :title="form.id ? 'Ubah pengeluaran' : 'Catat pengeluaran'"
      submit-label="Simpan pengeluaran"
      :deletable="!!form.id"
      delete-label="Hapus pengeluaran"
      @submit="save"
      @delete="remove"
    >
      <div class="form-group">
        <label class="form-label" for="exp-project">Untuk proyek</label>
        <select id="exp-project" v-model="form.contractId" autofocus class="form-select">
          <option value="">Operasional PT (tanpa proyek)</option>
          <option v-for="c in store.contracts" :key="c.id" :value="c.id">{{ c.projectTitle }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="exp-category">Kategori</label>
        <select id="exp-category" v-model="form.category" class="form-select">
          <option v-for="(label, id) in CATEGORIES" :key="id" :value="id">{{ label }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="exp-description">{{ form.category === 'teamAndFreelancer' ? 'Task yang dikerjakan' : 'Deskripsi' }}</label>
        <input id="exp-description" v-model.trim="form.description" type="text" required class="form-input" aria-describedby="exp-description-hint" />
        <p id="exp-description-hint" class="field-hint">{{ HINTS[form.category] || HINTS.otherOperational }}</p>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="exp-amount">Jumlah (Rp)</label>
          <MoneyInput id="exp-amount" v-model="form.amount" required :min="1" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" for="exp-date">Tanggal bayar</label>
          <input id="exp-date" v-model="form.date" type="date" required :max="today" class="form-input" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="exp-vendor">Dibayar ke (boleh kosong)</label>
          <input id="exp-vendor" v-model.trim="form.vendor" type="text" class="form-input" />
          <p class="field-hint">Nama vendor atau orang, misalnya Niagahoster atau Budi (BE).</p>
        </div>
        <div class="form-group">
          <label class="form-label" for="exp-repeat">Berulang?</label>
          <select id="exp-repeat" v-model="form.repeat" class="form-select" aria-describedby="exp-repeat-hint">
            <option value="">Sekali bayar</option>
            <option value="monthly">Tiap bulan</option>
            <option value="yearly">Tiap tahun</option>
          </select>
          <p id="exp-repeat-hint" class="field-hint">Biaya rutin muncul lagi di atas daftar saat periode berikutnya tiba. Pilih Sekali bayar untuk berhenti.</p>
        </div>
      </div>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { dateJkt, formatDate } from '../../utils/finance';
import FormDialog from './FormDialog.vue';
import MoneyInput from './MoneyInput.vue';
import { askConfirm } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true }
});

const CATEGORIES = {
  teamAndFreelancer: 'Tim & freelancer (FE, BE, DevOps)',
  cloudAndInfrastructure: 'Server, hosting & domain',
  iotHardwareAndPrototyping: 'Hardware IoT & prototipe',
  officeAndTools: 'Alat kerja & lisensi software',
  otherOperational: 'Operasional lainnya'
};

const HINTS = {
  teamAndFreelancer: 'Contoh: FE halaman login, BE API pembayaran, DevOps setup CI/CD',
  cloudAndInfrastructure: 'Contoh: VPS 4GB produksi, domain klien.co.id',
  iotHardwareAndPrototyping: 'Contoh: 5 modul ESP32 dan sensor suhu',
  officeAndTools: 'Contoh: lisensi Figma, GitHub Team',
  otherOperational: 'Contoh: biaya transfer bank, meterai'
};

const REPEAT = { monthly: 'rutin bulanan', yearly: 'rutin tahunan' };

const projectName = (contractId) => contractId
  ? props.store.contracts.find(c => c.id === contractId)?.projectTitle || 'Proyek terhapus'
  : 'Operasional PT';

// 'all' = semua, '' = operasional PT, selain itu id kontrak
const filter = ref('all');
const filtered = computed(() => props.store.expenses
  .filter(e => filter.value === 'all' || e.contractId === filter.value)
  .sort((a, b) => b.date.localeCompare(a.date)));

const filteredTotal = computed(() => filtered.value.reduce((sum, e) => sum + e.amount, 0));

const categoryTotals = computed(() => Object.entries(CATEGORIES)
  .map(([id, label]) => ({ id, label, total: filtered.value.filter(e => e.category === id).reduce((sum, e) => sum + e.amount, 0) }))
  .filter(cat => cat.total > 0));

const today = dateJkt();
const isOpen = ref(false);
const emptyForm = () => ({
  id: '',
  category: 'teamAndFreelancer',
  contractId: filter.value === 'all' ? '' : filter.value,
  description: '',
  amount: null,
  vendor: '',
  date: dateJkt(),
  receiptNote: '',
  repeat: '',
  seriesId: ''
});
const form = reactive(emptyForm());

const openForm = (expense) => {
  Object.assign(form, expense ? expense.toJson() : emptyForm());
  isOpen.value = true;
};

// Periode berikutnya dari biaya rutin: salin entri terakhir, tanggal hari ini, tetap satu seri
const openNext = (expense) => {
  Object.assign(form, { ...expense.toJson(), id: '', date: dateJkt(), seriesId: expense.seriesId || expense.id });
  isOpen.value = true;
};

// Isian wajib dan angka minimum sudah diperiksa browser sebelum submit.
const save = () => {
  props.store.saveRecord('expenses', { ...form });
  isOpen.value = false;
};

const remove = async () => {
  if (await askConfirm({
    title: 'Hapus pengeluaran?',
    facts: [['Deskripsi', form.description], ['Jumlah', formatRupiah(form.amount)]],
    note: 'Tindakan ini tidak bisa dibatalkan.',
    confirmLabel: 'Hapus pengeluaran',
    tone: 'danger'
  }) && props.store.deleteRecord('expenses', form.id)) {
    isOpen.value = false;
  }
};
</script>

<style scoped>
.expense-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.small {
  font-size: 0.85rem;
}

.nowrap {
  white-space: nowrap;
}

.cell-sub {
  display: block;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.filter {
  max-width: 360px;
  margin-bottom: 20px;
}

.due-list {
  list-style: none;
  margin-top: 12px;
}

.due-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 12px 0;
  border-top: 1px solid var(--card-border);
}

.due-info {
  flex: 1;
  min-width: 220px;
}

.due-title {
  font-weight: 700;
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0 16px;
}
</style>
