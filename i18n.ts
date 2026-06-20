import type { Language } from './types';
import jaTranslations from './i18n/ja.json';
import enTranslations from './i18n/en.json';

/**
 * The translation structure is derived directly from the Japanese locale file,
 * so the `Translations` type can never drift from the actual JSON content.
 * The English locale is validated against the same shape where `translations`
 * is declared below, which keeps both files structurally in sync at build time.
 */
export type Translations = typeof jaTranslations;

// Translation data. Typing the record as `Record<Language, Translations>` makes
// TypeScript verify that en.json matches the shape of ja.json.
const translations: Record<Language, Translations> = {
  ja: jaTranslations,
  en: enTranslations,
};

/**
 * Get translations for a specific language
 * @param language - The language code ('ja' or 'en')
 * @returns Translation object for the specified language
 */
export const t = (language: Language): Translations => {
  return translations[language] || translations.ja;
};

// Re-export for backward compatibility
export default translations;
