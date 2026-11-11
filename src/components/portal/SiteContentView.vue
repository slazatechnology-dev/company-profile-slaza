<template>
  <div class="site-view">
    <div class="panel">
      <h2 class="panel-title">Konten website</h2>
      <p class="panel-desc">
        Teks dan gambar beranda dalam bahasa Indonesia (ID) dan Inggris (EN). Kolom EN yang dikosongkan memakai teks ID.
        Perubahan baru tampil di website setelah kamu menekan Simpan &amp; tampilkan.
      </p>
    </div>

    <template v-if="draft">
      <nav class="seg" aria-label="Bagian beranda">
        <button
          v-for="s in SECTIONS"
          :key="s.id"
          type="button"
          class="seg-btn"
          :class="{ active: section === s.id }"
          :aria-pressed="section === s.id"
          @click="section = s.id"
        >
          {{ s.label }}
        </button>
      </nav>

      <!-- Hero -->
      <section v-if="section === 'hero'" class="panel">
        <BiField label="Judul utama" :field="draft.hero.headline" required />
        <BiField label="Frasa biru di judul" :field="draft.hero.headlineAccent" hint="Bagian dari judul yang diberi warna biru. Harus sama persis dengan potongan judul." :warning="accentWarning(draft.hero.headline, draft.hero.headlineAccent)" />
        <BiField label="Subjudul" :field="draft.hero.subtext" multiline required />
        <BiField label="Tombol utama (ke form kontak)" :field="draft.hero.ctaPrimary" required />
        <BiField label="Tombol kedua (ke portofolio)" :field="draft.hero.ctaSecondary" required />
        <BiField label="Keterangan gambar hero" :field="draft.hero.shotCaption" hint="Gambar hero otomatis memakai gambar proyek pertama di Portofolio." />
        <BiField label="Teks alternatif gambar hero" :field="draft.hero.shotAlt" hint="Dibaca pembaca layar untuk pengunjung tunanetra. Jelaskan isi gambarnya." />
      </section>

      <!-- Tentang -->
      <section v-else-if="section === 'about'" class="panel">
        <BiField label="Judul" :field="draft.about.title" required />
        <BiField label="Frasa biru di judul" :field="draft.about.titleAccent" :warning="accentWarning(draft.about.title, draft.about.titleAccent)" />
        <BiField label="Paragraf pembuka" :field="draft.about.description" multiline required />
        <BiField label="Judul pendekatan" :field="draft.about.visionTitle" />
        <BiField label="Isi pendekatan" :field="draft.about.visionText" multiline />
        <BiField label="Judul komitmen" :field="draft.about.missionTitle" />

        <h3 class="sub-heading">Daftar komitmen</h3>
        <div v-for="(m, i) in draft.about.missions" :key="i" class="list-item">
          <BiField :label="`Komitmen ${i + 1}`" :field="m" />
          <ItemTools :index="i" :list="draft.about.missions" :name="`komitmen ${i + 1}`" @remove="removeItem(draft.about.missions, i, `komitmen ${i + 1}`)" />
        </div>
        <button type="button" class="btn-text add-btn" @click="draft.about.missions.push(bi())">+ Tambah komitmen</button>
      </section>

      <!-- Layanan -->
      <section v-else-if="section === 'services'" class="panel">
        <BiField label="Judul" :field="draft.services.title" required />
        <BiField label="Frasa biru di judul" :field="draft.services.titleAccent" :warning="accentWarning(draft.services.title, draft.services.titleAccent)" />
        <BiField label="Subjudul" :field="draft.services.subtitle" multiline />

        <article v-for="(svc, i) in draft.services.items" :key="svc.key" class="item-card">
          <header class="item-head">
            <h3 class="sub-heading">Layanan {{ i + 1 }}: {{ svc.title.id || 'tanpa judul' }}</h3>
            <ItemTools :index="i" :list="draft.services.items" :name="svc.title.id || `layanan ${i + 1}`" @remove="removeItem(draft.services.items, i, svc.title.id || `layanan ${i + 1}`)" />
          </header>
          <BiField label="Kategori (teks kecil di atas judul)" :field="svc.category" />
          <BiField label="Judul layanan" :field="svc.title" required />
          <BiField label="Deskripsi" :field="svc.desc" multiline />
          <p class="form-label">Poin layanan</p>
          <div v-for="(f, j) in svc.features" :key="j" class="list-item">
            <BiField :label="`Poin ${j + 1}`" :field="f" />
            <ItemTools :index="j" :list="svc.features" :name="`poin ${j + 1}`" @remove="removeItem(svc.features, j, `poin ${j + 1}`)" />
          </div>
          <button type="button" class="btn-text add-btn" @click="svc.features.push(bi())">+ Tambah poin</button>
        </article>
        <button type="button" class="btn btn-secondary btn-sm" @click="draft.services.items.push(emptyService())">Tambah layanan</button>
      </section>

      <!-- Portofolio -->
      <section v-else-if="section === 'portfolio'" class="panel">
        <BiField label="Judul" :field="draft.portfolio.title" required />
        <BiField label="Frasa biru di judul" :field="draft.portfolio.titleAccent" :warning="accentWarning(draft.portfolio.title, draft.portfolio.titleAccent)" />
        <BiField label="Subjudul" :field="draft.portfolio.subtitle" multiline />

        <article v-for="(p, i) in draft.portfolio.projects" :key="p.key" class="item-card">
          <header class="item-head">
            <h3 class="sub-heading">Proyek {{ i + 1 }}: {{ p.name || 'tanpa nama' }}<span v-if="i === 0" class="tag">Tampil di hero</span></h3>
            <ItemTools :index="i" :list="draft.portfolio.projects" :name="p.name || `proyek ${i + 1}`" @remove="removeItem(draft.portfolio.projects, i, p.name || `proyek ${i + 1}`)" />
          </header>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" :for="`pn-${p.key}`">Nama proyek</label>
              <input :id="`pn-${p.key}`" v-model.trim="p.name" type="text" required class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label" :for="`pu-${p.key}`">Link website (boleh kosong)</label>
              <input :id="`pu-${p.key}`" v-model.trim="p.url" type="url" placeholder="https://" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" :for="`pt-${p.key}`">Teknologi (pisahkan dengan koma)</label>
            <input :id="`pt-${p.key}`" v-model="p.techStack" type="text" placeholder="Vue.js, Firebase, MQTT" class="form-input mono" />
          </div>
          <BiField label="Subjudul" :field="p.subtitle" />
          <BiField label="Deskripsi" :field="p.desc" multiline />
          <BiField label="Teks tombol link" :field="p.urlText" hint="Hanya tampil kalau link website diisi." />

          <!-- Gambar dikecilkan di browser (WebP, lebar maks 1600px) lalu disimpan di Firestore -->
          <div class="image-field">
            <img v-if="siteImageSrc(p.imageId)" :src="siteImageSrc(p.imageId)" :alt="p.shotAlt.id" class="image-preview" />
            <div v-else class="image-empty">Belum ada gambar</div>
            <div>
              <label class="btn btn-secondary btn-sm upload-btn">
                {{ uploading === p.key ? 'Mengunggah...' : p.imageId ? 'Ganti gambar' : 'Unggah gambar' }}
                <input type="file" accept="image/png,image/jpeg,image/webp" class="visually-hidden" :disabled="uploading === p.key" @change="upload($event, p)" />
              </label>
              <button v-if="p.imageId" type="button" class="btn-text" @click="p.imageId = ''">Hapus gambar</button>
              <p class="field-hint">PNG, JPG, atau WebP. Gambar dikecilkan otomatis. Rasio 16:10 terlihat paling rapi.</p>
              <p v-if="uploadError" class="field-hint warn" role="alert">{{ uploadError }}</p>
            </div>
          </div>
          <BiField label="Keterangan gambar" :field="p.shotCaption" />
          <BiField label="Teks alternatif gambar" :field="p.shotAlt" hint="Jelaskan isi gambar untuk pembaca layar." />
        </article>
        <button type="button" class="btn btn-secondary btn-sm" @click="draft.portfolio.projects.push(emptyProject())">Tambah proyek</button>
      </section>

      <!-- Kontak & footer -->
      <section v-else-if="section === 'contact'" class="panel">
        <BiField label="Judul" :field="draft.contact.title" required />
        <BiField label="Frasa biru di judul" :field="draft.contact.titleAccent" :warning="accentWarning(draft.contact.title, draft.contact.titleAccent)" />
        <BiField label="Subjudul" :field="draft.contact.subtitle" multiline />
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="ct-email">Email</label>
            <input id="ct-email" v-model.trim="draft.contact.office.email" type="email" required class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label" for="ct-phone">WhatsApp / telepon</label>
            <input id="ct-phone" v-model.trim="draft.contact.office.phone" type="tel" required class="form-input" aria-describedby="ct-phone-hint" />
            <p id="ct-phone-hint" class="field-hint">Tulis dengan kode negara, misalnya +62 895-3710-64155. Link WhatsApp dibuat dari nomor ini.</p>
          </div>
        </div>
        <BiField label="Alamat" :field="draft.contact.office.address" multiline required hint="Juga dipakai di kop invoice dan BAST." />
        <BiField label="Jam operasional" :field="draft.contact.office.hours" />
        <BiField label="Area layanan" :field="draft.contact.office.areaDesc" multiline />
        <BiField label="Deskripsi singkat di footer" :field="draft.footer.desc" multiline />
      </section>
    </template>

    <!-- Bar simpan menempel di bawah layar selama mengisi form yang panjang -->
    <div class="save-bar" :class="{ dirty }">
      <p class="save-status" role="status">
        <span v-if="state.loading">Memuat konten...</span>
        <span v-else-if="state.error" class="text-block">{{ state.error }}</span>
        <span v-else-if="dirty">Ada perubahan yang belum disimpan.</span>
        <span v-else-if="state.fromSeed">Belum pernah disimpan. Isi di atas diambil dari teks website sekarang.</span>
        <span v-else>Semua perubahan sudah tampil di website.</span>
      </p>
      <div class="head-actions">
        <a href="/" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Lihat website</a>
        <button type="button" class="btn btn-primary btn-sm" :disabled="!dirty || state.saving || state.loading" @click="save">
          {{ state.saving ? 'Menyimpan...' : 'Simpan & tampilkan' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

// Draf di level modul (bukan per komponen) supaya isian tidak hilang saat pindah ke menu portal lain
const draft = ref(null);
const savedJson = ref('');
const section = ref('hero');
const state = reactive({ loading: false, saving: false, error: '', fromSeed: false });
</script>

<script setup>
import { computed, h, onMounted, onBeforeUnmount } from 'vue';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { seedSiteContent, emptyService, emptyProject, newKey, mergeContent } from '../../data/siteContent';
import { applySiteContent } from '../../composables/useI18n';
import { siteImageSrc, putSiteImage } from '../../composables/useSiteImage';
import { askConfirm } from '../../composables/useConfirm';
import BiField from './BiField.vue';

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'Tentang' },
  { id: 'services', label: 'Layanan' },
  { id: 'portfolio', label: 'Portofolio' },
  { id: 'contact', label: 'Kontak & footer' }
];

const bi = () => ({ id: '', en: '' });

const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== savedJson.value);

const load = async () => {
  if (draft.value) return; // sudah dimuat sebelumnya (kembali dari menu lain)
  state.loading = true;
  try {
    const snap = await getDoc(doc(db, 'site', 'home'));
    // Konten lama dilengkapi kolom yang mungkin ditambahkan belakangan (dari isi awal)
    const content = snap.exists() ? mergeContent(seedSiteContent(), JSON.parse(snap.data().json)) : seedSiteContent();
    state.fromSeed = !snap.exists();
    draft.value = content;
    savedJson.value = state.fromSeed ? '' : JSON.stringify(content);
  } catch (err) {
    state.error = `Konten gagal dimuat (${err.code || err.message}). Periksa koneksi lalu buka menu ini lagi.`;
  } finally {
    state.loading = false;
  }
};

// Peringatan sebelum menutup tab saat masih ada perubahan yang belum disimpan
const warnUnsaved = (e) => {
  if (dirty.value) e.preventDefault();
};
onMounted(() => {
  load();
  window.addEventListener('beforeunload', warnUnsaved);
});
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnUnsaved));

const accentWarning = (title, accent) => {
  const missing = ['id', 'en'].filter(l => accent[l] && (title[l] || title.id) && !(title[l] || title.id).includes(accent[l]));
  return missing.length ? `Frasa ${missing.map(l => l.toUpperCase()).join(' & ')} tidak ditemukan di judul, jadi judul tampil tanpa warna biru.` : '';
};

const removeItem = async (list, index, name) => {
  if (await askConfirm({ title: `Hapus ${name}?`, message: 'Baru hilang dari website setelah kamu menekan Simpan & tampilkan.', confirmLabel: 'Hapus dari daftar', tone: 'danger' })) {
    list.splice(index, 1);
  }
};

// Tombol urutkan & hapus untuk satu item daftar
const ItemTools = (props, { emit }) => {
  const move = (dir) => {
    const { list, index } = props;
    const to = index + dir;
    if (to < 0 || to >= list.length) return;
    [list[index], list[to]] = [list[to], list[index]];
  };
  return h('div', { class: 'item-tools' }, [
    h('button', { type: 'button', class: 'btn-text', disabled: props.index === 0, 'aria-label': `Naikkan ${props.name}`, onClick: () => move(-1) }, 'Naik'),
    h('button', { type: 'button', class: 'btn-text', disabled: props.index === props.list.length - 1, 'aria-label': `Turunkan ${props.name}`, onClick: () => move(1) }, 'Turun'),
    h('button', { type: 'button', class: 'btn-text danger-text', 'aria-label': `Hapus ${props.name}`, onClick: () => emit('remove') }, 'Hapus')
  ]);
};
ItemTools.props = ['index', 'list', 'name'];
ItemTools.emits = ['remove'];

// Kecilkan gambar di browser: lebar maks 1600px, WebP (JPEG jika browser tidak bisa WebP), < 850 KB
const compress = async (file) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.82, 0.7, 0.55, 0.4]) {
    let url = canvas.toDataURL('image/webp', q);
    if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', q);
    if (url.length < 850000) return url;
  }
  throw new Error('gambar masih terlalu besar setelah dikecilkan');
};

const uploading = ref('');
const uploadError = ref('');
const upload = async (event, project) => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  uploading.value = project.key;
  uploadError.value = '';
  try {
    const dataUrl = await compress(file);
    const id = newKey();
    await setDoc(doc(db, 'siteImages', id), { dataUrl, createdAt: serverTimestamp() });
    putSiteImage(id, dataUrl);
    project.imageId = id;
  } catch (err) {
    uploadError.value = `Gambar gagal diunggah (${err.code || err.message}).`;
  } finally {
    uploading.value = '';
  }
};

const save = async () => {
  state.saving = true;
  state.error = '';
  try {
    const content = JSON.parse(JSON.stringify(draft.value));
    await setDoc(doc(db, 'site', 'home'), { json: JSON.stringify(content), updatedAt: serverTimestamp() });
    savedJson.value = JSON.stringify(content);
    state.fromSeed = false;
    applySiteContent(content);
    // Bersihkan gambar yang tidak dipakai lagi (diganti, dihapus, atau diunggah lalu dibatalkan)
    const used = new Set(content.portfolio.projects.map(p => p.imageId));
    const images = await getDocs(collection(db, 'siteImages'));
    await Promise.all(images.docs.filter(d => !used.has(d.id)).map(d => deleteDoc(d.ref)));
  } catch (err) {
    state.error = `Gagal menyimpan (${err.code || err.message}). Perubahan masih ada di halaman ini, coba simpan lagi.`;
  } finally {
    state.saving = false;
  }
};
</script>

<style scoped>
.site-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.save-bar {
  position: sticky;
  bottom: 16px;
  z-index: 5;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px -12px rgba(15, 23, 42, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.save-bar.dirty {
  border-color: #f59e0b;
}

.save-status {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  background: #ffffff;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  align-self: flex-start;
}

.seg-btn {
  min-height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

.seg-btn.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.seg-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.sub-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 8px 0 12px;
}

.item-card {
  padding: 16px 0 8px;
  margin-bottom: 16px;
  border-top: 1px solid var(--card-border);
}

.item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.list-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
}

.list-item :deep(.item-tools) {
  margin-top: 22px;
}

:deep(.item-tools) {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

:deep(.danger-text) {
  color: #b91c1c;
}

.add-btn {
  padding-left: 0;
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0 16px;
}

.form-group {
  margin-bottom: 16px;
}

.image-field {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  margin-bottom: 18px;
}

.image-preview,
.image-empty {
  width: 240px;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.image-empty {
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
}

.upload-btn:focus-within {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.warn {
  color: #92400e;
}

@media (max-width: 720px) {
  .image-field {
    grid-template-columns: minmax(0, 1fr);
  }
  .list-item {
    grid-template-columns: minmax(0, 1fr);
  }
  .list-item :deep(.item-tools) {
    margin: -8px 0 12px;
  }
}
</style>
