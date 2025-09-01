import React from 'react';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

export const LoadingSpinner: React.FC = React.memo(() => {
  const { language } = useAppContext();
  return (
    <div className="flex flex-col items-center justify-center my-12 text-sky-700 no-print" role="status">
      <div className="relative flex h-16 w-16">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-16 w-16 bg-sky-500"></span>
      </div>
      <p className="mt-4 text-lg font-semibold animate-pulse">{t(language).loadingSpinner.message}</p>
      <span className="sr-only">{t(language).loadingSpinner.message}</span>
    </div>
  );
});
LoadingSpinner.displayName = "LoadingSpinner";