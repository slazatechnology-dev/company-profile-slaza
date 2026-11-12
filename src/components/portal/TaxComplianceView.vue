<template>
  <div class="tax-view">
    <section class="panel" aria-labelledby="tax-title">
      <h2 id="tax-title" class="panel-title">PPh Final 0,5% (PP No. 55 Tahun 2022)</h2>
      <p class="panel-desc">
        PT dengan omzet di bawah Rp4,8 miliar setahun membayar PPh Final 0,5% dari setiap pembayaran yang diterima. Setoran tiap masa (bulan) paling lambat tanggal 15 bulan berikutnya.
      </p>
      <p class="pp55-note" :class="pp55Expired ? 'text-block' : 'text-wait'">
        <template v-if="!pp55LastYear">
          Tahun terdaftar PT belum diisi di menu Data PT. PT hanya boleh memakai tarif 0,5% selama 3 tahun pajak.
        </template>
        <template v-else-if="pp55Expired">
          Masa tarif 0,5% berakhir di tahun pajak {{ pp55LastYear }}. Mulai {{ pp55LastYear + 1 }} gunakan tarif umum PPh Badan (Pasal 17 / 31E); angka 0,5% di portal ini tidak berlaku lagi.
        </template>
        <template v-else>
          Tarif 0,5% berlaku sampai akhir tahun pajak {{ pp55LastYear }} (3 tahun pajak sejak PT terdaftar).
        </template>
      </p>

      <h3 class="steps-title">Cara setor</h3>
      <ol class="steps">
        <li>Setelah bulannya berakhir, buka <strong>Isian kode billing</strong> di bulan itu (daftar di bawah).</li>
        <li>Masuk ke <a href="https://coretaxdjp.pajak.go.id" target="_blank" rel="noopener noreferrer">Coretax DJP</a> dengan akun PT, lalu buat kode billing (menu Pembayaran, Layanan Mandiri Kode Billing). Salin isiannya satu per satu.</li>
        <li>Bayar kode billing lewat m-banking, internet banking, atau teller sebelum tenggat.</li>
        <li>Klik <strong>Catat setoran</strong> di bulan itu, lalu isi kode billing dan NTPN dari bukti bayar.</li>
      </ol>
    </section>

    <!-- Masa berjalan: berapa yang terkumpul bulan ini dan kapan harus disetor -->
    <section class="panel current" aria-labelledby="current-title">
      <h2 id="current-title" class="panel-title">Bulan ini: {{ periodLabel(thisYear, thisMonth) }}</h2>
      <dl class="figures">
        <div>
          <dt>Omzet diterima sejauh ini</dt>
          <dd>{{ formatRupiah(current?.gross || 0) }}</dd>
        </div>
        <div>
          <dt>PPh 0,5% bulan ini</dt>
          <dd :class="{ 'text-wait': current?.due > 0 }">{{ formatRupiah(current?.due || 0) }}</dd>
        </div>
        <div>
          <dt>Setor paling lambat</dt>
          <dd>{{ formatDate(taxDeadline(thisMonth, thisYear)) }}</dd>
        </div>
      </dl>
      <p class="panel-desc current-note">
        Angka ini masih bisa bertambah sampai akhir bulan, setiap kali ada pembayaran yang dicatat lunas.
        Setor sekali saja setelah bulan berakhir, untuk total seluruh pembayaran bulan ini.
        <template v-if="!current">Bulan ini belum ada uang masuk, jadi belum ada yang perlu disetor.</template>
      </p>
    </section>

    <section class="panel" aria-labelledby="ledger-title">
      <div class="panel-head">
        <h2 id="ledger-title" class="panel-title">Setoran per bulan</h2>
        <dl class="figures">
          <div>
            <dt>Total PPh terhitung</dt>
            <dd>{{ formatRupiah(store.totalPajakTerutang) }}</dd>
          </div>
          <div>
            <dt>Belum disetor</dt>
            <dd :class="{ 'text-wait': store.totalPajakTersisa > 0 }">{{ formatRupiah(store.totalPajakTersisa) }}</dd>
          </div>
        </dl>
      </div>

      <ul v-if="store.taxPeriods.length" class="period-list">
        <li v-for="p in store.taxPeriods" :key="p.key" class="period">
          <div class="period-main">
            <div class="period-info">
              <p class="period-title">{{ periodLabel(p.year, p.month) }}</p>
              <p class="muted small">
                Omzet {{ formatRupiah(p.gross) }} dari {{ p.records.length }} pembayaran
                · Tenggat {{ formatDate(p.deadline) }}
                <span v-if="isLate(p)" class="text-block"><strong> · Lewat tenggat</strong></span>
              </p>
              <p v-if="p.ntpns.length" class="muted small">NTPN: <span class="mono">{{ p.ntpns.join(', ') }}</span></p>
            </div>
            <div class="period-amount">
              <p class="amount">{{ formatRupiah(p.due || p.tax) }}</p>
              <span v-if="p.settled" class="tag ok">Sudah disetor</span>
              <span v-else-if="p.due !== p.tax" class="tag wait">Kurang setor</span>
              <span v-else-if="isRunning(p)" class="tag">Bulan berjalan</span>
              <span v-else class="tag wait">Belum disetor</span>
            </div>
            <button
              type="button"
              class="btn btn-sm"
              :class="p.settled || isRunning(p) ? 'btn-secondary' : 'btn-primary'"
              @click="openSettle(p)"
            >
              {{ p.settled ? 'Ubah NTPN' : 'Catat setoran' }}
            </button>
          </div>

          <!-- Isian persis seperti formulir kode billing DJP, dengan tombol salin per baris -->
          <details v-if="!p.settled" class="period-detail">
            <summary>Isian kode billing DJP</summary>
            <dl class="billing-fields">
              <div v-for="f in billingFields(p)" :key="f.label">
                <dt>{{ f.label }}</dt>
                <dd>
                  <span :class="{ mono: f.mono }">{{ f.value }}</span>
                  <span v-if="f.note" class="muted small">{{ f.note }}</span>
                </dd>
                <button v-if="f.copy" type="button" class="btn-text copy-btn" :aria-label="`Salin ${f.label}`" @click="copy(f, p)">
                  {{ copied === f.label + p.key ? 'Tersalin' : 'Salin' }}
                </button>
              </div>
            </dl>
            <p v-if="!store.company.npwp" class="muted small">NPWP PT belum diisi. Lengkapi di menu Data PT.</p>
          </details>

          <details class="period-detail">
            <summary>Rincian pembayaran</summary>
            <table class="data-table">
              <tbody>
                <tr v-for="rec in p.records" :key="rec.id">
                  <td>
                    <span class="mono">{{ invoiceOf(rec)?.invoiceNumber || '-' }}</span>
                    <span class="cell-sub">{{ invoiceOf(rec)?.description || '' }}</span>
                  </td>
                  <td class="nowrap">{{ formatDate(invoiceOf(rec)?.paidDate) }}</td>
                  <td class="num">{{ formatRupiah(rec.grossIncome) }}</td>
                  <td><span class="tag" :class="rec.isSettled ? 'ok' : 'wait'">{{ rec.isSettled ? 'Disetor' : 'Belum' }}</span></td>
                  <td>
                    <!-- Biaya pihak ketiga yang diganti klien (domain, server) bukan omzet: hapus dari setoran -->
                    <button
                      v-if="!rec.isSettled && invoiceOf(rec)?.milestoneId"
                      type="button"
                      class="btn-text"
                      :aria-label="`Tandai ${invoiceOf(rec)?.invoiceNumber} sebagai talangan`"
                      @click="markReimbursement(rec)"
                    >
                      Tandai talangan
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </details>
        </li>
      </ul>
      <div v-else class="empty-state">
        <strong>Belum ada catatan pajak.</strong>
        Catatan dibuat otomatis saat sebuah invoice dicatat lunas di menu Proyek & termin.
      </div>
    </section>

    <FormDialog v-model:open="isOpen" title="Catat bukti setor pajak" submit-label="Simpan bukti setor" @submit="saveNtpn">
      <p class="dialog-hint">
        Setoran PPh Final masa <strong>{{ form.label }}</strong> sebesar <strong>{{ formatRupiah(form.amount) }}</strong>
        (0,5% dari omzet {{ formatRupiah(form.gross) }}). Satu kode billing dan NTPN berlaku untuk semua pembayaran di bulan ini.
      </p>

      <div class="form-group">
        <label class="form-label" for="ntpn-billing">Kode billing (15 digit, boleh dikosongkan)</label>
        <input
          id="ntpn-billing"
          v-model.trim="form.billingCode"
          autofocus
          type="text"
          inputmode="numeric"
          pattern="\d{15}"
          maxlength="15"
          autocomplete="off"
          class="form-input mono"
          title="15 digit angka"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="ntpn-number">NTPN (16 karakter huruf dan angka)</label>
        <input
          id="ntpn-number"
          v-model.trim="form.ntpn"
          type="text"
          pattern="[0-9A-Za-z]{16}"
          maxlength="16"
          autocomplete="off"
          required
          class="form-input mono ntpn-input"
          title="16 karakter huruf dan angka"
        />
      </div>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { dateJkt, formatDate, taxDeadline } from '../../utils/finance';
import FormDialog from './FormDialog.vue';
import { askConfirm, showNotice } from '../../composables/useConfirm';

const props = defineProps({
  store: { type: Object, required: true }
});

const pp55LastYear = computed(() => props.store.company.registeredYear && props.store.company.registeredYear + 2);
const pp55Expired = computed(() => !!pp55LastYear.value && Number(dateJkt().slice(0, 4)) > pp55LastYear.value);

const today = dateJkt();
const thisYear = Number(today.slice(0, 4));
const thisMonth = Number(today.slice(5, 7));
const current = computed(() => props.store.taxPeriods.find(p => p.year === thisYear && p.month === thisMonth));

const periodLabel = (year, month) => new Date(Date.UTC(year, month - 1, 1))
  .toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const isRunning = (p) => p.year === thisYear && p.month === thisMonth;
const isLate = (p) => p.due > 0 && today > p.deadline;
// Nilai yang diisi di formulir kode billing (Coretax / e-Billing DJP) untuk PPh Final 0,5% PP 55/2022
const billingFields = (p) => {
  const month = new Date(Date.UTC(p.year, p.month - 1, 1)).toLocaleDateString('id-ID', { month: 'long', timeZone: 'UTC' });
  const npwp = props.store.company.npwp || '-';
  return [
    { label: 'NPWP', value: npwp, mono: true, copy: npwp !== '-' ? npwp : '' },
    { label: 'Kode akun pajak (KAP)', value: '411128', note: 'PPh Final', mono: true, copy: '411128' },
    { label: 'Kode jenis setoran (KJS)', value: '420', note: 'PPh Final atas penghasilan usaha dengan peredaran bruto tertentu (PP 55/2022)', mono: true, copy: '420' },
    { label: 'Masa pajak', value: `${month} sampai ${month}`, note: `bulan ${p.month}` },
    { label: 'Tahun pajak', value: String(p.year), mono: true, copy: String(p.year) },
    { label: 'Jumlah setor', value: formatRupiah(p.due), mono: true, copy: String(p.due) },
    { label: 'Uraian (boleh diisi)', value: `PPh Final 0,5% PP 55/2022 masa ${month} ${p.year}, omzet ${formatRupiah(p.gross)}`, copy: `PPh Final 0,5% PP 55/2022 masa ${month} ${p.year}, omzet ${formatRupiah(p.gross)}` }
  ];
};

const copied = ref('');
const copy = async (f, p) => {
  try {
    await navigator.clipboard.writeText(f.copy);
    copied.value = f.label + p.key;
    setTimeout(() => { if (copied.value === f.label + p.key) copied.value = ''; }, 2000);
  } catch {
    copied.value = '';
    showNotice({ title: 'Gagal menyalin', message: `Salin manual: ${f.copy}` });
  }
};

const invoiceOf = (rec) => props.store.invoices.find(i => i.id === rec.invoiceId);

const isOpen = ref(false);
const form = reactive({ year: 0, month: 0, label: '', amount: 0, gross: 0, billingCode: '', ntpn: '' });

const openSettle = (p) => {
  const last = p.records.find(r => r.ntpn);
  Object.assign(form, {
    year: p.year,
    month: p.month,
    label: periodLabel(p.year, p.month),
    amount: p.settled ? p.tax : p.due,
    gross: p.gross,
    billingCode: p.settled ? last?.billingCode || '' : '',
    ntpn: p.settled ? last?.ntpn || '' : ''
  });
  isOpen.value = true;
};

const markReimbursement = async (rec) => {
  const inv = invoiceOf(rec);
  if (!inv) return;
  const ok = await askConfirm({
    title: `Tandai ${inv.invoiceNumber} sebagai talangan?`,
    message: 'Untuk biaya pihak ketiga yang kamu bayarkan dulu lalu diganti klien sebesar harga beli (misalnya domain atau server atas nama klien). Pajaknya sudah dibayar ke penjual.',
    facts: [['Untuk', inv.description], ['Jumlah', formatRupiah(inv.grossAmount)], ['PPh yang dihapus dari setoran', formatRupiah(rec.taxAmount)]],
    note: 'Pembayaran ini tidak lagi dihitung sebagai omzet. Simpan bukti pembelian dari pihak ketiga.',
    confirmLabel: 'Ya, ini talangan'
  });
  if (!ok) return;
  const reason = props.store.markInvoiceReimbursement(inv.id);
  if (reason) showNotice({ title: 'Belum bisa ditandai', message: reason });
};

// Format sudah diperiksa browser lewat atribut pattern/required sebelum submit.
const saveNtpn = () => {
  props.store.settleTaxPeriod(form.year, form.month, form.billingCode, form.ntpn.toUpperCase());
  isOpen.value = false;
};
</script>

<style scoped>
.tax-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pp55-note {
  margin-top: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  max-width: 760px;
}

.steps-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 20px 0 6px;
}

.steps {
  padding-left: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.small {
  font-size: 0.85rem;
}

.current {
  border-left: 4px solid var(--accent-primary);
}

.current .figures {
  margin-top: 12px;
}

.current-note {
  margin-top: 12px;
}

.period-list {
  list-style: none;
  border-top: 1px solid var(--card-border);
}

.period {
  padding: 14px 0;
  border-bottom: 1px solid var(--card-border);
}

.period-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.period-info {
  flex: 1;
  min-width: 220px;
}

.period-title {
  font-weight: 700;
  color: var(--text-primary);
}

.period-amount {
  text-align: right;
}

.amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.period-detail summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.period-detail summary:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.billing-fields {
  margin: 4px 0 12px;
  padding: 4px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.billing-fields div {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr) auto;
  align-items: center;
  gap: 4px 16px;
  padding: 6px 0;
  font-size: 0.9rem;
}

.billing-fields div + div {
  border-top: 1px solid var(--card-border);
}

.billing-fields dt {
  color: var(--text-muted);
}

.billing-fields dd {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.billing-fields dd .small {
  font-weight: 400;
}

.copy-btn {
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .billing-fields div {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  .billing-fields dt {
    grid-column: 1 / -1;
  }
}

.cell-sub {
  display: block;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.nowrap {
  white-space: nowrap;
}

/* NTPN di bukti bayar selalu huruf kapital; input ikut agar mudah dicocokkan */
.ntpn-input {
  text-transform: uppercase;
}
</style>
