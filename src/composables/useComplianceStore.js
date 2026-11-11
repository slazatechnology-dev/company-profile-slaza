import { ref, computed, reactive } from 'vue';
import { ClientModel } from '../models/ClientModel.js';
import { ContractModel } from '../models/ContractModel.js';
import { MilestoneModel } from '../models/MilestoneModel.js';
import { InvoiceModel } from '../models/InvoiceModel.js';
import { TaxRecordModel } from '../models/TaxRecordModel.js';
import { MaintenancePlanModel } from '../models/MaintenancePlanModel.js';
import { ExpenseModel } from '../models/ExpenseModel.js';

import { taxOf, dateJkt, nextDocNumber, formatRupiah, dueRecurring, profitSummary, unpaidByClient, invoiceDueDate, taxByPeriod } from '../utils/finance.js';

export { formatRupiah };

// Nama koleksi Firestore = key di sini (lihat firestore.rules)
export const MODELS = {
  clients: ClientModel,
  contracts: ContractModel,
  milestones: MilestoneModel,
  invoices: InvoiceModel,
  taxRecords: TaxRecordModel,
  maintenancePlans: MaintenancePlanModel,
  expenses: ExpenseModel
};

// Data legal & rekening PT untuk kop dan invoice. registeredYear: tahun pajak PT pertama terdaftar
// (tarif 0,5% PP 55/2022 hanya boleh dipakai 3 tahun pajak).
// bankHolder: nama pemilik rekening; kosong = atas nama PT (bisa diisi nama pribadi selama rekening PT belum ada)
export const EMPTY_COMPANY = { nib: '', npwp: '', bankName: '', bankAccount: '', bankHolder: '', registeredYear: null };

const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

// JSON -> model. Melempar error jika bentuknya bukan data portal.
const parsePayload = (json) => {
  const parsed = JSON.parse(json);
  if (!isPlainObject(parsed)) throw new Error('Format data tidak dikenal');
  if (parsed.company != null && !isPlainObject(parsed.company)) throw new Error('Bagian "company" harus berupa objek');
  const data = Object.fromEntries(Object.entries(MODELS).map(([key, Model]) => {
    const list = parsed[key] ?? [];
    if (!Array.isArray(list)) throw new Error(`Bagian "${key}" harus berupa daftar`);
    return [key, list.map(Model.fromJson)];
  }));
  // Backup lama belum punya bagian company: null = data PT yang sekarang dipertahankan
  data.company = parsed.company ? { ...EMPTY_COMPANY, ...parsed.company } : null;
  return data;
};

export const useComplianceStore = () => {
  // Mulai kosong; isinya datang dari Firestore (lihat firestoreSync.js)
  const clients = ref([]);
  const contracts = ref([]);
  const milestones = ref([]);
  const invoices = ref([]);
  const taxRecords = ref([]);
  const maintenancePlans = ref([]);
  const expenses = ref([]);
  const company = ref({ ...EMPTY_COMPANY });

  const lists = { clients, contracts, milestones, invoices, taxRecords, maintenancePlans, expenses };

  const exportData = () => JSON.stringify({
    ...Object.fromEntries(Object.entries(lists).map(([key, list]) => [key, list.value.map(item => item.toJson())])),
    company: company.value
  });

  // Ganti seluruh data dengan isi file backup. Melempar error jika file tidak valid (data lama tidak disentuh).
  const importData = (json) => {
    const data = parsePayload(json);
    for (const key in lists) lists[key].value = data[key];
    if (data.company) company.value = data.company;
  };

  const saveCompany = (data) => {
    company.value = { ...EMPTY_COMPANY, ...data, registeredYear: Number(data.registeredYear) || null };
  };

  // CRUD data master (klien, kontrak, termin, paket maintenance, pengeluaran).
  // Store hanya mengubah data di memori; firestoreSync.js mengirim perubahannya ke Firestore.
  const EDITABLE = ['clients', 'contracts', 'milestones', 'maintenancePlans', 'expenses'];

  const saveRecord = (kind, data) => {
    if (!EDITABLE.includes(kind)) throw new Error(`"${kind}" tidak bisa diubah lewat form`);
    const item = new MODELS[kind](data);
    const list = lists[kind].value;
    const index = list.findIndex(x => x.id === item.id);
    if (index >= 0) list[index] = item;
    else list.push(item);
    return item.id;
  };

  // Invoice yang dibatalkan (digabung ke invoice lain) tetap disimpan sebagai arsip nomor,
  // tapi tidak dihitung sebagai tagihan, piutang, atau penanda termin sudah diinvoice.
  const activeInvoices = computed(() => invoices.value.filter(i => i.status !== 'cancelled'));

  // Invoice yang memuat termin ini (invoice gabungan bisa memuat beberapa termin)
  const invoiceOfMilestone = (milestoneId) => activeInvoices.value.find(i => i.lines.some(l => l.milestoneId === milestoneId));
  const milestoneHasInvoice = (milestoneId) => !!invoiceOfMilestone(milestoneId);

  // Alasan sebuah data tidak boleh dihapus ('' = boleh). Catatan keuangan yang sudah terbit tidak boleh kehilangan induknya.
  const deleteBlocker = (kind, id) => {
    if (kind === 'clients' && contracts.value.some(c => c.clientId === id)) {
      return 'Klien ini masih punya kontrak. Hapus atau pindahkan kontraknya dulu.';
    }
    if (kind === 'contracts' && invoices.value.some(i => i.contractId === id)) {
      return 'Kontrak ini sudah punya invoice, jadi tidak bisa dihapus.';
    }
    if (kind === 'contracts' && expenses.value.some(e => e.contractId === id)) {
      return 'Kontrak ini punya catatan pengeluaran. Hapus atau pindahkan pengeluarannya dulu.';
    }
    if (kind === 'milestones' && (milestoneHasInvoice(id) || (findMilestone(id)?.isBastRequired && findMilestone(id)?.bastNumber))) {
      return milestoneHasInvoice(id) ? 'Termin ini sudah punya invoice, jadi tidak bisa dihapus.' : 'Termin ini sudah punya BAST. Hapus centang Wajib BAST dan simpan dulu, lalu hapus terminnya.';
    }
    return '';
  };

  const deleteRecord = (kind, id) => {
    if (!EDITABLE.includes(kind) || deleteBlocker(kind, id)) return false;
    if (kind === 'contracts') {
      milestones.value = milestones.value.filter(m => m.contractId !== id);
      maintenancePlans.value = maintenancePlans.value.filter(p => p.contractId !== id);
    }
    lists[kind].value = lists[kind].value.filter(x => x.id !== id);
    return true;
  };

  // Komputasi Ringkasan Finansial
  const paidInvoices = computed(() => invoices.value.filter(inv => inv.status === 'paid'));

  const totalOmzetLunas = computed(() => {
    return paidInvoices.value.reduce((sum, inv) => sum + inv.grossAmount, 0);
  });

  // PPh Final disetor sekali per masa (bulan): 0,5% x total omzet bulan itu (lihat taxByPeriod)
  const taxPeriods = computed(() => taxByPeriod(taxRecords.value));
  const totalPajakTerutang = computed(() => taxPeriods.value.reduce((sum, p) => sum + p.tax, 0));
  const totalPajakTersisa = computed(() => taxPeriods.value.reduce((sum, p) => sum + p.due, 0));

  const totalPengeluaran = computed(() => {
    return expenses.value.reduce((sum, exp) => sum + exp.amount, 0);
  });

  const projectCost = (contractId) => expenses.value
    .filter(e => e.contractId === contractId)
    .reduce((sum, e) => sum + e.amount, 0);

  const recurringDue = computed(() => dueRecurring(expenses.value));

  const projectProfit = (contractId) => profitSummary(
    paidInvoices.value.filter(i => i.contractId === contractId),
    projectCost(contractId),
    contracts.value.find(c => c.id === contractId)?.totalValue || 0
  );

  const projectUnpaid = (contractId) => unpaidByClient(
    activeInvoices.value.filter(i => i.contractId === contractId),
    contracts.value.find(c => c.id === contractId)?.totalValue || 0
  );

  // Semua invoice yang belum dibayar klien, jatuh tempo terdekat di atas
  const unpaidInvoices = computed(() => activeInvoices.value
    .filter(i => i.status !== 'paid')
    .map(i => ({ invoice: i, dueDate: invoiceDueDate(i) }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)));

  const totalUnpaid = computed(() => contracts.value.reduce((sum, c) => sum + projectUnpaid(c.id), 0));

  // Laba bersih PT: semua omzet lunas dikurangi PPh Final dan semua pengeluaran (termasuk operasional tanpa proyek)
  const totalLabaBersih = computed(() => profitSummary(paidInvoices.value, totalPengeluaran.value).profit);

  // LKPM usaha kecil dilaporkan per semester (Jan–Jun, Jul–Des),
  // paling lambat tanggal 10 bulan pertama semester berikutnya.
  const lkpmSummary = computed(() => {
    const today = dateJkt();
    const year = today.slice(0, 4);
    const firstHalf = Number(today.slice(5, 7)) <= 6;
    const from = `${year}-${firstHalf ? '01' : '07'}-01`;
    const to = `${year}-${firstHalf ? '06' : '12'}-31`;
    const inPeriod = (date) => !!date && date >= from && date <= to;

    return {
      periodLabel: `Semester ${firstHalf ? 'I (Jan–Jun)' : 'II (Jul–Des)'} ${year}`,
      deadline: firstHalf ? `${year}-07-10` : `${Number(year) + 1}-01-10`,
      totalRevenue: paidInvoices.value
        .filter(inv => inPeriod(inv.paidDate))
        .reduce((sum, inv) => sum + inv.grossAmount, 0),
      totalModalKerjaRealisasi: expenses.value
        .filter(e => inPeriod(e.date))
        .reduce((sum, e) => sum + e.amount, 0)
    };
  });

  const findMilestone = (id) => milestones.value.find(m => m.id === id);

  // Tambahan kontrak pemilik termin ini, atau undefined untuk termin kontrak awal.
  // Termin lama (sebelum ada addendumId) dikenali dari judul "Tambahan: <judul>" yang dulu dibuat otomatis.
  const milestoneAddendum = (ms) => contracts.value
    .find(c => c.id === ms.contractId)?.addenda
    .find(a => a.id === ms.addendumId || (!ms.addendumId && ms.title === `Tambahan: ${a.title}`));
  const isBastPending = (milestone) => !!milestone && milestone.isBastRequired && !milestone.isBastSigned;
  // Sisa nilai yang belum dibuatkan invoice: kontrak awal (addendumId '') atau satu tambahan kontrak
  const uninvoicedValue = (contractId, addendumId = '') => {
    const contract = contracts.value.find(c => c.id === contractId);
    if (!contract) return 0;
    const value = addendumId ? contract.addenda.find(a => a.id === addendumId)?.value || 0 : contract.totalContractValue;
    const invoiced = activeInvoices.value
      .filter(i => i.contractId === contractId)
      .flatMap(i => i.lines)
      .filter(l => l.milestoneId && (milestoneAddendum(findMilestone(l.milestoneId) || {})?.id || '') === addendumId)
      .reduce((sum, l) => sum + l.amount, 0);
    return Math.max(0, value - invoiced);
  };

  const nextInvoiceNumber = (type) => nextDocNumber(invoices.value.map(i => i.invoiceNumber), 'INV', type);

  // Terbitkan invoice untuk termin (sekali saja); mengembalikan invoice yang ada atau yang baru
  const issueMilestoneInvoice = (milestone) => {
    let invoice = invoiceOfMilestone(milestone.id);
    if (!invoice) {
      const type = { downPayment: 'DP', finalSettlement: 'PEL' }[milestone.type] || 'TRM';
      invoices.value.push(new InvoiceModel({
        invoiceNumber: nextInvoiceNumber(type),
        contractId: milestone.contractId,
        milestoneId: milestone.id,
        description: milestone.bastNumber ? `${milestone.title} (BAST ${milestone.bastNumber})` : milestone.title,
        grossAmount: milestone.amount,
        taxAmount: taxOf(milestone.amount),
        status: 'sent'
      }));
      invoice = invoices.value.at(-1); // ambil versi reaktif dari array
    }
    if (milestone.status !== 'paid') milestone.status = 'invoiced';
    return invoice;
  };

  // Action: Tandai Invoice Lunas & Otomatis Hitung Pajak.
  // Ditolak jika termin wajib BAST tapi BAST belum ditandatangani.
  const markInvoiceAsPaid = (invoiceId) => {
    const invoice = invoices.value.find(inv => inv.id === invoiceId);
    if (!invoice || invoice.status === 'paid' || invoice.status === 'cancelled') return false;

    const paidMilestones = invoice.lines.map(l => findMilestone(l.milestoneId)).filter(Boolean);
    if (paidMilestones.some(isBastPending)) return false;

    invoice.status = 'paid';
    invoice.paidDate = dateJkt();
    paidMilestones.forEach(m => { m.status = 'paid'; });

    if (!taxRecords.value.some(t => t.invoiceId === invoice.id)) {
      taxRecords.value.push(new TaxRecordModel({
        invoiceId: invoice.id,
        grossIncome: invoice.grossAmount,
        taxAmount: invoice.taxAmount,
        isSettled: false
      }));
    }
    return true;
  };

  // Action: Pembayaran termin masuk. Invoice diterbitkan dulu jika belum ada,
  // supaya omzet dan PPh-nya selalu tercatat.
  const payMilestone = (milestoneId) => {
    const milestone = findMilestone(milestoneId);
    if (!milestone || isBastPending(milestone)) return false;
    return markInvoiceAsPaid(issueMilestoneInvoice(milestone).id);
  };

  // Action: Terbitkan invoice termin sebelum dibayar, supaya klien menerima nomor resmi (bukan draf).
  const issueInvoice = (milestoneId) => {
    const milestone = findMilestone(milestoneId);
    if (!milestone || isBastPending(milestone)) return null;
    return issueMilestoneInvoice(milestone);
  };

  // Invoice tambahan yang boleh digabung ulang: kontrak sama, belum dibayar/dibatalkan,
  // dan semua barisnya termin tambahan kontrak (bukan termin kontrak awal atau tagihan rutin)
  const mergeableInvoice = (contractId, inv) => !!inv && inv.contractId === contractId
    && ['sent', 'overdue', 'draft'].includes(inv.status)
    && inv.lines.every(l => l.milestoneId && milestoneAddendum(findMilestone(l.milestoneId) || {}));

  // Termin milik satu tambahan kontrak (addendumId '' = termin kontrak awal)
  const addendumMilestones = (contractId, addendumId) => milestones.value
    .filter(m => m.contractId === contractId && (milestoneAddendum(m)?.id || '') === addendumId);

  // Nilai tambahan yang belum dijadwalkan sebagai termin sama sekali
  const unscheduledValue = (contractId, addendumId) => {
    const value = contracts.value.find(c => c.id === contractId)?.addenda.find(a => a.id === addendumId)?.value || 0;
    return Math.max(0, value - addendumMilestones(contractId, addendumId).reduce((sum, m) => sum + m.amount, 0));
  };

  // Action: Satu invoice untuk beberapa tambahan kontrak.
  // lines: [{ milestoneId }] untuk termin tambahan yang sudah ada tapi belum diinvoice,
  //        atau [{ addendumId, amount }] untuk sisa yang belum dijadwalkan (dibuatkan termin baru),
  //        atau [{ invoiceId }] untuk invoice tambahan yang sudah terbit tapi belum dibayar:
  //        invoice lama dibatalkan dan semua barisnya dipindah ke invoice gabungan ini.
  // Termin wajib BAST boleh ikut ditagih; pembayarannya tetap baru bisa dicatat setelah BAST ditandatangani.
  const issueAddendaInvoice = (contractId, lines) => {
    const contract = contracts.value.find(c => c.id === contractId);
    lines = lines.filter((l, idx) => !l.invoiceId || lines.findIndex(x => x.invoiceId === l.invoiceId) === idx);
    if (!contract || !lines.length) return null;

    // Periksa semua baris dulu, supaya tidak ada termin yang terlanjur dibuat jika satu baris tidak valid
    const ok = lines.every(l => {
      if (l.invoiceId) return mergeableInvoice(contractId, invoices.value.find(i => i.id === l.invoiceId));
      if (l.milestoneId) {
        const m = findMilestone(l.milestoneId);
        return !!m && m.contractId === contractId && !!milestoneAddendum(m) && !milestoneHasInvoice(m.id) && m.status !== 'paid';
      }
      return l.amount > 0 && l.amount <= unscheduledValue(contractId, l.addendumId);
    });
    if (!ok) return null;

    const invoiceNumber = nextInvoiceNumber('TMB');
    const items = lines.flatMap(l => {
      if (l.invoiceId) {
        const old = invoices.value.find(i => i.id === l.invoiceId);
        old.status = 'cancelled';
        old.notes = `Dibatalkan, digabung ke ${invoiceNumber}.`;
        return old.lines.map(x => ({ ...x }));
      }
      if (l.milestoneId) {
        const m = findMilestone(l.milestoneId);
        m.status = 'invoiced';
        return { milestoneId: m.id, description: m.title, amount: m.amount };
      }
      const addendum = contract.addenda.find(a => a.id === l.addendumId);
      const description = `Tambahan: ${addendum.title}`;
      const milestoneId = saveRecord('milestones', {
        contractId,
        addendumId: l.addendumId,
        title: description,
        type: l.amount === unscheduledValue(contractId, l.addendumId) ? 'finalSettlement' : 'intermediateTermin',
        amount: l.amount,
        percentage: Math.round(l.amount / addendum.value * 100),
        status: 'invoiced'
      });
      return { milestoneId, description, amount: l.amount };
    });

    const gross = items.reduce((sum, x) => sum + x.amount, 0);
    invoices.value.push(new InvoiceModel({
      invoiceNumber,
      contractId,
      milestoneId: items[0].milestoneId,
      items: items.length > 1 ? items : [],
      description: items.length > 1 ? `Tambahan kontrak (${items.length} item)` : items[0].description,
      grossAmount: gross,
      taxAmount: taxOf(gross),
      status: 'sent'
    }));
    return invoices.value.at(-1);
  };

  // Invoice yang belum bisa dicatat lunas karena ada termin di dalamnya yang masih menunggu BAST
  const invoiceWaitingBast = (invoice) => invoice.lines.some(l => isBastPending(findMilestone(l.milestoneId)));

  // Action: Terbitkan BAST (nomor & tanggal dikunci sekali) supaya bisa dicetak dan ditandatangani klien.
  const issueBast = (milestoneId) => {
    const milestone = findMilestone(milestoneId);
    if (!milestone || milestone.bastNumber) return milestone;
    milestone.bastNumber = nextDocNumber(milestones.value.map(m => m.bastNumber), 'BAST', 'SLZ');
    milestone.bastDate = dateJkt();
    return milestone;
  };

  // Action: Catat BAST sudah ditandatangani klien. Status termin hanya maju, tidak pernah mundur.
  const signBast = (milestoneId) => {
    const milestone = issueBast(milestoneId);
    if (!milestone || milestone.isBastSigned) return;
    milestone.isBastSigned = true;
    issueMilestoneInvoice(milestone);
  };

  // Action: Catat setoran PPh satu masa. Satu kode billing & NTPN berlaku untuk semua pembayaran
  // yang belum disetor di bulan itu; yang sudah punya NTPN tidak diubah.
  // Jika semua pembayaran bulan itu sudah disetor, ini dipakai untuk memperbaiki salah ketik NTPN.
  const settleTaxPeriod = (year, month, billingCode, ntpn) => {
    const inPeriod = taxRecords.value.filter(t => t.periodYear === year && t.periodMonth === month);
    const unsettled = inPeriod.filter(t => !t.isSettled);
    for (const rec of unsettled.length ? unsettled : inPeriod) {
      Object.assign(rec, { billingCode, ntpn, paymentDate: rec.isSettled ? rec.paymentDate : dateJkt(), isSettled: true });
    }
  };

  // Invoice lama (sebelum ada planId) milik paket pertama kontraknya, karena dulu satu kontrak hanya punya satu paket.
  const planInvoices = (plan) => activeInvoices.value.filter(i => i.planId === plan.id
    || (!i.planId && !i.milestoneId && i.contractId === plan.contractId
      && maintenancePlans.value.find(p => p.contractId === plan.contractId)?.id === plan.id));

  // Action: Hapus invoice tagihan rutin yang belum dibayar. Disimpan sebagai 'cancelled' (bukan dihapus dari database)
  // supaya nomornya tidak dipakai ulang; setelah itu invoice bulan yang sama bisa diterbitkan lagi.
  // Invoice termin tidak lewat sini karena terikat ke status termin.
  const cancelRecurringInvoice = (invoiceId) => {
    const invoice = invoices.value.find(i => i.id === invoiceId);
    if (!invoice || invoice.milestoneId || invoice.items.length || !['sent', 'overdue', 'draft'].includes(invoice.status)) return false;
    invoice.status = 'cancelled';
    invoice.notes = `Dihapus (dibatalkan) pada ${dateJkt()}.`;
    return true;
  };

  const planIssuedThisMonth = (planId) => {
    const plan = maintenancePlans.value.find(p => p.id === planId);
    const month = dateJkt().slice(0, 7);
    return !!plan && planInvoices(plan).some(i => i.issueDate.startsWith(month));
  };

  // Action: Terbitkan tagihan rutin bulan ini (maintenance atau server), maksimal satu per paket per bulan.
  const generatePlanInvoice = (planId) => {
    const plan = maintenancePlans.value.find(p => p.id === planId);
    if (!plan || planIssuedThisMonth(planId)) return false;

    const monthLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
    const isServer = plan.kind === 'server';
    invoices.value.unshift(new InvoiceModel({
      invoiceNumber: nextInvoiceNumber(isServer ? 'SRV' : 'MNT'),
      contractId: plan.contractId,
      planId: plan.id,
      description: `${isServer ? 'Biaya server' : 'Maintenance'}: ${plan.title} (${monthLabel})`,
      grossAmount: plan.monthlyFee,
      taxAmount: taxOf(plan.monthlyFee),
      status: 'sent'
    }));
    return true;
  };

  // reactive() meng-unwrap ref/computed, jadi view cukup menulis store.invoices (tanpa .value)
  return reactive({
    clients,
    contracts,
    milestones,
    invoices,
    taxRecords,
    maintenancePlans,
    expenses,
    company,
    totalOmzetLunas,
    totalPajakTerutang,
    totalPajakTersisa,
    taxPeriods,
    totalPengeluaran,
    projectCost,
    projectProfit,
    projectUnpaid,
    unpaidInvoices,
    totalUnpaid,
    totalLabaBersih,
    recurringDue,
    lkpmSummary,
    exportData,
    importData,
    saveCompany,
    saveRecord,
    deleteRecord,
    deleteBlocker,
    milestoneHasInvoice,
    invoiceOfMilestone,
    issueAddendaInvoice,
    addendumMilestones,
    unscheduledValue,
    invoiceWaitingBast,
    mergeableInvoice,
    isBastPending,
    milestoneAddendum,
    uninvoicedValue,
    planIssuedThisMonth,
    cancelRecurringInvoice,
    markInvoiceAsPaid,
    payMilestone,
    issueInvoice,
    issueBast,
    signBast,
    settleTaxPeriod,
    generatePlanInvoice
  });
};
