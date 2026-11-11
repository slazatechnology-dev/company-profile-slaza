// Sinkronisasi store portal <-> Firestore. Satu koleksi per jenis data, satu dokumen per baris,
// data PT di settings/company. Store tetap mengubah data di memori seperti biasa; modul ini
// membandingkan isi store dengan isi Firestore terakhir dan hanya menulis dokumen yang berubah.
import { watch } from 'vue';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { MODELS, EMPTY_COMPANY } from './useComplianceStore.js';

const COMPANY_PATH = 'settings/company';
const BATCH_LIMIT = 500; // batas operasi per batch Firestore

// Store -> { 'clients/<id>': '<json tanpa id>', ..., 'settings/company': '<json>' }
// ponytail: serialisasi seluruh data tiap ada perubahan; cukup untuk ribuan baris, pecah per koleksi jika lambat.
export const flattenStore = (store, kinds = Object.keys(MODELS)) => {
  const out = {};
  for (const kind of kinds) {
    for (const item of store[kind]) {
      const { id, ...data } = item.toJson();
      out[`${kind}/${id}`] = JSON.stringify(data);
    }
  }
  if (kinds.length === Object.keys(MODELS).length) out[COMPANY_PATH] = JSON.stringify(store.company);
  return out;
};

// Daftar tulis yang membuat Firestore sama dengan store.
// Hanya menghapus dokumen yang memang pernah dimuat, jadi data yang belum terbaca tidak ikut terhapus.
export const diffWrites = (before, after) => {
  const ops = [];
  for (const path in after) if (before[path] !== after[path]) ops.push({ path, data: JSON.parse(after[path]) });
  for (const path in before) if (!(path in after)) ops.push({ path, delete: true });
  return ops;
};

// Mulai sinkronisasi. status: reactive { ready, error, saveError }. Mengembalikan fungsi untuk berhenti.
export const syncWithFirestore = (store, db, status) => {
  let synced = {}; // isi Firestore terakhir yang diketahui, dalam bentuk flattenStore
  const waiting = new Set([...Object.keys(MODELS), COMPANY_PATH]);
  let stopWatch = null;

  const onError = (err) => { status.error = err.code || err.message; };

  // Perubahan di store -> batch write. Satu aksi (mis. catat pelunasan) = satu batch, jadi tidak tersimpan setengah.
  const startWatch = () => {
    stopWatch = watch(() => flattenStore(store), (now) => {
      const ops = diffWrites(synced, now);
      synced = now;
      for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        for (const op of ops.slice(i, i + BATCH_LIMIT)) {
          if (op.delete) batch.delete(doc(db, op.path));
          else batch.set(doc(db, op.path), op.data);
        }
        batch.commit()
          .then(() => { status.saveError = ''; })
          .catch((err) => { status.saveError = err.code || err.message; });
      }
    });
  };

  const loaded = (key) => {
    waiting.delete(key);
    if (!waiting.size && !status.ready) {
      status.ready = true;
      startWatch();
    }
  };

  // Firestore -> store. synced dihitung ulang dari store supaya urutan field tidak dianggap perubahan.
  const unsubs = Object.entries(MODELS).map(([kind, Model]) =>
    onSnapshot(collection(db, kind), (snap) => {
      store[kind] = snap.docs.map(d => Model.fromJson({ ...d.data(), id: d.id }));
      for (const path in synced) if (path.startsWith(`${kind}/`)) delete synced[path];
      Object.assign(synced, flattenStore(store, [kind]));
      loaded(kind);
    }, onError)
  );

  unsubs.push(onSnapshot(doc(db, COMPANY_PATH), (snap) => {
    store.company = { ...EMPTY_COMPANY, ...snap.data() };
    synced[COMPANY_PATH] = JSON.stringify(store.company);
    loaded(COMPANY_PATH);
  }, onError));

  return () => {
    stopWatch?.();
    unsubs.forEach(unsub => unsub());
  };
};
