import { TAX_RATE, dateJkt } from '../utils/finance.js';

/**
 * Model representasi Faktur / Invoice Komersial
 */
export class InvoiceModel {
  constructor({
    id = '',
    invoiceNumber = '',
    contractId = '',
    milestoneId = '',
    items = [], // invoice gabungan: [{ milestoneId, description, amount }]; kosong = satu baris (description, grossAmount)
    planId = '', // tagihan rutin (maintenance / server); kosong untuk invoice termin
    description = '',
    grossAmount = 0,
    taxRate = TAX_RATE,
    taxAmount = null, // null = hitung 0,5% dari grossAmount; 0 berarti memang tidak kena PPh (talangan)
    reimbursedAmount = 0, // bagian penggantian biaya (talangan): bukan omzet, tidak kena PPh
    status = 'sent', // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' (digabung ke invoice lain, lihat notes)
    issueDate = dateJkt(),
    dueDate = '',
    paidDate = '',
    notes = 'Berdasarkan PP No. 55 Tahun 2022, PT. Slaza Technology Mandiri dikenakan PPh Final 0,5% (bukan pemotongan PPh Pasal 23).'
  } = {}) {
    this.id = id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.invoiceNumber = invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.contractId = contractId;
    this.milestoneId = milestoneId;
    this.planId = planId;
    this.items = Array.isArray(items)
      ? items.map(x => ({ milestoneId: x.milestoneId || '', description: x.description || '', amount: Number(x.amount) || 0 }))
      : [];
    this.description = description;
    this.grossAmount = Number(grossAmount) || 0;
    this.taxRate = Number(taxRate) || TAX_RATE;
    this.taxAmount = taxAmount === null || taxAmount === undefined || taxAmount === ''
      ? Math.round(this.grossAmount * this.taxRate)
      : Number(taxAmount) || 0;
    this.reimbursedAmount = Number(reimbursedAmount) || 0;
    this.status = status;
    this.issueDate = issueDate;
    this.dueDate = dueDate;
    this.paidDate = paidDate;
    this.notes = notes;
  }

  // Baris invoice: rincian invoice gabungan, atau satu baris untuk invoice biasa
  get lines() {
    return this.items.length
      ? this.items
      : [{ milestoneId: this.milestoneId, description: this.description, amount: this.grossAmount }];
  }

  static fromJson(json) {
    if (!json) return new InvoiceModel();
    return new InvoiceModel(json);
  }

  toJson() {
    return {
      id: this.id,
      invoiceNumber: this.invoiceNumber,
      contractId: this.contractId,
      milestoneId: this.milestoneId,
      planId: this.planId,
      items: this.items,
      description: this.description,
      grossAmount: this.grossAmount,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      reimbursedAmount: this.reimbursedAmount,
      status: this.status,
      issueDate: this.issueDate,
      dueDate: this.dueDate,
      paidDate: this.paidDate,
      notes: this.notes
    };
  }
}
