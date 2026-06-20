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
    <div
      className="no-print my-6 flex animate-fade-in-up items-center justify-between rounded-2xl border border-rose-200/70 bg-rose-50/60 px-5 py-4 shadow-soft"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 text-rose-400" />
        <span className="text-sm text-rose-700/90">{message}</span>
      </div>
      <button
        onClick={onClear}
        className="ml-4 rounded-full p-1.5 text-rose-400 transition-colors duration-300 hover:bg-rose-100 hover:text-rose-600"
        aria-label={t(language).error.dismissErrorLabel}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
});
ErrorDisplay.displayName = 'ErrorDisplay';
