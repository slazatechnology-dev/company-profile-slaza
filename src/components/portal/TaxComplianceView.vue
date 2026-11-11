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
        <li>Buat kode billing di DJP Online: kode akun pajak <span class="mono">411128</span>, kode jenis setoran <span class="mono">420</span>.</li>
        <li>Bayar lewat m-banking, internet banking, atau teller.</li>
        <li>Catat kode billing dan NTPN dari bukti bayar di tabel di bawah.</li>
      </ol>
    </section>

    <section class="panel" aria-labelledby="ledger-title">
      <div class="panel-head">
        <h2 id="ledger-title" class="panel-title">Buku setoran PPh Final</h2>
        <dl class="figures">
          <div>
            <dt>Total pajak terhitung</dt>
            <dd>{{ formatRupiah(store.totalPajakTerutang) }}</dd>
          </div>
          <div>
            <dt>Belum disetor</dt>
            <dd :class="{ 'text-wait': store.totalPajakTersisa > 0 }">{{ formatRupiah(store.totalPajakTersisa) }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="store.taxRecords.length" class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th scope="col">Masa</th>
              <th scope="col" class="num">Omzet bruto</th>
              <th scope="col" class="num">PPh 0,5%</th>
              <th scope="col">Tenggat</th>
              <th scope="col">Kode billing</th>
              <th scope="col">NTPN</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="visually-hidden">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in store.taxRecords" :key="rec.id">
              <td>{{ rec.periodMonth }}/{{ rec.periodYear }}</td>
              <td class="num">{{ formatRupiah(rec.grossIncome) }}</td>
              <td class="num"><strong>{{ formatRupiah(rec.taxAmount) }}</strong></td>
              <td :class="{ 'text-block': isLate(rec) }">
                {{ formatDate(taxDeadline(rec.periodMonth, rec.periodYear)) }}
                <span v-if="isLate(rec)" class="late-note">lewat tenggat</span>
              </td>
              <td class="mono">{{ rec.billingCode || '-' }}</td>
              <td class="mono">{{ rec.ntpn || '-' }}</td>
              <td>
                <span class="tag" :class="rec.isSettled ? 'ok' : 'wait'">
                  {{ rec.isSettled ? `Disetor ${formatDate(rec.paymentDate)}` : 'Belum disetor' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="rec.isSettled ? 'btn-secondary' : 'btn-primary'"
                  @click="openNtpn(rec)"
                >
                  {{ rec.isSettled ? 'Ubah NTPN' : 'Catat NTPN' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <strong>Belum ada catatan pajak.</strong>
        Catatan dibuat otomatis saat sebuah invoice dicatat lunas di menu Proyek & termin.
      </div>
    </section>

    <FormDialog v-model:open="isOpen" title="Catat bukti setor pajak" submit-label="Simpan bukti setor" @submit="saveNtpn">
          <p class="dialog-hint">
            Masukkan kode billing dan NTPN dari bukti bayar PPh Final sebesar <strong>{{ formatRupiah(form.taxAmount) }}</strong>.
          </p>

          <div class="form-group">
            <label class="form-label" for="ntpn-billing">Kode billing (15 digit, boleh dikosongkan)</label>
            <input
              id="ntpn-billing"
              autofocus
              v-model.trim="form.billingCode"
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

const props = defineProps({
  store: { type: Object, required: true }
});

const pp55LastYear = computed(() => props.store.company.registeredYear && props.store.company.registeredYear + 2);
const pp55Expired = computed(() => !!pp55LastYear.value && Number(dateJkt().slice(0, 4)) > pp55LastYear.value);

const isLate = (rec) => !rec.isSettled && dateJkt() > taxDeadline(rec.periodMonth, rec.periodYear);

const isOpen = ref(false);
const form = reactive({ recordId: '', taxAmount: 0, billingCode: '', ntpn: '' });

const openNtpn = (rec) => {
  Object.assign(form, { recordId: rec.id, taxAmount: rec.taxAmount, billingCode: rec.billingCode || '', ntpn: rec.ntpn || '' });
  isOpen.value = true;
};

// Format sudah diperiksa browser lewat atribut pattern/required sebelum submit.
const saveNtpn = () => {
  props.store.settleTaxRecord(form.recordId, form.billingCode, form.ntpn.toUpperCase());
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

.late-note {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
}

/* NTPN di bukti bayar selalu huruf kapital; input ikut agar mudah dicocokkan */
.ntpn-input {
  text-transform: uppercase;
}
</style>
