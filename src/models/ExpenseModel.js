import { dateJkt } from '../utils/finance.js';

/**
 * Model representasi Pengeluaran Operasional & Komponen IoT
 */
export class ExpenseModel {
  constructor({
    id = '',
    category = 'iotHardwareAndPrototyping', // 'teamAndFreelancer' | 'cloudAndInfrastructure' | 'iotHardwareAndPrototyping' | 'officeAndTools' | 'taxesAndStamps' | 'otherOperational'
    contractId = '', // '' = operasional PT umum, bukan biaya proyek tertentu
    repeat = '', // '' | 'monthly' | 'yearly': biaya rutin (server, domain, langganan)
    seriesId = '', // entri pertama biaya rutin; '' = entri ini sendiri yang pertama
    description = '',
    amount = 0,
    date = dateJkt(),
    vendor = '',
    receiptNote = ''
  } = {}) {
    this.id = id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.category = category;
    this.contractId = contractId;
    this.repeat = ['monthly', 'yearly'].includes(repeat) ? repeat : '';
    this.seriesId = seriesId;
    this.description = description;
    this.amount = Number(amount) || 0;
    this.date = date;
    this.vendor = vendor;
    this.receiptNote = receiptNote;
  }

  static fromJson(json) {
    if (!json) return new ExpenseModel();
    return new ExpenseModel(json);
  }

  toJson() {
    return {
      id: this.id,
      category: this.category,
      contractId: this.contractId,
      repeat: this.repeat,
      seriesId: this.seriesId,
      description: this.description,
      amount: this.amount,
      date: this.date,
      vendor: this.vendor,
      receiptNote: this.receiptNote
    };
  }
}
