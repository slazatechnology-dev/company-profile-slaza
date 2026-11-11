// Konten beranda yang bisa diubah dari portal (menu "Konten website").
// Disimpan di Firestore sebagai satu dokumen site/home (field json = string JSON), gambar di siteImages/{id}.
// Keduanya boleh dibaca publik (lihat firestore.rules); hanya pemilik yang bisa menulis.
//
// Model: setiap teks berisi dua bahasa { id, en }. EN kosong = pakai teks ID.
// Beranda tetap memakai translations.js sebagai cadangan; konten dari Firestore menimpanya.
import { translations } from './translations.js';

const bi = (id, en) => ({ id: id ?? '', en: en ?? '' });
const isBi = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === 2 && typeof v.id === 'string' && typeof v.en === 'string';
const pick = (keys, a = {}, b = {}) => Object.fromEntries(keys.map(k => [k, bi(a[k], b[k])]));

export const newKey = () => `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const emptyService = () => ({ key: newKey(), category: bi(), title: bi(), desc: bi(), features: [bi()] });
export const emptyProject = () => ({
  key: newKey(), name: '', url: '', imageId: '', techStack: '',
  subtitle: bi(), desc: bi(), urlText: bi(), shotAlt: bi(), shotCaption: bi()
});

// Isi awal editor = teks website yang sekarang (dari translations.js), kedua bahasa
export const seedSiteContent = () => {
  const I = translations.id;
  const E = translations.en;
  return {
    hero: pick(['headline', 'headlineAccent', 'subtext', 'ctaPrimary', 'ctaSecondary', 'shotAlt', 'shotCaption'], I.hero, E.hero),
    about: {
      ...pick(['title', 'titleAccent', 'description', 'visionTitle', 'visionText', 'missionTitle'], I.about, E.about),
      missions: I.about.missions.map((m, i) => bi(m, E.about.missions[i]))
    },
    services: {
      ...pick(['title', 'titleAccent', 'subtitle'], I.services, E.services),
      items: I.services.items.map((it, i) => {
        const en = E.services.items[i] || {};
        return { key: it.id, ...pick(['category', 'title', 'desc'], it, en), features: it.features.map((f, j) => bi(f, en.features?.[j])) };
      })
    },
    portfolio: {
      ...pick(['title', 'titleAccent', 'subtitle'], I.portfolio, E.portfolio),
      projects: I.portfolio.projects.map((p, i) => {
        const en = E.portfolio.projects[i] || {};
        return {
          key: p.key, name: p.title, url: p.url, imageId: p.imageId, techStack: p.techStack.join(', '),
          ...pick(['subtitle', 'desc', 'urlText', 'shotAlt', 'shotCaption'], p, en)
        };
      })
    },
    contact: {
      ...pick(['title', 'titleAccent', 'subtitle'], I.contact, E.contact),
      office: {
        email: I.contact.office.email,
        phone: I.contact.office.phone,
        ...pick(['address', 'hours', 'areaDesc'], I.contact.office, E.contact.office)
      }
    },
    footer: pick(['desc'], I.footer, E.footer)
  };
};

// Konten dua bahasa -> potongan objek berbentuk translations[lang], siap ditimpakan ke teks bawaan
export const localizeSiteContent = (content, lang) => {
  const text = (v) => (lang !== 'id' && v[lang]?.trim() ? v[lang] : v.id);
  const deep = (v) => {
    if (isBi(v)) return text(v);
    if (Array.isArray(v)) return v.map(deep);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x)]));
    return v;
  };
  const o = deep(content);
  return {
    hero: o.hero,
    about: { ...o.about, missions: o.about.missions.filter(Boolean) },
    services: {
      ...o.services,
      items: o.services.items.map(({ key, features, ...it }) => ({ ...it, id: key, features: features.filter(Boolean) }))
    },
    portfolio: {
      ...o.portfolio,
      projects: o.portfolio.projects.map(({ name, techStack, url, ...p }) => ({
        ...p,
        title: name,
        // Hanya link http(s) yang ditampilkan; isian lain dianggap kosong
        url: /^https?:\/\//i.test(url || '') ? url : '',
        techStack: (techStack || '').split(',').map(s => s.trim()).filter(Boolean)
      }))
    },
    contact: o.contact,
    footer: o.footer
  };
};

// Objek digabung per kunci; array dan nilai biasa diganti utuh
export const mergeContent = (base, over) => {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && base?.[k] && typeof base[k] === 'object'
      ? mergeContent(base[k], v)
      : v;
  }
  return out;
};

// --- Baca dari Firestore lewat REST (tanpa SDK Firebase, supaya beranda tetap ringan)
const env = import.meta.env || {};

const fetchFields = async (path) => {
  const project = env.VITE_FIREBASE_PROJECT_ID;
  const key = env.VITE_FIREBASE_API_KEY;
  if (!project || !key) return null;
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/${path}?key=${key}`);
  return res.ok ? (await res.json()).fields : null;
};

export const loadSiteContent = async () => {
  const raw = (await fetchFields('site/home'))?.json?.stringValue;
  return raw ? JSON.parse(raw) : null;
};

export const loadSiteImage = async (id) => {
  const url = (await fetchFields(`siteImages/${encodeURIComponent(id)}`))?.dataUrl?.stringValue;
  return url?.startsWith('data:image/') ? url : null;
};
