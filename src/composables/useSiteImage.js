import { reactive } from 'vue';
import { loadSiteImage } from '../data/siteContent';
import yaytopup from '../assets/yaytopup-2026-10-13.png';

// Gambar bawaan (ikut di-build) dipakai sampai diganti lewat upload di portal
const BUNDLED = { 'bundled:yaytopup': yaytopup };

// Gambar upload disimpan di Firestore siteImages/{id} sebagai data URL; diambil sekali per halaman
const cache = reactive({});

export const siteImageSrc = (id) => {
  if (!id) return '';
  if (BUNDLED[id]) return BUNDLED[id];
  if (!(id in cache)) {
    cache[id] = '';
    loadSiteImage(id).then((url) => { cache[id] = url || ''; }).catch(() => {});
  }
  return cache[id];
};

// Dipakai portal setelah upload, supaya pratinjau langsung tampil tanpa membaca ulang
export const putSiteImage = (id, dataUrl) => { cache[id] = dataUrl; };
