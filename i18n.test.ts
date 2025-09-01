import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n utility - t function', () => {
  it('should return the correct Japanese translation object for "ja"', () => {
    const translations = t('ja');
    expect(translations.header.tagline).toBe('あなたのウェルネス・ガイド');
    expect(translations.compendium.title).toBe('処方・生薬解説 (臨床薬物学)');
  });

  it('should return the correct English translation object for "en"', () => {
    const translations = t('en');
    expect(translations.header.tagline).toBe('Your Wellness Guide');
    expect(translations.compendium.title).toBe('Formulary / Materia Medica');
  });
});