// Koneksi Firebase untuk portal. Nilai diambil dari .env.local (lihat .env.example).
// Config web Firebase memang bukan rahasia; yang menjaga data adalah firestore.rules.
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// false = .env.local belum diisi; portal bisa menampilkan pesan, bukan error kosong
export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

export const app = firebaseConfigured ? initializeApp(config) : null;
export const auth = app && getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Cache offline: portal tetap bisa dibuka saat sinyal jelek, perubahan dikirim saat online lagi
export const db = app && initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

// Nama koleksi Firestore. Harus sama dengan daftar di firestore.rules.
export const COLLECTIONS = {
  clients: 'clients',
  contracts: 'contracts',
  milestones: 'milestones',
  invoices: 'invoices',
  taxRecords: 'taxRecords',
  maintenancePlans: 'maintenancePlans',
  expenses: 'expenses',
  settings: 'settings' // satu dokumen: settings/company
};
