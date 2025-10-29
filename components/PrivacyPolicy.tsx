import React from 'react';
import { LegalPage } from './LegalPage';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const PrivacyPolicy: React.FC = () => {
  const { language } = useAppContext();
  const translations = t(language).legal;
  return <LegalPage title={translations.privacyTitle} content={translations.privacyContent} />;
};

export default PrivacyPolicy;
