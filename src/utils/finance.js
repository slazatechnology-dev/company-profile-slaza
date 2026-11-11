// PPh Final UMKM PP 55/2022
export const TAX_RATE = 0.005;

export const taxOf = (gross) => Math.round((Number(gross) || 0) * TAX_RATE);

// Tanggal YYYY-MM-DD menurut WIB, bukan UTC (toISOString mundur sehari sebelum jam 07.00 WIB)
export const dateJkt = (d = new Date()) => d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });

export const formatRupiah = (val) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(val || 0);

// '2026-10-31' -> '31 Okt 2026'. String YYYY-MM-DD dibaca sebagai UTC, jadi format juga di UTC agar tanggal tidak bergeser.
export const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  : '-';

// PPh Final masa M/Y disetor paling lambat tanggal 15 bulan berikutnya.
export const taxDeadline = (month, year) => month === 12
  ? `${year + 1}-01-15`
  : `${year}-${String(month + 1).padStart(2, '0')}-15`;

// Nomor dokumen berurutan per tahun: PREFIX/TAHUN/TIPE-001. Urutan dihitung dari nomor yang sudah ada.
export const nextDocNumber = (existing, prefix, type, date = dateJkt()) => {
  const head = `${prefix}/${date.slice(0, 4)}/`;
  const seqs = existing
    .filter(n => typeof n === 'string' && n.startsWith(head))
    .map(n => Number(n.match(/-(\d+)$/)?.[1]) || 0);
  return `${head}${type}-${String(Math.max(0, ...seqs) + 1).padStart(3, '0')}`;
};

// Tahap termin dari awal sampai lunas. next = id tahap pertama yang belum selesai (null = sudah lunas).
export const milestoneSteps = (ms, hasInvoice) => {
  const paid = ms.status === 'paid';
  const steps = ms.isBastRequired
    ? [
        { id: 'issueBast', label: 'BAST terbit', done: paid || !!ms.bastNumber },
        { id: 'signBast', label: 'Ditandatangani klien', done: paid || !!ms.isBastSigned },
        { id: 'pay', label: 'Lunas', done: paid }
      ]
    : [
        { id: 'issueInvoice', label: 'Invoice terbit', done: paid || hasInvoice },
        { id: 'pay', label: 'Lunas', done: paid }
      ];
  return { steps, next: steps.find(s => !s.done)?.id || null };
};

// Biaya rutin yang belum dicatat periode ini: entri terakhir tiap seri yang masih berulang
// dan sudah lewat 1 bulan (monthly) atau 12 bulan (yearly) dari tanggal entri itu.
export const dueRecurring = (expenses, today = dateJkt()) => {
  const latest = new Map();
  for (const e of expenses) {
    const key = e.seriesId || e.id;
    if (!latest.has(key) || e.date > latest.get(key).date) latest.set(key, e);
  }
  const monthIndex = (iso) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7));
  return [...latest.values()].filter(e => e.repeat && monthIndex(today) >= monthIndex(e.date) + (e.repeat === 'yearly' ? 12 : 1));
};

// Laba basis kas: yang sudah dibayar klien, dikurangi PPh Final-nya dan biaya.
// projected: perkiraan bila kontrak lunas (nilai kontrak + maintenance yang sudah dibayar).
export const profitSummary = (paidInvoices, cost, contractValue = 0) => {
  const sum = (list, key) => list.reduce((s, i) => s + i[key], 0);
  const received = sum(paidInvoices, 'grossAmount');
  const tax = sum(paidInvoices, 'taxAmount');
  const estRevenue = contractValue + sum(paidInvoices.filter(i => !i.milestoneId), 'grossAmount');
  return { received, tax, cost, profit: received - tax - cost, projected: estRevenue - taxOf(estRevenue) - cost };
};

// Jatuh tempo invoice: tanggal yang diisi, atau 14 hari kalender sejak terbit (sesuai teks di invoice).
export const invoiceDueDate = (inv) => {
  if (inv.dueDate) return inv.dueDate;
  const d = new Date(`${inv.issueDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
};

// Tagihan belum dibayar klien: invoice terbit yang belum lunas
// + sisa nilai kontrak (awal + tambahan) yang belum dibuatkan invoice termin.
export const unpaidByClient = (invoices, contractValue = 0) => {
  const sum = (list) => list.reduce((s, i) => s + i.grossAmount, 0);
  return sum(invoices.filter(i => i.status !== 'paid'))
    + Math.max(0, contractValue - sum(invoices.filter(i => i.milestoneId)));
};
