<template>
  <!-- Dipindah ke <body> supaya saat cetak seluruh halaman portal bisa disembunyikan (display: none) tanpa ikut menyembunyikan dokumen -->
  <Teleport to="body">
  <dialog
    ref="dialogEl"
    class="doc-dialog"
    aria-labelledby="doc-dialog-title"
    @close="$emit('close')"
    @click="closeOnBackdrop"
  >
    <div class="modal-header no-print">
      <h2 id="doc-dialog-title" class="modal-title">{{ docType === 'invoice' ? 'Pratinjau invoice' : 'Pratinjau BAST' }}</h2>
      <div class="header-actions">
        <button
          type="button"
          class="btn btn-primary btn-sm"
          :disabled="docType === 'invoice' && !bankReady"
          :aria-describedby="docType === 'invoice' && !bankReady ? 'bank-missing' : undefined"
          @click="printDocument"
        >
          Cetak / simpan PDF
        </button>
        <button type="button" class="btn-text" @click="dialogEl.close()">Tutup</button>
      </div>
    </div>

    <p v-if="docType === 'invoice' && !bankReady" id="bank-missing" class="bank-missing no-print">
      Rekening bank PT belum diisi, jadi invoice belum bisa dicetak. Isi dulu di menu Data PT.
    </p>

    <div id="printable-area" class="document-paper">
      <!-- Kop surat -->
      <div class="letterhead">
        <p class="company-title">PT. SLAZA TECHNOLOGY MANDIRI</p>
        <p class="company-meta">Rekayasa Perangkat Lunak & Sistem Internet of Things (IoT)</p>
        <p class="company-line">{{ office.address }}</p>
        <p class="company-line">Email: {{ office.email }} · Telp: {{ office.phone }}</p>
        <p class="company-line">NIB: {{ company.nib || '[NIB belum diisi]' }} · NPWP: {{ company.npwp || '[NPWP belum diisi]' }}</p>
      </div>

      <div class="divider-line"></div>

      <div v-if="docType === 'invoice'" class="doc-body">
        <div class="doc-title-row">
          <!-- Judul dokumen huruf kapital mengikuti kebiasaan dokumen resmi -->
          <p class="doc-type-title">INVOICE</p>
          <div class="doc-ref">
            <p><strong>Nomor:</strong> {{ invoiceData.invoiceNumber }}</p>
            <p><strong>Tanggal:</strong> {{ formatDate(invoiceData.issueDate) }}</p>
            <p><strong>Jatuh tempo:</strong> {{ invoiceData.dueDate ? formatDate(invoiceData.dueDate) : '14 hari kalender' }}</p>
          </div>
        </div>

        <div class="client-box">
          <p class="box-label">Ditujukan kepada</p>
          <p><strong>{{ clientData.companyName || '-' }}</strong></p>
          <p v-if="!isPerson">u.p. {{ clientData.picName || '-' }}</p>
          <p>{{ clientData.address || '-' }}</p>
          <p v-if="!isPerson || clientData.npwp">{{ isPerson ? 'NIK/NPWP' : 'NPWP' }}: {{ clientData.npwp || '-' }}</p>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th scope="col">Deskripsi pekerjaan / layanan</th>
              <th scope="col" class="text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <!-- Invoice gabungan punya beberapa baris; invoice biasa satu baris -->
            <tr v-for="(line, idx) in invoiceLines" :key="idx">
              <td>
                <strong>{{ line.description }}</strong>
                <p class="sub-desc">Proyek: {{ contractData.projectTitle || '-' }}</p>
              </td>
              <td class="text-right"><strong>{{ formatRupiah(line.amount) }}</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="text-right"><strong>Total tagihan</strong></td>
              <td class="text-right total-amount"><strong>{{ formatRupiah(invoiceData.grossAmount) }}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="note-box">
          <p class="note-title">Catatan perpajakan</p>
          <p>
            PT. Slaza Technology Mandiri dikenai PPh Final 0,5% berdasarkan PP No. 55 Tahun 2022.
            <!-- Orang pribadi bukan pemotong PPh 23, jadi kalimat ini hanya untuk klien badan -->
            <template v-if="!isPerson">Atas tagihan ini tidak dilakukan pemotongan PPh Pasal 23, dengan dilampirkannya Surat Keterangan PP 55 dari Direktorat Jenderal Pajak.</template>
          </p>
        </div>

        <div class="payment-info">
          <p><strong>Pembayaran melalui transfer bank</strong></p>
          <p>Bank: <strong>{{ company.bankName || '-' }}</strong></p>
          <p>Nomor rekening: <strong>{{ company.bankAccount || '-' }}</strong></p>
          <p>Atas nama: <strong>{{ company.bankHolder || 'PT. SLAZA TECHNOLOGY MANDIRI' }}</strong></p>
        </div>

        <div class="signature-row">
          <div class="sig-col">
            <p>Diterima oleh klien,</p>
            <div class="sig-space"></div>
            <p><strong>({{ signer || '-' }})</strong></p>
            <p v-if="!isPerson">{{ clientData.companyName || '-' }}</p>
          </div>
          <div class="sig-col">
            <p>Hormat kami,</p>
            <div class="sig-space"></div>
            <p><strong>Direktur Utama</strong></p>
            <p>PT. Slaza Technology Mandiri</p>
          </div>
        </div>
      </div>

      <div v-else-if="docType === 'bast'" class="doc-body">
        <div class="text-center">
          <p class="doc-type-title">BERITA ACARA SERAH TERIMA (BAST)</p>
          <p class="doc-subtitle">Nomor: {{ milestoneData.bastNumber || '-' }}</p>
        </div>

        <p class="paragraph">
          Pada tanggal {{ formatDate(milestoneData.bastDate) }}, telah dilakukan serah terima hasil pekerjaan rekayasa perangkat lunak dan perangkat keras IoT antara:
        </p>

        <div class="party-box">
          <p><strong>PIHAK PERTAMA (penyedia jasa):</strong> PT. Slaza Technology Mandiri</p>
          <p><strong>PIHAK KEDUA (pengguna jasa):</strong> {{ clientData.companyName || '-' }}<template v-if="!isPerson"> (u.p. {{ clientData.picName || '-' }})</template></p>
        </div>

        <p class="paragraph">Kedua belah pihak dengan ini menerangkan bahwa:</p>
        <ol class="bast-list">
          <li>PIHAK PERTAMA telah menyelesaikan pekerjaan <strong>{{ contractData.projectTitle || '-' }}</strong> sesuai ruang lingkup yang disepakati.</li>
          <li>Hasil pengujian aplikasi (<em>User Acceptance Test</em>) dan unit perangkat keras IoT telah diperiksa bersama oleh PIHAK KEDUA dan dinyatakan berfungsi.</li>
          <li>Dengan ditandatanganinya berita acara ini, pekerjaan dinyatakan selesai dan PIHAK PERTAMA berhak menerbitkan invoice pelunasan.</li>
          <li>Masa garansi fungsional berlaku 30 (tiga puluh) hari kalender sejak tanggal dokumen ini.</li>
        </ol>

        <div class="signature-row">
          <div class="sig-col">
            <p>PIHAK KEDUA (menerima),</p>
            <div class="sig-space"></div>
            <p><strong>({{ signer || '-' }})</strong></p>
            <p v-if="!isPerson">{{ clientData.companyName || '-' }}</p>
          </div>
          <div class="sig-col">
            <p>PIHAK PERTAMA (menyerahkan),</p>
            <div class="sig-space"></div>
            <p><strong>Direktur Utama</strong></p>
            <p>PT. Slaza Technology Mandiri</p>
          </div>
        </div>
      </div>
    </div>
  </dialog>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { formatDate } from '../../utils/finance';
import { translations } from '../../data/translations';

const office = translations.id.contact.office;

const props = defineProps({
  company: { type: Object, required: true }, // store.company, diisi di menu Data PT
  isOpen: { type: Boolean, default: false },
  docType: { type: String, default: 'invoice' }, // 'invoice' | 'bast'
  invoiceData: { type: Object, default: () => ({}) },
  clientData: { type: Object, default: () => ({}) },
  contractData: { type: Object, default: () => ({}) },
  milestoneData: { type: Object, default: () => ({}) }
});

defineEmits(['close']);

// Klien perorangan: tanpa "u.p.", dan yang tanda tangan adalah klien itu sendiri
const isPerson = computed(() => props.clientData.type === 'individual');
const signer = computed(() => isPerson.value ? props.clientData.companyName : props.clientData.picName);

const invoiceLines = computed(() => props.invoiceData.lines
  || [{ description: props.invoiceData.description, amount: props.invoiceData.grossAmount }]);

// Selama rekening kosong, invoice tidak bisa dicetak
const bankReady = computed(() => Boolean(props.company.bankName && props.company.bankAccount));

const dialogEl = ref(null);

// Dialog native: Escape dan tombol Tutup memicu event "close", yang diteruskan ke parent.
const sync = (open) => {
  const el = dialogEl.value;
  if (!el) return;
  if (open && !el.open) el.showModal();
  if (!open && el.open) el.close();
};
watch(() => props.isOpen, sync);
onMounted(() => sync(props.isOpen));

const closeOnBackdrop = (event) => {
  if (event.target === dialogEl.value) dialogEl.value.close();
};

// Nama file "Simpan sebagai PDF" diambil browser dari judul halaman, jadi judulnya diganti sementara.
// Karakter yang tidak boleh ada di nama file (misalnya "/" di nomor invoice) diganti "-".
const fileName = computed(() => {
  const number = props.docType === 'invoice' ? props.invoiceData.invoiceNumber : props.milestoneData.bastNumber;
  return [number, props.clientData.companyName].filter(Boolean).join(' - ').replace(/[\\/:*?"<>|]/g, '-');
});

const printDocument = () => {
  const original = document.title;
  document.title = fileName.value || original;
  window.addEventListener('afterprint', () => { document.title = original; }, { once: true });
  window.print();
};
</script>

<style scoped>
/* Bayangan menandai dokumen berada di atas halaman; tanpa blur karena latar tidak perlu disamarkan */
.doc-dialog {
  margin: auto; /* reset global "* { margin: 0 }" menghapus centering bawaan <dialog> */
  border: none;
  border-radius: var(--radius-md);
  padding: 0;
  width: min(820px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  box-shadow: 0 12px 32px rgba(9, 13, 22, 0.25);
  color: var(--text-primary);
}

.doc-dialog::backdrop {
  background: rgba(9, 13, 22, 0.6);
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 12px 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid var(--card-border);
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-dialog .btn {
  min-height: 44px;
}

.header-actions .btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.bank-missing {
  margin: 16px 24px 0;
  padding: 12px 16px;
  border: 1px solid #fca5a5;
  border-radius: var(--radius-sm);
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.88rem;
  line-height: 1.5;
}

.document-paper {
  padding: 40px;
  color: #1e293b;
  line-height: 1.5;
}

.letterhead p {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.letterhead .company-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.letterhead .company-meta {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.divider-line {
  height: 3px;
  background: var(--text-primary);
  margin: 16px 0 24px;
}

.doc-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.text-center {
  text-align: center;
  margin-bottom: 24px;
}

.doc-type-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
}

.doc-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.doc-ref {
  text-align: right;
  font-size: 0.9rem;
}

.client-box {
  border: 1px solid var(--card-border);
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.box-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 4px;
}

.item-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.item-table th {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 2px solid var(--text-primary);
  font-weight: 700;
}

.item-table td {
  padding: 14px;
  border-bottom: 1px solid var(--card-border);
}

.text-right {
  text-align: right;
}

.sub-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.total-amount {
  font-size: 1.15rem;
}

.note-box {
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: 0.85rem;
}

.note-title {
  font-weight: 700;
  margin-bottom: 4px;
}

.payment-info {
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.signature-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-top: 36px;
  page-break-inside: avoid;
}

.sig-col {
  width: 42%;
  text-align: center;
  font-size: 0.9rem;
}

.sig-space {
  height: 64px;
}

.party-box {
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  padding: 14px;
  margin: 16px 0;
  font-size: 0.9rem;
}

.bast-list {
  padding-left: 20px;
  margin: 16px 0 28px;
  font-size: 0.9rem;
}

.bast-list li {
  margin-bottom: 8px;
}

.paragraph {
  font-size: 0.9rem;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .document-paper {
    padding: 24px 16px;
  }

  .doc-ref {
    text-align: left;
  }
}

/* Menyembunyikan halaman di belakang dokumen ada di portal.css (harus global, bukan scoped) */
@media print {
  .no-print {
    display: none !important;
  }

  /* Dokumen mengalir biasa di kertas: tidak ada tinggi tetap atau scroll yang bisa menambah halaman kosong */
  .doc-dialog {
    position: static;
    display: block;
    margin: 0;
    width: auto;
    max-width: none;
    max-height: none;
    overflow: visible;
    border-radius: 0;
    box-shadow: none;
    outline: none; /* garis fokus dialog jangan ikut tercetak */
  }

  .doc-dialog::backdrop {
    display: none;
  }

  /* @page margin 0 (portal.css) menghilangkan header/footer browser, jadi margin kertas dibuat di sini.
     clone: padding diulang di setiap halaman jika dokumen lebih dari satu halaman. */
  #printable-area {
    padding: 14mm 16mm;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
}
</style>
