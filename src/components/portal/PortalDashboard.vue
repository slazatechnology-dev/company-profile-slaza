<template>
  <div class="dashboard">
    <!-- Panduan awal: hilang sendiri setelah semua langkah selesai -->
    <section v-if="setupSteps.some(s => !s.done)" class="panel setup" aria-labelledby="setup-title">
      <h2 id="setup-title" class="panel-title">Mulai di sini</h2>
      <p class="panel-desc">Kerjakan berurutan. Setelah ini, tiap termin di menu Proyek menunjukkan satu tombol untuk langkah berikutnya.</p>
      <ol class="setup-list">
        <li v-for="(step, i) in setupSteps" :key="step.tab + i" class="setup-item" :class="{ done: step.done }">
          <span class="setup-num" aria-hidden="true">{{ step.done ? '✓' : i + 1 }}</span>
          <div class="setup-info">
            <p class="todo-title">{{ step.title }}<span v-if="step.done" class="visually-hidden"> (selesai)</span></p>
            <p v-if="!step.done" class="todo-detail">{{ step.detail }}</p>
          </div>
          <button v-if="!step.done" type="button" class="btn btn-sm" :class="step === nextSetup ? 'btn-primary' : 'btn-secondary'" @click="$emit('navigate', step.tab)">
            {{ step.cta }}
          </button>
        </li>
      </ol>
    </section>

    <!-- Fokus layar: pekerjaan nyata yang menunggu, diurutkan dari tenggat terdekat -->
    <section class="panel" aria-labelledby="todo-title">
      <h2 id="todo-title" class="panel-title">Perlu dikerjakan</h2>
      <p class="panel-desc">Diurutkan dari tenggat terdekat. Daftar ini dihitung dari invoice, BAST, dan catatan pajak di portal.</p>

      <ol v-if="todoItems.length" class="todo-list">
        <li v-for="item in todoItems" :key="item.id" class="todo-item">
          <div class="todo-info">
            <p class="todo-kind muted">{{ item.kind }}</p>
            <p class="todo-title">{{ item.title }}</p>
            <p class="todo-detail">
              <span v-if="item.late" class="text-block"><strong>Lewat tenggat.</strong></span>
              {{ item.detail }}
            </p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="$emit('navigate', item.tab)">
            {{ item.cta }}
          </button>
        </li>
      </ol>
      <div v-else class="empty-state">
        <strong>Tidak ada yang menunggu.</strong>
        Semua pajak sudah disetor, tidak ada BAST yang tertunda, dan tidak ada invoice yang belum dibayar.
      </div>
    </section>

    <!-- Piutang: invoice yang sudah terbit tapi belum dibayar klien -->
    <section class="panel" aria-labelledby="unpaid-title">
      <h2 id="unpaid-title" class="panel-title">Tagihan belum dibayar</h2>
      <p class="unpaid-total" :class="{ 'text-wait': store.totalUnpaid > 0 }">{{ formatRupiah(store.totalUnpaid) }}</p>
      <p class="panel-desc">Semua yang belum dibayar klien, termasuk sisa kontrak yang belum diterbitkan invoice. Daftar di bawah berisi invoice yang sudah terbit.</p>
      <div v-if="store.unpaidInvoices.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Klien</th>
              <th scope="col">Invoice</th>
              <th scope="col" class="num">Jumlah</th>
              <th scope="col">Jatuh tempo</th>
              <th scope="col"><span class="visually-hidden">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="{ invoice, dueDate } in store.unpaidInvoices" :key="invoice.id">
              <td>
                <strong>{{ clientOf(invoice).companyName || '-' }}</strong>
                <span class="cell-sub">{{ contractOf(invoice).projectTitle || '-' }}</span>
              </td>
              <td>
                <span class="mono">{{ invoice.invoiceNumber }}</span>
                <span class="cell-sub">{{ invoice.description }}</span>
              </td>
              <td class="num"><strong>{{ formatRupiah(invoice.grossAmount) }}</strong></td>
              <td class="nowrap">
                {{ formatDate(dueDate) }}
                <span v-if="dueDate < today" class="cell-sub text-block"><strong>Lewat {{ daysSince(dueDate) }} hari</strong></span>
              </td>
              <td>
                <button type="button" class="btn btn-secondary btn-sm" @click="recordPaid(invoice)">Catat lunas</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <strong>Semua invoice sudah dibayar.</strong>
        Invoice baru muncul di sini sampai kamu mencatatnya lunas.
      </div>
    </section>

    <section class="panel" aria-labelledby="figures-title">
      <h2 id="figures-title" class="panel-title">Angka sejauh ini</h2>
      <dl class="figures">
        <div>
          <dt>Omzet lunas</dt>
          <dd>{{ formatRupiah(store.totalOmzetLunas) }}</dd>
        </div>
        <div>
          <dt>PPh Final belum disetor</dt>
          <dd :class="{ 'text-wait': store.totalPajakTersisa > 0 }">{{ formatRupiah(store.totalPajakTersisa) }}</dd>
        </div>
        <div>
          <dt>Pengeluaran tercatat</dt>
          <dd>{{ formatRupiah(store.totalPengeluaran) }}</dd>
        </div>
        <div>
          <dt>Laba bersih PT</dt>
          <dd :class="{ 'text-block': store.totalLabaBersih < 0 }">{{ formatRupiah(store.totalLabaBersih) }}</dd>
        </div>
      </dl>
      <p class="figures-note muted">Laba bersih = omzet lunas dikurangi PPh Final 0,5% dan semua pengeluaran, termasuk operasional PT tanpa proyek.</p>
    </section>

    <section v-if="store.contracts.length" class="panel" aria-labelledby="profit-title">
      <h2 id="profit-title" class="panel-title">Laba per proyek</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Proyek</th>
              <th scope="col" class="num">Nilai kontrak</th>
              <th scope="col" class="num">Diterima</th>
              <th scope="col" class="num">Tagihan belum dibayar</th>
              <th scope="col" class="num">Biaya</th>
              <th scope="col" class="num">Laba sejauh ini</th>
              <th scope="col" class="num">Perkiraan bila lunas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in profitRows" :key="row.id">
              <td><strong>{{ row.title }}</strong></td>
              <td class="num">{{ formatRupiah(row.value) }}</td>
              <td class="num">{{ formatRupiah(row.received) }}</td>
              <td class="num" :class="{ 'text-wait': row.unpaid > 0 }">{{ formatRupiah(row.unpaid) }}</td>
              <td class="num">{{ formatRupiah(row.cost) }}</td>
              <td class="num" :class="{ 'text-block': row.profit < 0 }"><strong>{{ formatRupiah(row.profit) }}</strong></td>
              <td class="num" :class="{ 'text-block': row.projected < 0 }">{{ formatRupiah(row.projected) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel" aria-labelledby="backup-title">
      <h2 id="backup-title" class="panel-title">Backup data portal</h2>
      <p class="panel-desc">
        Data portal tersimpan di Firestore. Unduh backup secara berkala sebagai cadangan di luar Firebase, misalnya sebelum lapor pajak tahunan. Memulihkan backup menimpa data yang ada di Firestore.
      </p>
      <div class="backup-actions">
        <button type="button" class="btn btn-primary btn-sm" @click="downloadBackup">Unduh backup (JSON)</button>
        <label class="btn btn-secondary btn-sm">
          Pulihkan dari backup
          <input type="file" accept="application/json,.json" class="visually-hidden" @change="restoreBackup" />
        </label>
      </div>
      <p v-if="backupStatus.text" class="backup-status" :class="{ 'text-block': backupStatus.error }" role="status">
        {{ backupStatus.text }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { dateJkt, formatDate } from '../../utils/finance';
import { askConfirm, showNotice } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true }
});

defineEmits(['navigate']);

const setupSteps = computed(() => {
  const s = props.store;
  const missing = [
    !s.company.bankName || !s.company.bankAccount ? 'rekening bank' : '',
    !s.company.nib ? 'NIB' : '',
    !s.company.npwp ? 'NPWP' : '',
    !s.company.registeredYear ? 'tahun terdaftar' : ''
  ].filter(Boolean);
  return [
    { title: 'Isi data PT', detail: `Belum diisi: ${missing.join(', ')}. Invoice tidak bisa dicetak tanpa rekening bank.`, cta: 'Isi data PT', tab: 'company', done: !missing.length },
    { title: 'Tambah klien', detail: 'Nama perusahaan, alamat, dan NPWP klien untuk invoice dan BAST.', cta: 'Buka Klien', tab: 'clients', done: s.clients.length > 0 },
    { title: 'Tambah kontrak', detail: 'Judul proyek, nilai kontrak, dan klien pemesannya.', cta: 'Buka Proyek', tab: 'projects', done: s.contracts.length > 0 },
    { title: 'Tambah termin pembayaran', detail: 'Misalnya DP 30%, termin 40%, pelunasan 30%, di dalam kontrak tadi.', cta: 'Buka Proyek', tab: 'projects', done: s.milestones.length > 0 }
  ];
});

const profitRows = computed(() => props.store.contracts.map(c => ({
  id: c.id,
  title: c.projectTitle,
  value: c.totalValue,
  ...props.store.projectProfit(c.id),
  unpaid: props.store.projectUnpaid(c.id)
})));

const today = dateJkt();
const daysSince = (iso) => Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${iso}T00:00:00Z`)) / 86400000);
const contractOf = (inv) => props.store.contracts.find(c => c.id === inv.contractId) || {};
const clientOf = (inv) => props.store.clients.find(c => c.id === contractOf(inv).clientId) || {};

const recordPaid = async (inv) => {
  // Invoice gabungan bisa memuat termin ber-BAST: lunas baru bisa dicatat setelah semua BAST-nya ditandatangani
  if (props.store.invoiceWaitingBast(inv)) {
    showNotice({
      title: 'Belum bisa dicatat lunas',
      message: `${inv.invoiceNumber} memuat termin yang BAST-nya belum ditandatangani. Catat BAST ditandatangani dulu di tab Tambahan kontrak.`
    });
    return;
  }
  if (await askConfirm({
    title: 'Invoice sudah dibayar?',
    facts: [['Invoice', inv.invoiceNumber], ['Jumlah', formatRupiah(inv.grossAmount)], ['PPh Final 0,5% yang harus disetor', formatRupiah(inv.taxAmount)]],
    note: 'Tidak bisa dibatalkan.',
    confirmLabel: 'Ya, sudah dibayar'
  })) {
    props.store.markInvoiceAsPaid(inv.id);
  }
};

const nextSetup = computed(() => setupSteps.value.find(s => !s.done));

const todoItems = computed(() => {
  const s = props.store;
  const today = dateJkt();
  const items = [];

  // Satu tugas per masa (bulan), bukan per invoice: PPh Final disetor sekali sebulan
  for (const p of s.taxPeriods.filter(p => p.due > 0)) {
    const label = new Date(Date.UTC(p.year, p.month - 1, 1)).toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const running = `${p.year}-${String(p.month).padStart(2, '0')}` === today.slice(0, 7);
    items.push({
      id: `tax-${p.key}`,
      kind: 'Pajak',
      title: `Setor PPh Final ${formatRupiah(p.due)} untuk masa ${label}`,
      detail: running
        ? `Bulan berjalan: angka bisa bertambah sampai akhir bulan. Setor setelah ${label} berakhir, paling lambat ${formatDate(p.deadline)}.`
        : `Dari ${p.records.length} pembayaran. Paling lambat ${formatDate(p.deadline)}. Buat kode billing, bayar, lalu catat NTPN-nya.`,
      cta: 'Buka pajak',
      tab: 'taxes',
      due: p.deadline
    });
  }

  for (const ms of s.milestones.filter(m => s.isBastPending(m))) {
    items.push({
      id: ms.id,
      kind: 'BAST',
      title: `Tanda tangani BAST: ${ms.title}`,
      detail: `Pelunasan baru bisa dicatat setelah BAST ditandatangani klien.${ms.dueDate ? ` Target ${formatDate(ms.dueDate)}.` : ''}`,
      cta: 'Buka proyek',
      tab: 'projects',
      due: ms.dueDate
    });
  }

  // Invoice yang menunggu pembayaran punya panel sendiri ("Belum dibayar klien"), tidak diulang di sini

  for (const exp of s.recurringDue) {
    items.push({
      id: `rec-${exp.id}`,
      kind: 'Biaya rutin',
      title: `Catat ${exp.description}`,
      detail: `Terakhir ${formatRupiah(exp.amount)} pada ${formatDate(exp.date)}.`,
      cta: 'Buka pengeluaran',
      tab: 'expenses',
      due: ''
    });
  }

  items.push({
    id: 'lkpm',
    kind: 'LKPM',
    title: `Laporkan LKPM ${s.lkpmSummary.periodLabel}`,
    detail: `Paling lambat ${formatDate(s.lkpmSummary.deadline)} di oss.go.id.`,
    cta: 'Lihat angka LKPM',
    tab: 'lkpm',
    due: s.lkpmSummary.deadline
  });

  return items
    .map(item => ({ ...item, late: !!item.due && item.due < today }))
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
});

const backupStatus = reactive({ text: '', error: false });

const downloadBackup = () => {
  const url = URL.createObjectURL(new Blob([props.store.exportData()], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `slaza-portal-backup-${dateJkt()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  backupStatus.text = `Backup diunduh: ${a.download}`;
  backupStatus.error = false;
};

const restoreBackup = async (event) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file || !(await askConfirm({
    title: 'Pulihkan dari backup?',
    message: `Semua data portal diganti dengan isi "${file.name}".`,
    note: 'Data yang ada sekarang di Firestore akan tertimpa.',
    confirmLabel: 'Pulihkan data',
    tone: 'danger'
  }))) return;
  try {
    props.store.importData(await file.text());
    backupStatus.text = `Data dipulihkan dari ${file.name}.`;
    backupStatus.error = false;
  } catch (err) {
    backupStatus.text = `File backup tidak valid, data tidak diubah (${err.message}).`;
    backupStatus.error = true;
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.todo-list {
  list-style: none;
  margin-top: 16px;
  border-top: 1px solid var(--card-border);
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 16px 0;
  border-bottom: 1px solid var(--card-border);
}

.todo-info {
  flex: 1;
  min-width: 240px;
}

.todo-kind {
  font-size: 0.82rem;
  font-weight: 600;
}

.todo-title {
  font-weight: 700;
  color: var(--text-primary);
  margin: 2px 0;
}

.todo-detail {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.setup-list {
  list-style: none;
  margin-top: 16px;
}

.setup-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  padding: 12px 0;
  border-top: 1px solid var(--card-border);
}

.setup-info {
  flex: 1;
  min-width: 200px;
}

.setup-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--card-border-hover);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.setup-item.done .setup-num {
  background: #dcfce7;
  border-color: #dcfce7;
  color: #166534;
}

.setup-item.done .todo-title {
  color: var(--text-muted);
  font-weight: 600;
}

.unpaid-total {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 4px 0;
}

.unpaid-total.text-wait {
  color: #92400e;
}

.cell-sub {
  display: block;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.cell-sub.text-block {
  color: #b91c1c;
}

.nowrap {
  white-space: nowrap;
}

.figures-note {
  margin-top: 12px;
  font-size: 0.85rem;
}

.dashboard .figures {
  margin-top: 12px;
}

.backup-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.backup-actions label:focus-within {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.backup-status {
  margin-top: 12px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}
</style>
