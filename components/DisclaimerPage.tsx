import React from 'react';
import { LegalPage } from './LegalPage';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const DisclaimerPage: React.FC = () => {
  const { language } = useAppContext();
  const translations = t(language).legal;
  return (
    <LegalPage
      title={translations.disclaimerTitle}
      content={translations.disclaimerContent}
    />
  );
};

export default DisclaimerPage;