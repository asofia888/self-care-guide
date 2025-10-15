import React, { useState, useEffect } from 'react';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

export const LoadingSpinner: React.FC = React.memo(() => {
  const { language } = useAppContext();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center my-12 text-sky-700 no-print" role="status">
      {/* Animated herb/medicine icon */}
      <div className="relative w-24 h-24 mb-6">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-sky-200 rounded-full animate-spin"
             style={{ animationDuration: '3s', borderTopColor: 'rgb(14 165 233)' }}></div>

        {/* Middle pulsing ring */}
        <div className="absolute inset-2 border-4 border-emerald-200 rounded-full animate-ping"
             style={{ animationDuration: '2s' }}></div>

        {/* Inner spinning reverse */}
        <div className="absolute inset-4 border-4 border-transparent border-r-sky-500 rounded-full animate-spin"
             style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Loading"
            className="w-12 h-12 object-contain animate-pulse"
          />
        </div>
      </div>

      {/* Loading text with animated dots */}
      <div className="text-center space-y-2">
        <p className="text-xl font-bold text-slate-800">
          {t(language).loadingSpinner.message}
          <span className="inline-block w-8 text-left text-sky-600">{dots}</span>
        </p>
        <p className="text-sm text-slate-500 animate-pulse">
          {language === 'ja' ? '最適な情報を検索しています' : 'Searching for the best information'}
        </p>
      </div>

      {/* Progress bar animation */}
      <div className="w-64 h-1.5 bg-slate-200 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 rounded-full animate-pulse"
             style={{
               animation: 'shimmer 2s ease-in-out infinite',
               backgroundSize: '200% 100%'
             }}>
        </div>
      </div>

      <span className="sr-only">{t(language).loadingSpinner.message}</span>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
});
LoadingSpinner.displayName = "LoadingSpinner";