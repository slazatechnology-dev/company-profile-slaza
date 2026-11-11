import { dateJkt } from '../utils/finance.js';

/**
 * Model representasi Perjanjian Maintenance / Retainer Rutin Bulanan
 */
export class MaintenancePlanModel {
  constructor({
    id = '',
    contractId = '',
    kind = 'maintenance', // 'maintenance' | 'server': menentukan prefiks nomor invoice (MNT / SRV)
    title = 'Pemeliharaan Server Cloud & Monitoring IoT',
    monthlyFee = 500000,
    billingDayOfMonth = 1,
    isActive = true,
    startDate = dateJkt(),
    slaDetails = 'Monitoring uptime 99%, perbaikan bug prioritas, kuota broker MQTT'
  } = {}) {
    this.id = id || `maint_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.contractId = contractId;
    this.kind = kind === 'server' ? 'server' : 'maintenance';
    this.title = title;
    this.monthlyFee = Number(monthlyFee) || 0;
    this.billingDayOfMonth = Number(billingDayOfMonth) || 1;
    this.isActive = Boolean(isActive);
    this.startDate = startDate;
    this.slaDetails = slaDetails;
  }

  static fromJson(json) {
    if (!json) return new MaintenancePlanModel();
    return new MaintenancePlanModel(json);
  }

  toJson() {
    return {
      id: this.id,
      contractId: this.contractId,
      kind: this.kind,
      title: this.title,
      monthlyFee: this.monthlyFee,
      billingDayOfMonth: this.billingDayOfMonth,
      isActive: this.isActive,
      startDate: this.startDate,
      slaDetails: this.slaDetails
    };
  }
}
