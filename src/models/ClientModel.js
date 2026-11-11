/**
 * Model representasi entitas Klien
 */
export class ClientModel {
  // type: 'company' | 'individual'. Untuk perorangan, nama lengkapnya disimpan di companyName dan picName kosong.
  constructor({
    id = '',
    type = 'company',
    companyName = '',
    picName = '',
    email = '',
    phone = '',
    npwp = '',
    address = ''
  } = {}) {
    this.id = id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.type = type === 'individual' ? 'individual' : 'company';
    this.companyName = companyName;
    this.picName = picName;
    this.email = email;
    this.phone = phone;
    this.npwp = npwp;
    this.address = address;
  }

  static fromJson(json) {
    if (!json) return new ClientModel();
    return new ClientModel(json);
  }

  toJson() {
    return {
      id: this.id,
      type: this.type,
      companyName: this.companyName,
      picName: this.picName,
      email: this.email,
      phone: this.phone,
      npwp: this.npwp,
      address: this.address
    };
  }
}
