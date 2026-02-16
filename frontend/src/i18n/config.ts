import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en/translation.json';
import uaTranslation from '../locales/ua/translation.json';
import plTranslation from '../locales/pl/translation.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            ua: { translation: uaTranslation },
            pl: { translation: plTranslation }
        },
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes
        }
    });

export default i18n;