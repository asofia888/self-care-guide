import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n Translation System', () => {
  it('returns English translations for "en" language', () => {
    const translations = t('en');

    expect(translations.nav.compendium).toBeDefined();
    expect(translations.nav.manual).toBeDefined();
    expect(typeof translations.nav.compendium).toBe('string');
  });

  it('returns Japanese translations for "ja" language', () => {
    const translations = t('ja');

    expect(translations.nav.compendium).toBeDefined();
    expect(translations.nav.manual).toBeDefined();
    expect(typeof translations.nav.compendium).toBe('string');
  });

  it('has consistent structure between languages', () => {
    const enTranslations = t('en');
    const jaTranslations = t('ja');

    // Check that both have the same top-level keys
    expect(Object.keys(enTranslations).sort()).toEqual(Object.keys(jaTranslations).sort());

    // Check nav structure
    expect(Object.keys(enTranslations.nav)).toEqual(Object.keys(jaTranslations.nav));

    // Check compendium structure
    expect(Object.keys(enTranslations.compendium)).toEqual(Object.keys(jaTranslations.compendium));

    // Check error structure
    expect(Object.keys(enTranslations.error)).toEqual(Object.keys(jaTranslations.error));
  });

  it('provides complete navigation translations', () => {
    const en = t('en').nav;
    const ja = t('ja').nav;

    const requiredFields = ['compendium', 'manual'];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
      expect(typeof en[field as keyof typeof en]).toBe('string');
      expect(typeof ja[field as keyof typeof ja]).toBe('string');
    });
  });

  it('provides complete welcome translations', () => {
    const en = t('en').welcome;
    const ja = t('ja').welcome;

    expect(en.title).toBeDefined();
    expect(en.description).toBeDefined();
    expect(ja.title).toBeDefined();
    expect(ja.description).toBeDefined();
  });

  it('provides complete compendium translations', () => {
    const en = t('en').compendium;
    const ja = t('ja').compendium;

    const requiredFields = [
      'title',
      'searchLabel',
      'searchPlaceholder',
      'searchButton',
      'clearButton',
      'searching',
      'printButton',
      'noResults',
    ];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
      expect(typeof en[field as keyof typeof en]).toBe('string');
      expect(typeof ja[field as keyof typeof ja]).toBe('string');
    });
  });

  it('provides complete error translations', () => {
    const en = t('en').error;
    const ja = t('ja').error;

    const requiredFields = ['unexpected', 'apiError', 'retry'];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
      expect(typeof en[field as keyof typeof en]).toBe('string');
      expect(typeof ja[field as keyof typeof ja]).toBe('string');
    });
  });

  it('handles placeholder replacement in error messages', () => {
    const en = t('en');
    const ja = t('ja');

    // API error should have placeholder
    expect(en.error.apiError).toContain('{message}');
    expect(ja.error.apiError).toContain('{message}');
  });

  it('provides user input form translations', () => {
    const en = t('en').userInput;
    const ja = t('ja').userInput;

    expect(en).toBeDefined();
    expect(ja).toBeDefined();

    // Check submit buttons
    expect(en.submitButton).toBeDefined();
    expect(en.submitButtonLoading).toBeDefined();
    expect(ja.submitButton).toBeDefined();
    expect(ja.submitButtonLoading).toBeDefined();

    // Check mode-specific translations
    expect(en.professional).toBeDefined();
    expect(en.general).toBeDefined();
    expect(ja.professional).toBeDefined();
    expect(ja.general).toBeDefined();

    // Check modes
    expect(en.modes.professional).toBeDefined();
    expect(en.modes.general).toBeDefined();
    expect(ja.modes.professional).toBeDefined();
    expect(ja.modes.general).toBeDefined();
  });

  it('provides professional form translations', () => {
    const en = t('en').userInput.professional;
    const ja = t('ja').userInput.professional;

    const requiredFields = [
      'patientInfoTitle',
      'age',
      'gender',
      'chiefComplaint',
      'chiefComplaintRequiredError',
    ];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
    });
  });

  it('provides general form translations', () => {
    const en = t('en').userInput.general;
    const ja = t('ja').userInput.general;

    const requiredFields = [
      'basicInfoTitle',
      'age',
      'gender',
      'concernsTitle',
      'concernsRequiredError',
    ];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
    });
  });

  it('provides gender options as arrays', () => {
    const en = t('en').userInput.genderOptions;
    const ja = t('ja').userInput.genderOptions;

    expect(Array.isArray(en)).toBe(true);
    expect(Array.isArray(ja)).toBe(true);
    expect(en.length).toBeGreaterThan(0);
    expect(ja.length).toBeGreaterThan(0);

    // Each option should have value and label
    en.forEach((option) => {
      expect(option.value).toBeDefined();
      expect(option.label).toBeDefined();
    });

    ja.forEach((option) => {
      expect(option.value).toBeDefined();
      expect(option.label).toBeDefined();
    });
  });

  it('provides analysis display translations', () => {
    const en = t('en').analysisDisplay;
    const ja = t('ja').analysisDisplay;

    expect(en).toBeDefined();
    expect(ja).toBeDefined();

    // Check for essential fields
    expect(en.printButton).toBeDefined();
    expect(ja.printButton).toBeDefined();
    expect(en.professional).toBeDefined();
    expect(ja.professional).toBeDefined();
    expect(en.general).toBeDefined();
    expect(ja.general).toBeDefined();
  });

  it('provides footer translations', () => {
    const en = t('en').footer;
    const ja = t('ja').footer;

    const requiredFields = ['privacy', 'terms', 'disclaimer'];

    requiredFields.forEach((field) => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
    });
  });

  it('provides legal pages translations', () => {
    const en = t('en');
    const ja = t('ja');

    // Privacy policy
    expect(en.privacy.title).toBeDefined();
    expect(en.privacy.content).toBeDefined();
    expect(ja.privacy.title).toBeDefined();
    expect(ja.privacy.content).toBeDefined();

    // Terms of service
    expect(en.terms.title).toBeDefined();
    expect(en.terms.content).toBeDefined();
    expect(ja.terms.title).toBeDefined();
    expect(ja.terms.content).toBeDefined();

    // Disclaimer
    expect(en.disclaimer.title).toBeDefined();
    expect(en.disclaimer.content).toBeDefined();
    expect(ja.disclaimer.title).toBeDefined();
    expect(ja.disclaimer.content).toBeDefined();
  });

  it('provides manual/guide translations', () => {
    const en = t('en').manual;
    const ja = t('ja').manual;

    expect(en.title).toBeDefined();
    expect(en.overviewTitle).toBeDefined();
    expect(en.overviewContent).toBeDefined();
    expect(ja.title).toBeDefined();
    expect(ja.overviewTitle).toBeDefined();
    expect(ja.overviewContent).toBeDefined();
  });

  it('returns fallback to Japanese for invalid language codes', () => {
    // Should not throw error for invalid language
    expect(() => t('fr' as any)).not.toThrow();

    // Should return Japanese as fallback (default)
    const fallback = t('fr' as any);
    const japanese = t('ja');
    expect(fallback).toEqual(japanese);
  });

  it('has non-empty translation strings', () => {
    const en = t('en');
    const ja = t('ja');

    // Recursively check all string values are non-empty
    function checkNonEmpty(obj: any, path = ''): void {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          expect(value.trim(), `Empty string at ${currentPath}`).not.toBe('');
        } else if (Array.isArray(value)) {
          // Check array items
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              checkNonEmpty(item, `${currentPath}[${index}]`);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          checkNonEmpty(value, currentPath);
        }
      });
    }

    checkNonEmpty(en, 'en');
    checkNonEmpty(ja, 'ja');
  });

  it('maintains consistent placeholder patterns', () => {
    const en = t('en');
    const ja = t('ja');

    // Find all strings with placeholders
    function findPlaceholders(obj: any): string[] {
      const placeholders: string[] = [];

      function traverse(current: any, path = ''): void {
        Object.entries(current).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === 'string' && value.includes('{')) {
            const matches = value.match(/\{[^}]+\}/g);
            if (matches) {
              placeholders.push(`${currentPath}: ${matches.join(', ')}`);
            }
          } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            traverse(value, currentPath);
          }
        });
      }

      traverse(obj);
      return placeholders;
    }

    const enPlaceholders = findPlaceholders(en);
    const jaPlaceholders = findPlaceholders(ja);

    // Should have same number of placeholders
    expect(enPlaceholders.length).toBe(jaPlaceholders.length);

    // Each placeholder should exist in both languages
    enPlaceholders.forEach((placeholder) => {
      const key = placeholder.split(':')[0];
      const jaEquivalent = jaPlaceholders.find((jp) => jp.startsWith(key));
      expect(jaEquivalent, `Missing placeholder in Japanese for ${key}`).toBeDefined();
    });
  });

  it('has matching array lengths for options', () => {
    const en = t('en').userInput;
    const ja = t('ja').userInput;

    // Gender options
    expect(en.genderOptions.length).toBe(ja.genderOptions.length);

    // Professional occupation options
    expect(en.professional.occupationOptions.length).toBe(ja.professional.occupationOptions.length);

    // General occupation options
    expect(en.general.occupationOptions.length).toBe(ja.general.occupationOptions.length);

    // Concern options
    expect(en.general.concernOptions.length).toBe(ja.general.concernOptions.length);

    // Self-assessment options
    expect(en.general.selfAssessmentOptions.length).toBe(ja.general.selfAssessmentOptions.length);
  });

  it('has consistent option values across languages', () => {
    const en = t('en').userInput;
    const ja = t('ja').userInput;

    // Gender values should match
    const enGenderValues = en.genderOptions.map((o) => o.value).sort();
    const jaGenderValues = ja.genderOptions.map((o) => o.value).sort();
    expect(enGenderValues).toEqual(jaGenderValues);

    // Concern values should match
    const enConcernValues = en.general.concernOptions.map((o) => o.value).sort();
    const jaConcernValues = ja.general.concernOptions.map((o) => o.value).sort();
    expect(enConcernValues).toEqual(jaConcernValues);
  });
});
