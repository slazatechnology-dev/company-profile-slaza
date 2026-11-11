import { ref, computed } from 'vue';
import { translations } from '../data/translations';
import { localizeSiteContent, mergeContent, loadSiteContent } from '../data/siteContent';

// localStorage bisa melempar error (mode privat / diblokir); website tetap jalan tanpa itu
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* abaikan */ } }
};

const saved = store.get('slaza_locale');
const currentLocale = ref(translations[saved] ? saved : 'id');
document.documentElement.lang = currentLocale.value;

// Konten dari portal (site/home). Cache terakhir dipakai dulu supaya teks tidak berkedip saat halaman dibuka.
const CACHE_KEY = 'slaza_site_content';
const siteContent = ref(null);
try { siteContent.value = JSON.parse(store.get(CACHE_KEY) || 'null'); } catch { siteContent.value = null; }

export const applySiteContent = (content) => {
  siteContent.value = content;
  store.set(CACHE_KEY, JSON.stringify(content));
};

loadSiteContent().then((c) => c && applySiteContent(c)).catch(() => { /* offline / belum dikonfigurasi: pakai teks bawaan */ });

// Teks satu bahasa: bawaan translations.js ditimpa konten portal. Konten rusak = abaikan, pakai bawaan.
const textFor = (lang) => {
  if (!siteContent.value) return translations[lang];
  try {
    return mergeContent(translations[lang], localizeSiteContent(siteContent.value, lang));
  } catch {
    return translations[lang];
  }
};

export function useI18n() {
  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale;
      store.set('slaza_locale', locale);
      document.documentElement.lang = locale;
    }
  };

  const t = computed(() => textFor(currentLocale.value));
  const locale = computed(() => currentLocale.value);
  const waUrl = computed(() => `https://wa.me/${t.value.contact.office.phone.replace(/\D/g, '')}`);

  return {
    locale,
    setLocale,
    t,
    waUrl,
    textFor
  };
}
