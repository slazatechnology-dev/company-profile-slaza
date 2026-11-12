import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useComplianceStore } from './useComplianceStore.js';

const setup = () => {
  const s = useComplianceStore();
  s.saveRecord('contracts', { id: 'c1', totalContractValue: 10_000_000 });
  return s;
};

test('termin talangan: tanpa PPh, bukan omzet, tapi tetap tercatat sebagai uang masuk', () => {
  const s = setup();
  const id = s.saveRecord('milestones', { contractId: 'c1', title: 'Domain', amount: 200_000, isReimbursement: true });
  const inv = s.issueInvoice(id);
  assert.equal(inv.taxAmount, 0);
  assert.equal(s.markInvoiceAsPaid(inv.id), true);
  assert.equal(s.taxRecords.length, 0);
  assert.equal(s.totalOmzetLunas, 0);
  assert.equal(s.projectProfit('c1').received, 200_000);
});

test('invoice sudah lunas lalu ditandai talangan: catatan PPh yang belum disetor dihapus; dibatalkan: muncul lagi', () => {
  const s = setup();
  const id = s.saveRecord('milestones', { contractId: 'c1', title: 'Domain', amount: 200_000 });
  const inv = s.issueInvoice(id);
  s.markInvoiceAsPaid(inv.id);
  assert.equal(s.taxRecords[0].taxAmount, 1_000);

  s.saveRecord('milestones', { ...s.milestones[0].toJson(), isReimbursement: true });
  assert.equal(s.refreshMilestoneTax(id), '');
  assert.equal(s.taxRecords.length, 0);
  assert.equal(inv.taxAmount, 0);

  s.saveRecord('milestones', { ...s.milestones[0].toJson(), isReimbursement: false });
  s.refreshMilestoneTax(id);
  assert.equal(s.taxRecords.length, 1);
  assert.equal(s.taxRecords[0].grossIncome, 200_000);
});

test('PPh yang sudah disetor (ber-NTPN) tidak diubah diam-diam', () => {
  const s = setup();
  const id = s.saveRecord('milestones', { contractId: 'c1', title: 'Domain', amount: 200_000 });
  const inv = s.issueInvoice(id);
  s.markInvoiceAsPaid(inv.id);
  const rec = s.taxRecords[0];
  s.settleTaxPeriod(rec.periodYear, rec.periodMonth, '', 'ABCDEFGH12345678');
  s.saveRecord('milestones', { ...s.milestones[0].toJson(), isReimbursement: true });
  assert.match(s.refreshMilestoneTax(id), /sudah disetor/);
  assert.equal(s.taxRecords.length, 1);
});

test('invoice gabungan: hanya baris talangan yang bebas PPh', () => {
  const s = setup();
  s.saveRecord('contracts', { id: 'c1', totalContractValue: 0, addenda: [
    { id: 'a1', title: 'Fitur', value: 1_000_000, date: '2026-11-01' },
    { id: 'a2', title: 'Domain', value: 200_000, date: '2026-11-01', isReimbursement: true }
  ] });
  const inv = s.issueAddendaInvoice('c1', [{ addendumId: 'a1', amount: 1_000_000 }, { addendumId: 'a2', amount: 200_000 }]);
  assert.equal(inv.reimbursedAmount, 200_000);
  assert.equal(inv.taxAmount, 5_000);
  s.markInvoiceAsPaid(inv.id);
  assert.equal(s.taxRecords[0].grossIncome, 1_000_000);
  assert.equal(s.totalOmzetLunas, 1_000_000);
});

test('tandai talangan dari menu Pajak: invoice lunas, PPh belum disetor ikut hilang', () => {
  const s = setup();
  const id = s.saveRecord('milestones', { contractId: 'c1', title: 'Tambahan: Domain', amount: 200_000 });
  const inv = s.issueInvoice(id);
  s.markInvoiceAsPaid(inv.id);
  assert.equal(s.taxRecords.length, 1);
  assert.equal(s.markInvoiceReimbursement(inv.id), '');
  assert.equal(s.taxRecords.length, 0);
  assert.equal(s.milestones[0].isReimbursement, true);
  assert.equal(s.totalOmzetLunas, 0);
});
