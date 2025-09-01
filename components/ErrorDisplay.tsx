import React from 'react';
import { AlertTriangleIcon } from './Icons';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

interface ErrorDisplayProps {
  message: string;
  onClear: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = React.memo(({ message, onClear }) => {
  const { language } = useAppContext();
  if (!message) return null;

  return (
    <div className="my-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-r-lg shadow-md flex items-center justify-between animate-fade-in no-print" role="alert">
      <div className="flex items-center">
        <AlertTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
        <span className="text-sm">{message}</span>
      </div>
      <button 
        onClick={onClear} 
        className="ml-4 p-1 rounded-full text-red-800 hover:bg-red-200 transition-colors"
        aria-label={t(language).error.dismissErrorLabel}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
});
ErrorDisplay.displayName = 'ErrorDisplay';