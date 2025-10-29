import React from 'react';
import { LegalPage } from './LegalPage';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const TermsOfService: React.FC = () => {
  const { language } = useAppContext();
  const translations = t(language).legal;
  return <LegalPage title={translations.termsTitle} content={translations.termsContent} />;
};

export default TermsOfService;
