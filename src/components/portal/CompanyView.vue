<template>
  <section class="panel" aria-labelledby="company-title">
    <h2 id="company-title" class="panel-title">Data PT</h2>
    <p class="panel-desc">
      Dipakai di kop invoice dan BAST, serta untuk pengingat masa tarif PPh 0,5%. Alamat, email, dan telepon di kop surat diambil dari halaman Kontak website.
    </p>

    <form class="company-form" @submit.prevent="save" @input="status = ''">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="co-nib">NIB</label>
          <input id="co-nib" v-model.trim="form.nib" type="text" inputmode="numeric" pattern="\d{13}" maxlength="13" autocomplete="off" class="form-input mono" title="13 digit angka" aria-describedby="co-nib-hint" />
          <p id="co-nib-hint" class="field-hint">13 digit, lihat di akun OSS.</p>
        </div>
        <div class="form-group">
          <label class="form-label" for="co-npwp">NPWP PT</label>
          <input id="co-npwp" v-model.trim="form.npwp" type="text" inputmode="numeric" pattern="[0-9.\-]{15,20}" maxlength="20" autocomplete="off" class="form-input mono" title="15 atau 16 digit, boleh dengan titik dan strip" aria-describedby="co-npwp-hint" />
          <p id="co-npwp-hint" class="field-hint">Tulis persis seperti di kartu atau surat keterangan NPWP.</p>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="co-bank">Nama bank</label>
          <input id="co-bank" v-model.trim="form.bankName" type="text" autocomplete="off" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label" for="co-account">Nomor rekening</label>
          <input id="co-account" v-model.trim="form.bankAccount" type="text" inputmode="numeric" pattern="[0-9\- ]{5,30}" autocomplete="off" class="form-input mono" title="Angka, boleh dengan strip atau spasi" aria-describedby="co-account-hint" />
          <p id="co-account-hint" class="field-hint">Invoice baru bisa dicetak setelah nama bank dan nomor rekening diisi.</p>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="co-holder">Atas nama rekening</label>
          <input id="co-holder" v-model.trim="form.bankHolder" type="text" autocomplete="off" placeholder="PT. SLAZA TECHNOLOGY MANDIRI" class="form-input" aria-describedby="co-holder-hint" />
          <p id="co-holder-hint" class="field-hint">Kosongkan jika rekening atas nama PT. Jika memakai rekening pribadi, tulis nama pemilik persis seperti di buku tabungan.</p>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group year-field">
          <label class="form-label" for="co-year">Tahun PT terdaftar</label>
          <input id="co-year" v-model.number="form.registeredYear" type="number" min="2000" :max="thisYear" step="1" inputmode="numeric" class="form-input" aria-describedby="co-year-hint" />
          <p id="co-year-hint" class="field-hint">Tahun pajak pertama PT. Tarif 0,5% hanya berlaku 3 tahun pajak sejak tahun ini.</p>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-sm">Simpan data PT</button>
        <p class="save-status" role="status">{{ status }}</p>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { dateJkt } from '../../utils/finance';

const props = defineProps({
  store: { type: Object, required: true }
});

const thisYear = Number(dateJkt().slice(0, 4));
const form = reactive({});
const status = ref('');

// Isi ulang dari store, termasuk setelah backup dipulihkan
watch(() => props.store.company, (company) => Object.assign(form, company), { immediate: true });

// Format sudah diperiksa browser lewat atribut pattern/min/max sebelum submit.
const save = () => {
  props.store.saveCompany({ ...form });
  status.value = 'Data PT tersimpan.';
};
</script>

<style scoped>
.company-form {
  margin-top: 20px;
  max-width: 720px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0 20px;
}

.form-group {
  margin-bottom: 16px;
}

/* Isian 4 digit tidak perlu selebar dua kolom */
.year-field {
  max-width: 340px;
}

.field-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-top: 4px;
}

.save-status {
  font-size: 0.9rem;
  color: #166534;
}
</style>
