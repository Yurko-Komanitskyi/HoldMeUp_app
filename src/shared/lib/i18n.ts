import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enTranslation from '@/shared/locales/en/translation.json';
import uaTranslation from '@/shared/locales/ua/translation.json';

const STORAGE_KEY = 'holdmeup-lang';
const fallbackLng = 'en';

const resources = {
  en: { translation: enTranslation },
  ua: { translation: uaTranslation },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng,
  interpolation: {
    escapeValue: false,
  },
});

void (async () => {
  try {
    const savedLang = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLang) {
      await i18n.changeLanguage(savedLang as 'en' | 'ua');
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, i18n.language);
    }
  } catch {}
})();

export function setAppLanguage(lang: 'en' | 'ua') {
  void i18n.changeLanguage(lang).then(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  });
}

export default i18n;
