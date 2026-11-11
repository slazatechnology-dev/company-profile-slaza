import { reactive } from 'vue';

// Pengganti window.confirm/alert dengan dialog portal (ConfirmDialog.vue, dipasang sekali di CompliancePortal).
// Pemakaian: if (await askConfirm({ title, message, facts, note, confirmLabel, tone: 'danger' })) { ... }
export const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  facts: [], // [[label, nilai], ...]: ringkasan data yang dikonfirmasi (nomor, jumlah, pajak)
  note: '',
  confirmLabel: '',
  tone: 'primary', // 'primary' | 'danger'
  noticeOnly: false, // true = hanya tombol tutup (pengganti alert)
  resolve: null
});

export const askConfirm = (options) => new Promise((resolve) => {
  confirmState.resolve?.(false); // dialog sebelumnya yang belum dijawab dianggap batal
  Object.assign(confirmState, {
    title: '',
    message: '',
    facts: [],
    note: '',
    confirmLabel: 'Ya, lanjutkan',
    tone: 'primary',
    noticeOnly: false,
    ...options,
    open: true,
    resolve
  });
});

export const showNotice = (options) => askConfirm({ confirmLabel: 'Mengerti', ...options, noticeOnly: true });

export const answerConfirm = (value) => {
  const resolve = confirmState.resolve;
  confirmState.open = false;
  confirmState.resolve = null;
  resolve?.(value);
};
