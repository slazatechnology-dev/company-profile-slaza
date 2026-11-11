<template>
  <div class="portal-root">
    <PortalHeader
      :active-tab="activeTab"
      :user-email="user?.email || ''"
      :show-tabs="!!store && sync.ready && !sync.error"
      @update:active-tab="activeTab = $event"
      @exit-portal="$emit('exit')"
      @sign-out="logOut"
    />

    <main class="container portal-body">
      <section v-if="!firebaseConfigured" class="panel gate-panel" aria-labelledby="gate-title">
        <h2 id="gate-title" class="panel-title">Firebase belum dikonfigurasi</h2>
        <p class="panel-desc">Isi config web app Firebase di <code>.env.local</code> (contoh di <code>.env.example</code>), lalu jalankan ulang server.</p>
      </section>

      <p v-else-if="!authChecked" class="loading" role="status">Memeriksa login...</p>

      <section v-else-if="!user" class="panel gate-panel" aria-labelledby="gate-title">
        <h2 id="gate-title" class="panel-title">Masuk ke portal</h2>
        <p class="panel-desc">Portal ini hanya untuk pemilik PT. Akun lain bisa masuk, tapi tidak bisa melihat data apa pun.</p>
        <button type="button" class="btn btn-primary gate-btn" :disabled="signingIn" @click="logIn">
          {{ signingIn ? 'Membuka jendela Google...' : 'Masuk dengan Google' }}
        </button>
        <p v-if="authError" class="gate-error text-block" role="alert">{{ authError }}</p>
      </section>

      <!-- Login pertama kali selalu sampai di sini: UID ini yang dimasukkan ke firestore.rules -->
      <section v-else-if="sync.error === 'permission-denied'" class="panel gate-panel" aria-labelledby="gate-title">
        <h2 id="gate-title" class="panel-title">Akun ini belum punya akses</h2>
        <p class="panel-desc">
          Kamu masuk sebagai <strong>{{ user.email }}</strong>. Jika ini akun pemilik PT, daftarkan UID berikut di <code>firestore.rules</code> sebagai pengganti <code>OWNER_UID</code>, lalu deploy ulang rules.
        </p>
        <div class="uid-row">
          <p class="mono uid">{{ user.uid }}</p>
          <button type="button" class="btn btn-secondary btn-sm" @click="copyUid">Salin UID</button>
        </div>
        <p class="copy-status" role="status">{{ copyStatus }}</p>
        <p class="panel-desc">Deploy: <code>npx firebase-tools deploy --only firestore:rules</code>. Setelah itu muat ulang halaman ini.</p>
      </section>

      <section v-else-if="sync.error" class="panel gate-panel" aria-labelledby="gate-title">
        <h2 id="gate-title" class="panel-title">Data portal gagal dimuat</h2>
        <p class="panel-desc">Firestore menolak permintaan ({{ sync.error }}). Periksa koneksi, lalu muat ulang halaman.</p>
      </section>

      <p v-else-if="!sync.ready" class="loading" role="status">Memuat data dari Firestore...</p>

      <template v-else>
        <p v-if="sync.saveError" class="save-error" role="alert">
          Perubahan terakhir gagal disimpan ({{ sync.saveError }}) dan dibatalkan. Tampilan sudah kembali ke isi Firestore.
        </p>

        <PortalDashboard v-if="activeTab === 'dashboard'" :store="store" @navigate="activeTab = $event" />
        <ProjectLifecycleView v-else-if="activeTab === 'projects'" :store="store" />
        <ClientsView v-else-if="activeTab === 'clients'" :store="store" />
        <TaxComplianceView v-else-if="activeTab === 'taxes'" :store="store" />
        <LkpmExportView v-else-if="activeTab === 'lkpm'" :store="store" />
        <ExpenseLedgerView v-else-if="activeTab === 'expenses'" :store="store" />
        <CompanyView v-else-if="activeTab === 'company'" :store="store" />
      </template>
    </main>

    <!-- Satu dialog konfirmasi untuk seluruh portal (lihat composables/useConfirm.js) -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onUnmounted } from 'vue';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfigured, auth, db, googleProvider } from '../../firebase';
import { useComplianceStore } from '../../composables/useComplianceStore';
import { syncWithFirestore } from '../../composables/firestoreSync';
import PortalHeader from './PortalHeader.vue';
import PortalDashboard from './PortalDashboard.vue';
import ProjectLifecycleView from './ProjectLifecycleView.vue';
import ClientsView from './ClientsView.vue';
import TaxComplianceView from './TaxComplianceView.vue';
import LkpmExportView from './LkpmExportView.vue';
import ExpenseLedgerView from './ExpenseLedgerView.vue';
import CompanyView from './CompanyView.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import './portal.css';

defineEmits(['exit']);

const activeTab = ref('dashboard');
const user = shallowRef(null);
const authChecked = ref(false);
const store = shallowRef(null);
const sync = reactive({ ready: false, error: '', saveError: '' });
let stopSync = null;

const stop = () => {
  stopSync?.();
  stopSync = null;
  store.value = null;
  Object.assign(sync, { ready: false, error: '', saveError: '' });
};

// Store dibuat per sesi login, jadi data akun sebelumnya tidak tersisa di memori
const unsubAuth = firebaseConfigured && onAuthStateChanged(auth, (u) => {
  stop();
  user.value = u;
  authChecked.value = true;
  if (u) {
    store.value = useComplianceStore();
    stopSync = syncWithFirestore(store.value, db, sync);
  }
});

onUnmounted(() => {
  stop();
  if (unsubAuth) unsubAuth();
});

const signingIn = ref(false);
const authError = ref('');

const logIn = async () => {
  signingIn.value = true;
  authError.value = '';
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked') return signInWithRedirect(auth, googleProvider);
    if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
      authError.value = `Gagal masuk (${err.code || err.message}). Coba lagi.`;
    }
  } finally {
    signingIn.value = false;
  }
};

// Hapus juga cache offline Firestore, supaya data PT tidak tertinggal di browser ini setelah keluar
const logOut = async () => {
  stop();
  await signOut(auth);
  await terminate(db);
  await clearIndexedDbPersistence(db).catch(() => {});
  location.reload();
};

const copyStatus = ref('');
const copyUid = async () => {
  try {
    await navigator.clipboard.writeText(user.value.uid);
    copyStatus.value = 'UID disalin.';
  } catch {
    copyStatus.value = 'Gagal menyalin. Pilih teks UID di atas lalu salin manual.';
  }
};
</script>

<style scoped>
.portal-root {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.portal-body {
  padding-top: 32px;
  padding-bottom: 64px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gate-panel {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gate-btn {
  align-self: flex-start;
  min-height: 44px;
}

.gate-error {
  font-size: 0.9rem;
}

.uid-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.uid {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow-wrap: anywhere;
  user-select: all;
}

.copy-status {
  font-size: 0.85rem;
  color: var(--text-secondary);
  min-height: 1em;
}

.loading {
  color: var(--text-secondary);
}

.save-error {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: var(--radius-md);
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>
