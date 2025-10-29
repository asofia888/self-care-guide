import React from 'react';
import { LegalPage } from '../LegalPage';
import { t } from '../../i18n';
import { useAppContext } from '../../contexts/AppContext';
import type { LegalPageType } from '../../types';

/**
 * Factory function that creates legal page components
 * Eliminates code duplication across PrivacyPolicy, TermsOfService, and DisclaimerPage
 */
export function createLegalPageComponent(pageType: LegalPageType) {
  const Component: React.FC = () => {
    const { language } = useAppContext();
    const translations = t(language).legal;

    // Map page types to their corresponding translation keys
    const titleKey = `${pageType}Title` as const;
    const contentKey = `${pageType}Content` as const;

    return (
      <LegalPage
        title={translations[titleKey] as string}
        content={translations[contentKey] as string}
      />
    );
  };

  Component.displayName = `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}Page`;
  return Component;
}

// Create and export individual page components
export const PrivacyPolicy = createLegalPageComponent('privacy');
export const TermsOfService = createLegalPageComponent('terms');
export const DisclaimerPage = createLegalPageComponent('disclaimer');
