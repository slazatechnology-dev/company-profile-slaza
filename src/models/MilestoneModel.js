/**
 * Model representasi Tahapan / Termin Pembayaran
 */
export class MilestoneModel {
  constructor({
    id = '',
    contractId = '',
    addendumId = '', // termin untuk tambahan kontrak (contract.addenda[].id); kosong = termin kontrak awal
    title = '',
    type = 'downPayment', // 'downPayment' | 'intermediateTermin' | 'finalSettlement' | 'recurringMaintenance'
    percentage = 50,
    amount = 0,
    status = 'pending', // 'pending' | 'readyToInvoice' | 'invoiced' | 'paid'
    dueDate = '',
    isBastRequired = false,
    isBastSigned = false,
    bastNumber = '',
    bastDate = ''
  } = {}) {
    this.id = id || `milestone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.contractId = contractId;
    this.addendumId = addendumId;
    this.title = title;
    this.type = type;
    this.percentage = Number(percentage) || 0;
    this.amount = Number(amount) || 0;
    this.status = status;
    this.dueDate = dueDate;
    this.isBastRequired = Boolean(isBastRequired);
    this.isBastSigned = Boolean(isBastSigned);
    this.bastNumber = bastNumber;
    this.bastDate = bastDate;
  }

  static fromJson(json) {
    if (!json) return new MilestoneModel();
    return new MilestoneModel(json);
  }

  toJson() {
    return {
      id: this.id,
      contractId: this.contractId,
      addendumId: this.addendumId,
      title: this.title,
      type: this.type,
      percentage: this.percentage,
      amount: this.amount,
      status: this.status,
      dueDate: this.dueDate,
      isBastRequired: this.isBastRequired,
      isBastSigned: this.isBastSigned,
      bastNumber: this.bastNumber,
      bastDate: this.bastDate
    };
  }
}
