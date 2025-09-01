import { describe, it, expect } from 'vitest';
import { t } from './i18n';

describe('i18n Translation System', () => {
  it('returns English translations for "en" language', () => {
    const translations = t('en');
    
    expect(translations.header.tagline).toBeDefined();
    expect(translations.header.compendium).toBeDefined();
    expect(translations.header.manual).toBeDefined();
    expect(typeof translations.header.tagline).toBe('string');
  });

  it('returns Japanese translations for "ja" language', () => {
    const translations = t('ja');
    
    expect(translations.header.tagline).toBeDefined();
    expect(translations.header.compendium).toBeDefined();
    expect(translations.header.manual).toBeDefined();
    expect(typeof translations.header.tagline).toBe('string');
  });

  it('has consistent structure between languages', () => {
    const enTranslations = t('en');
    const jaTranslations = t('ja');
    
    // Check that both have the same top-level keys
    expect(Object.keys(enTranslations)).toEqual(Object.keys(jaTranslations));
    
    // Check header structure
    expect(Object.keys(enTranslations.header)).toEqual(Object.keys(jaTranslations.header));
    
    // Check compendium structure
    expect(Object.keys(enTranslations.compendium)).toEqual(Object.keys(jaTranslations.compendium));
    
    // Check error structure
    expect(Object.keys(enTranslations.error)).toEqual(Object.keys(jaTranslations.error));
  });

  it('provides complete header translations', () => {
    const en = t('en').header;
    const ja = t('ja').header;
    
    // Required header fields
    const requiredFields = [
      'tagline',
      'compendium', 
      'manual',
      'fontSize'
    ];
    
    requiredFields.forEach(field => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
    });
    
    // Font size sub-fields
    expect(en.fontSize.label).toBeDefined();
    expect(en.fontSize.standard).toBeDefined();
    expect(en.fontSize.large).toBeDefined();
    expect(ja.fontSize.label).toBeDefined();
    expect(ja.fontSize.standard).toBeDefined();
    expect(ja.fontSize.large).toBeDefined();
  });

  it('provides complete compendium translations', () => {
    const en = t('en').compendium;
    const ja = t('ja').compendium;
    
    const requiredFields = [
      'title',
      'description',
      'searchLabel',
      'searchPlaceholder',
      'searchButton',
      'searching',
      'noResults',
      'print'
    ];
    
    requiredFields.forEach(field => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
      expect(typeof en[field as keyof typeof en]).toBe('string');
      expect(typeof ja[field as keyof typeof ja]).toBe('string');
    });
  });

  it('provides complete error translations', () => {
    const en = t('en').error;
    const ja = t('ja').error;
    
    const requiredFields = [
      'unexpected',
      'networkError', 
      'apiError'
    ];
    
    requiredFields.forEach(field => {
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
    
    // Check mode-specific translations
    expect(en.professional).toBeDefined();
    expect(en.general).toBeDefined();
    expect(ja.professional).toBeDefined();
    expect(ja.general).toBeDefined();
  });

  it('provides analysis display translations', () => {
    const en = t('en').analysisDisplay;
    const ja = t('ja').analysisDisplay;
    
    expect(en).toBeDefined();
    expect(ja).toBeDefined();
    
    // Check for essential fields
    expect(en.print).toBeDefined();
    expect(ja.print).toBeDefined();
  });

  it('provides footer translations', () => {
    const en = t('en').footer;
    const ja = t('ja').footer;
    
    const requiredFields = [
      'privacy',
      'terms', 
      'disclaimerLink',
      'navigationLabel'
    ];
    
    requiredFields.forEach(field => {
      expect(en[field as keyof typeof en]).toBeDefined();
      expect(ja[field as keyof typeof ja]).toBeDefined();
    });
  });

  it('returns fallback for invalid language codes', () => {
    // Should not throw error for invalid language
    expect(() => t('fr' as any)).not.toThrow();
    
    // Should return English as fallback
    const fallback = t('fr' as any);
    const english = t('en');
    expect(fallback).toEqual(english);
  });

  it('has non-empty translation strings', () => {
    const en = t('en');
    const ja = t('ja');
    
    // Recursively check all string values are non-empty
    function checkNonEmpty(obj: any, path = ''): void {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
          expect(value.trim()).not.toBe('');
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
    function findPlaceholders(obj: any, lang: string): string[] {
      const placeholders: string[] = [];
      
      function traverse(current: any, path = ''): void {
        Object.entries(current).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string' && value.includes('{')) {
            const matches = value.match(/\{[^}]+\}/g);
            if (matches) {
              placeholders.push(`${currentPath}: ${matches.join(', ')}`);
            }
          } else if (typeof value === 'object' && value !== null) {
            traverse(value, currentPath);
          }
        });
      }
      
      traverse(obj);
      return placeholders;
    }
    
    const enPlaceholders = findPlaceholders(en, 'en');
    const jaPlaceholders = findPlaceholders(ja, 'ja');
    
    // Should have same number of placeholders
    expect(enPlaceholders.length).toBe(jaPlaceholders.length);
    
    // Each placeholder should exist in both languages
    enPlaceholders.forEach(placeholder => {
      const key = placeholder.split(':')[0];
      const jaEquivalent = jaPlaceholders.find(jp => jp.startsWith(key));
      expect(jaEquivalent).toBeDefined();
    });
  });
});