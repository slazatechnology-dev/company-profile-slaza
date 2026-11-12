import { dateJkt } from '../utils/finance.js';

/**
 * Model representasi Perjanjian Kerja / Kontrak Proyek
 */
export class ContractModel {
  constructor({
    id = '',
    clientId = '',
    projectTitle = '',
    projectType = 'integratedSoftwareAndIot', // 'softwareOnly' | 'iotHardwareOnly' | 'integratedSoftwareAndIot'
    totalContractValue = 0,
    status = 'signed', // 'draft' | 'sent' | 'signed' | 'inProgress' | 'completed'
    startDate = dateJkt(),
    endDate = '',
    scopeOfWork = [],
    addenda = [] // tambahan nilai (fitur baru dll): [{ id, title, value, date, description, isReimbursement }]
  } = {}) {
    this.id = id || `contract_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.clientId = clientId;
    this.projectTitle = projectTitle;
    this.projectType = projectType;
    this.totalContractValue = Number(totalContractValue) || 0;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
    this.scopeOfWork = Array.isArray(scopeOfWork) ? scopeOfWork : [];
    this.addenda = Array.isArray(addenda)
      ? addenda.map(a => ({ id: a.id || `add_${Date.now()}`, title: a.title || '', value: Number(a.value) || 0, date: a.date || '', description: a.description || '', isReimbursement: Boolean(a.isReimbursement) }))
      : [];
  }

  // Nilai kontrak awal + semua tambahan. Dipakai untuk persentase termin dan perhitungan laba.
  get totalValue() {
    return this.totalContractValue + this.addenda.reduce((sum, a) => sum + a.value, 0);
  }

  static fromJson(json) {
    if (!json) return new ContractModel();
    return new ContractModel(json);
  }

  toJson() {
    return {
      id: this.id,
      clientId: this.clientId,
      projectTitle: this.projectTitle,
      projectType: this.projectType,
      totalContractValue: this.totalContractValue,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      scopeOfWork: this.scopeOfWork,
      addenda: this.addenda
    };
  }
}
