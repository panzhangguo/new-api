/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import { convertDetectedLanguage } from './languages'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ru from './locales/ru.json'
import vi from './locales/vi.json'
import zhTW from './locales/zh-TW.json'
import zhCN from './locales/zh.json'

/** wr Enterprise start */
import enWr from './locales/wr/en.json'
import frWr from './locales/wr/fr.json'
import jaWr from './locales/wr/ja.json'
import ruWr from './locales/wr/ru.json'
import viWr from './locales/wr/vi.json'
import zhTWWr from './locales/wr/zh-TW.json'
import zhCNWr from './locales/wr/zh.json'
/** wr Enterprise end */

/**
 * Enterprise console messages are kept in their own files so upstream locale
 * files stay mergeable, and are merged into the flat translation namespace at
 * runtime so `t('Source text')` calls keep working. `sync-i18n.mjs` only scans
 * the top level of `locales/`, so it ignores the `wr/` directory.
 */
function withEnterpriseMessages<T extends { translation: object }>(
  locale: T,
  messages: Record<string, string>
) {
  return {
    ...locale,
    translation: {
      ...messages,
      ...locale.translation,
    },
  }
}

export const resources = {
  en: withEnterpriseMessages(en, enWr),
  zhCN: withEnterpriseMessages(zhCN, zhCNWr),
  fr: withEnterpriseMessages(fr, frWr),
  ru: withEnterpriseMessages(ru, ruWr),
  ja: withEnterpriseMessages(ja, jaWr),
  vi: withEnterpriseMessages(vi, viWr),
  zhTW: withEnterpriseMessages(zhTW, zhTWWr),
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zhCN', 'fr', 'ru', 'ja', 'vi', 'zhTW'],
    load: 'currentOnly',
    nsSeparator: false, // Allow literal colons in keys (e.g., URLs, labels)
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      // Browsers report `zh-CN`/`zh-TW`/`zh`; map them onto our `zhCN`/`zhTW`
      // codes (non-Chinese codes pass through for normal supportedLngs matching).
      convertDetectedLanguage,
    },
  })

export default i18n
