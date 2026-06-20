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
    // The translations expose each legal page under its own key
    // (privacy / terms / disclaimer), each shaped as { title, content }.
    const page = t(language)[pageType];

    return <LegalPage title={page.title} content={page.content} />;
  };

  Component.displayName = `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}Page`;
  return Component;
}

// Create and export individual page components
export const PrivacyPolicy = createLegalPageComponent('privacy');
export const TermsOfService = createLegalPageComponent('terms');
export const DisclaimerPage = createLegalPageComponent('disclaimer');
