<template>
  <div class="lkpm-view">
    <section class="panel" aria-labelledby="lkpm-title">
      <h2 id="lkpm-title" class="panel-title">LKPM {{ store.lkpmSummary.periodLabel }}</h2>
      <p class="panel-desc">
        Laporan Kegiatan Penanaman Modal untuk usaha kecil disampaikan per semester di oss.go.id, paling lambat
        <strong>{{ formatDate(store.lkpmSummary.deadline) }}</strong> untuk periode ini. Angka omzet dan modal kerja di bawah dihitung dari invoice yang lunas dan pengeluaran yang dicatat pada semester ini.
      </p>

      <ul class="lkpm-fields">
        <li v-for="item in lkpmFields" :key="item.label" class="lkpm-field">
          <div class="field-text">
            <p class="field-label">{{ item.label }}</p>
            <p class="field-value">{{ item.displayValue }}</p>
            <p class="field-hint">{{ item.hint }}</p>
          </div>
          <div class="field-copy">
            <button type="button" class="btn btn-secondary btn-sm" :aria-label="`Salin ${item.label}`" @click="copy(item)">
              Salin
            </button>
            <span class="copy-status" role="status">
              <template v-if="copyState.label === item.label">
                {{ copyState.ok ? 'Tersalin' : `Gagal menyalin, ketik manual: ${item.copyValue}` }}
              </template>
            </span>
          </div>
        </li>
      </ul>
    </section>

    <section class="panel" aria-labelledby="lkpm-steps">
      <h2 id="lkpm-steps" class="panel-title">Langkah pengisian</h2>
      <ol class="steps">
        <li>Masuk ke <a href="https://oss.go.id" target="_blank" rel="noopener noreferrer">oss.go.id</a> dengan akun NIB PT.</li>
        <li>Buka menu laporan LKPM dan buat laporan untuk {{ store.lkpmSummary.periodLabel }}.</li>
        <li>Pilih KBLI proyek, lalu salin angka modal kerja, omzet, dan tenaga kerja dari daftar di atas.</li>
        <li>Isi bagian kendala sesuai kondisi usaha semester ini, lalu kirim laporan.</li>
      </ol>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { formatRupiah } from '../../composables/useComplianceStore';
import { formatDate } from '../../utils/finance';

const props = defineProps({
  store: { type: Object, required: true }
});

const lkpmFields = computed(() => {
  const sum = props.store.lkpmSummary;
  return [
    { label: 'Realisasi modal kerja', displayValue: formatRupiah(sum.totalModalKerjaRealisasi), copyValue: String(sum.totalModalKerjaRealisasi), hint: 'Semua pengeluaran bertanggal di semester ini' },
    { label: 'Omzet', displayValue: formatRupiah(sum.totalRevenue), copyValue: String(sum.totalRevenue), hint: 'Invoice yang dibayar di semester ini' },
    { label: 'Tenaga kerja Indonesia', displayValue: '1 orang', copyValue: '1', hint: 'Direktur yang bekerja sendiri. Ubah jika sudah ada karyawan.' },
    { label: 'KBLI 62019', displayValue: '62019', copyValue: '62019', hint: 'Aktivitas pemrograman komputer lainnya' },
    { label: 'KBLI 62020', displayValue: '62020', copyValue: '62020', hint: 'Aktivitas konsultasi komputer' }
  ];
});

const copyState = reactive({ label: '', ok: true });
let resetTimer;

const copy = async (item) => {
  try {
    await navigator.clipboard.writeText(item.copyValue);
    copyState.ok = true;
  } catch (_) {
    copyState.ok = false;
  }
  copyState.label = item.label;
  clearTimeout(resetTimer);
  if (copyState.ok) resetTimer = setTimeout(() => { copyState.label = ''; }, 2500);
};
</script>

<style scoped>
.lkpm-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lkpm-fields {
  list-style: none;
  margin-top: 20px;
  border-top: 1px solid var(--card-border);
}

.lkpm-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding: 14px 0;
  border-bottom: 1px solid var(--card-border);
}

.field-label {
  font-size: 0.88rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.field-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.field-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.field-copy {
  display: flex;
  align-items: center;
  gap: 12px;
}

.copy-status {
  font-size: 0.85rem;
  color: var(--text-secondary);
  min-width: 70px;
}

.steps {
  padding-left: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-top: 8px;
}

/* Area sentuh 44px tanpa mengubah tinggi baris teks */
.steps a {
  display: inline-block;
  padding: 13px 0;
  margin: -13px 0;
  color: var(--accent-primary);
  font-weight: 600;
}
</style>
