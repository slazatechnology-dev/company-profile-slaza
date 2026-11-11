# PT. Slaza Technology Mandiri: Company Profile & Portal Kepatuhan

Website company profile (Vue 3 + Vite) dan portal internal di `#portal` untuk termin proyek, BAST, invoice, PPh Final 0,5% (PP 55/2022), LKPM, dan biaya operasional.

```sh
npm install
npm run dev     # server lokal
npm run build   # build produksi ke dist/
npm test        # test helper keuangan (node --test)
```

## Portal

- Buka lewat `/#portal`. Tidak ada tautan dari website publik, dan kode portal + Firebase hanya dimuat saat portal dibuka.
- Login dengan Google. Data tersimpan di Firestore (`company-slazatech`, lokasi asia-southeast2) dan hanya bisa dibaca/ditulis oleh UID pemilik di `firestore.rules`.
- Isi NIB, NPWP, rekening bank, dan tahun PT terdaftar di menu **Data PT**. Invoice baru bisa dicetak setelah rekening diisi.
- Store (`src/composables/useComplianceStore.js`) hanya mengubah data di memori; `src/composables/firestoreSync.js` menulis dokumen yang berubah ke Firestore dalam satu batch per aksi dan membaca perubahan secara realtime.
- Keluar dari portal juga menghapus cache offline Firestore di browser tersebut.
- Unduh backup JSON berkala dari Ringkasan sebagai cadangan di luar Firebase.

## Firebase

Config web app ada di `.env.local` (contoh: `.env.example`). Setelah `.env.local` berubah, jalankan ulang `npm run dev`.

Pemilik pertama kali:

1. Buka `/#portal`, masuk dengan Google. Portal menampilkan "Akun ini belum punya akses" beserta UID.
2. Ganti `OWNER_UID` di `firestore.rules` dengan UID tersebut.
3. `npx firebase-tools deploy --only firestore:rules`, lalu muat ulang portal.

Sebelum dipasang di domain sendiri, tambahkan domainnya di Authentication > Settings > Authorized domains.

### Struktur Firestore

Satu koleksi per jenis data, satu dokumen per baris. ID dokumen = `id` data. Relasi disimpan sebagai ID (string), tanggal bisnis sebagai string `YYYY-MM-DD` (WIB) agar tidak bergeser karena zona waktu, uang dalam rupiah bulat (number).

| Koleksi | Field |
|---|---|
| `clients` | type (`company` / `individual`), companyName (nama lengkap jika perorangan), picName, email, phone, npwp, address |
| `contracts` | clientId, projectTitle, projectType, totalContractValue, status, startDate, endDate, scopeOfWork (array string), addenda (array { id, title, value, date, description }: tambahan nilai kontrak; total = totalContractValue + jumlah addenda) |
| `milestones` | contractId, addendumId (kosong = termin kontrak awal), title, type, percentage, amount, status, dueDate, isBastRequired, isBastSigned, bastNumber, bastDate |
| `invoices` | invoiceNumber, contractId, milestoneId, items (invoice gabungan: [{ milestoneId, description, amount }]), planId (tagihan rutin), description, grossAmount, taxRate, taxAmount, status, issueDate, dueDate, paidDate, notes |
| `taxRecords` | invoiceId, periodMonth, periodYear, grossIncome, taxRate, taxAmount, billingCode, ntpn, paymentDate, isSettled |
| `maintenancePlans` | contractId, kind (`maintenance` / `server`), title, monthlyFee, billingDayOfMonth, isActive, startDate, slaDetails |
| `expenses` | contractId (kosong = operasional PT), category, description, amount, date, vendor, receiptNote, repeat (kosong = sekali bayar, `monthly`, `yearly`), seriesId (id entri pertama biaya rutin) |
| `settings/company` | nib, npwp, bankName, bankAccount, bankHolder (kosong = atas nama PT), registeredYear |
