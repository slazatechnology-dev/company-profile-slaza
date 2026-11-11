import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateJkt, nextDocNumber, taxOf, taxDeadline, formatDate, milestoneSteps, dueRecurring, profitSummary, invoiceDueDate, unpaidByClient, taxByPeriod } from './finance.js';

test('taxDeadline tanggal 15 bulan berikutnya, Desember pindah tahun', () => {
  assert.equal(taxDeadline(10, 2026), '2026-11-15');
  assert.equal(taxDeadline(12, 2026), '2027-01-15');
});

test('formatDate tidak bergeser zona waktu', () => {
  assert.equal(formatDate('2026-01-01'), '1 Jan 2026');
  assert.equal(formatDate(''), '-');
});

test('dateJkt pakai WIB, bukan UTC', () => {
  // 31 Okt 2026 18:30 UTC = 1 Nov 2026 01:30 WIB
  assert.equal(dateJkt(new Date('2026-10-31T18:30:00Z')), '2026-11-01');
});

test('nextDocNumber berurutan per tahun dan tahan nomor lama', () => {
  const existing = ['INV/2026/DP-001', 'INV/2026/PEL-002', 'INV/2025/MNT-009', '', undefined];
  assert.equal(nextDocNumber(existing, 'INV', 'MNT', '2026-05-01'), 'INV/2026/MNT-003');
  assert.equal(nextDocNumber(existing, 'INV', 'DP', '2027-01-02'), 'INV/2027/DP-001');
  assert.equal(nextDocNumber([], 'BAST', 'SLZ', '2026-05-01'), 'BAST/2026/SLZ-001');
});

test('taxOf membulatkan ke rupiah', () => {
  assert.equal(taxOf(2500000), 12500);
  assert.equal(taxOf(333333), 1667);
});

test('milestoneSteps menunjuk satu langkah berikutnya', () => {
  assert.equal(milestoneSteps({ isBastRequired: true }, false).next, 'issueBast');
  assert.equal(milestoneSteps({ isBastRequired: true, bastNumber: 'B1' }, false).next, 'signBast');
  assert.equal(milestoneSteps({ isBastRequired: true, bastNumber: 'B1', isBastSigned: true }, true).next, 'pay');
  assert.equal(milestoneSteps({ isBastRequired: false }, false).next, 'issueInvoice');
  assert.equal(milestoneSteps({ isBastRequired: false }, true).next, 'pay');
  assert.equal(milestoneSteps({ isBastRequired: false, status: 'paid' }, false).next, null);
});

test('dueRecurring: hanya entri terakhir seri yang masih berulang dan sudah lewat periodenya', () => {
  const server = { id: 's1', repeat: 'monthly', date: '2026-10-05' };
  const serverNov = { id: 's2', seriesId: 's1', repeat: 'monthly', date: '2026-11-05' };
  const domain = { id: 'd1', repeat: 'yearly', date: '2026-02-01' };
  const stopped = { id: 'x1', repeat: '', date: '2026-01-01' };
  assert.deepEqual(dueRecurring([server, domain, stopped], '2026-11-01').map(e => e.id), ['s1']);
  assert.deepEqual(dueRecurring([server, serverNov, domain], '2026-11-20').map(e => e.id), []);
  assert.deepEqual(dueRecurring([server, serverNov, domain], '2027-02-01').map(e => e.id), ['s2', 'd1']);
});

test('profitSummary: laba = diterima - PPh - biaya; perkiraan ikut maintenance yang dibayar', () => {
  const paid = [
    { milestoneId: 'm1', grossAmount: 30_000_000, taxAmount: 150_000 },
    { milestoneId: '', grossAmount: 2_000_000, taxAmount: 10_000 }
  ];
  const r = profitSummary(paid, 5_000_000, 100_000_000);
  assert.equal(r.received, 32_000_000);
  assert.equal(r.profit, 32_000_000 - 160_000 - 5_000_000);
  assert.equal(r.projected, 102_000_000 - 510_000 - 5_000_000);
  assert.equal(profitSummary([], 1_000).profit, -1_000);
});

test('invoiceDueDate: pakai dueDate, atau 14 hari setelah terbit (lintas bulan)', () => {
  assert.equal(invoiceDueDate({ dueDate: '2026-12-01', issueDate: '2026-11-01' }), '2026-12-01');
  assert.equal(invoiceDueDate({ dueDate: '', issueDate: '2026-11-25' }), '2026-12-09');
});

test('unpaidByClient: invoice belum lunas + sisa kontrak belum ditagih', () => {
  const inv = [
    { milestoneId: 'm1', grossAmount: 30, status: 'paid' },
    { milestoneId: 'm2', grossAmount: 40, status: 'sent' },
    { milestoneId: '', grossAmount: 5, status: 'sent' } // tagihan rutin: belum dibayar, tapi bukan bagian nilai kontrak
  ];
  assert.equal(unpaidByClient(inv, 120), 45 + 50);
  assert.equal(unpaidByClient(inv, 50), 45);
});

test('taxByPeriod: satu setoran per bulan dari total omzet; proyek 3 bulan jadi 3 masa', () => {
  const rec = (y, m, gross, extra = {}) => ({ periodYear: y, periodMonth: m, grossIncome: gross, isSettled: false, ntpn: '', ...extra });
  const periods = taxByPeriod([
    rec(2026, 9, 30_000_000),                  // DP proyek
    rec(2026, 10, 40_000_000),                 // termin 2
    rec(2026, 11, 30_000_000),                 // pelunasan
    rec(2026, 11, 100_000),                    // maintenance di bulan yang sama
    rec(2026, 11, 150, { isSettled: true, ntpn: 'A1' })
  ]);
  assert.deepEqual(periods.map(p => p.key), ['2026-11', '2026-10', '2026-09']);
  const nov = periods[0];
  assert.equal(nov.gross, 30_100_150);
  assert.equal(nov.tax, taxOf(30_100_150));      // 0,5% dari total sebulan, bukan per invoice
  assert.equal(nov.due, taxOf(30_100_000));      // yang sudah ber-NTPN tidak ditagih lagi
  assert.equal(nov.settled, false);
  assert.equal(nov.deadline, '2026-12-15');
  assert.deepEqual(nov.ntpns, ['A1']);
  assert.equal(periods[2].due, 150_000);         // DP 30 juta -> Rp150.000
});
