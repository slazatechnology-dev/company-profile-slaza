import { ref, computed } from 'vue';
import { translations } from '../data/translations';

const saved = localStorage.getItem('slaza_locale');
const currentLocale = ref(translations[saved] ? saved : 'id');
document.documentElement.lang = currentLocale.value;

export function useI18n() {
  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale;
      localStorage.setItem('slaza_locale', locale);
      document.documentElement.lang = locale;
    }
  };

  const t = computed(() => translations[currentLocale.value]);
  const locale = computed(() => currentLocale.value);
  const waUrl = computed(() => `https://wa.me/${t.value.contact.office.phone.replace(/\D/g, '')}`);

  return {
    locale,
    setLocale,
    t,
    waUrl
  };
}
