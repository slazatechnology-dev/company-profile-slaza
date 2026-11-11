import { TAX_RATE, dateJkt } from '../utils/finance.js';

/**
 * Model representasi Catatan Setoran Pajak PPh Final (0.5%)
 */
export class TaxRecordModel {
  constructor({
    id = '',
    invoiceId = '',
    periodMonth = Number(dateJkt().slice(5, 7)),
    periodYear = Number(dateJkt().slice(0, 4)),
    grossIncome = 0,
    taxRate = TAX_RATE,
    taxAmount = 0,
    billingCode = '',
    ntpn = '',
    paymentDate = '',
    isSettled = false
  } = {}) {
    this.id = id || `tax_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.invoiceId = invoiceId;
    this.periodMonth = Number(periodMonth);
    this.periodYear = Number(periodYear);
    this.grossIncome = Number(grossIncome) || 0;
    this.taxRate = Number(taxRate) || TAX_RATE;
    this.taxAmount = Number(taxAmount) || Math.round(this.grossIncome * this.taxRate);
    this.billingCode = billingCode;
    this.ntpn = ntpn;
    this.paymentDate = paymentDate;
    this.isSettled = Boolean(isSettled);
  }

  static fromJson(json) {
    if (!json) return new TaxRecordModel();
    return new TaxRecordModel(json);
  }

  toJson() {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      periodMonth: this.periodMonth,
      periodYear: this.periodYear,
      grossIncome: this.grossIncome,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      billingCode: this.billingCode,
      ntpn: this.ntpn,
      paymentDate: this.paymentDate,
      isSettled: this.isSettled
    };
  }
}
