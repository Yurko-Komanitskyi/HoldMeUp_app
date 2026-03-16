import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '@/shared/locales/en/translation.json';
import uaTranslation from '@/shared/locales/ua/translation.json';

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
export default i18n;
