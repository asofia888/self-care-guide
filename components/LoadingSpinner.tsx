import React, { useState, useEffect } from 'react';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

export const LoadingSpinner: React.FC = React.memo(() => {
  const { language } = useAppContext();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="no-print my-16 flex flex-col items-center justify-center text-stone-600"
      role="status"
    >
      <div className="relative flex h-44 w-44 items-center justify-center">
        {/* Calm, pond-like ripples */}
        <span className="absolute h-24 w-24 animate-ripple rounded-full border border-champagne-300/60" />
        <span
          className="absolute h-24 w-24 animate-ripple rounded-full border border-sage-300/50"
          style={{ animationDelay: '1s' }}
        />
        <span
          className="absolute h-24 w-24 animate-ripple rounded-full border border-champagne-200/70"
          style={{ animationDelay: '2s' }}
        />

        {/* Slow, weightless rotating rings */}
        <span className="absolute h-32 w-32 animate-spin-slow rounded-full border border-cream-200/50 border-t-champagne-400/70" />
        <span className="absolute h-[8.75rem] w-[8.75rem] animate-spin-reverse-slow rounded-full border border-transparent border-b-sage-300/60" />

        {/* Soft glow */}
        <span className="absolute h-24 w-24 animate-breathe rounded-full bg-champagne-200/30 blur-2xl" />

        {/* Breathing center orb with the brand logo */}
        <span className="relative flex h-[4.5rem] w-[4.5rem] animate-breathe items-center justify-center rounded-full bg-white/90 shadow-glow ring-1 ring-champagne-200/50">
          <img src="/logo.png" alt="" aria-hidden="true" className="h-10 w-10 object-contain" />
        </span>
      </div>

      <div className="mt-9 text-center">
        <p className="font-display text-2xl tracking-wide text-stone-700">
          {t(language).loadingSpinner.message}
          <span className="inline-block w-6 text-left text-champagne-500">{dots}</span>
        </p>
        <p className="mt-2.5 animate-pulse-soft text-[11px] uppercase tracking-[0.3em] text-champagne-500/90">
          {language === 'ja' ? '最適な情報を検索しています' : 'Searching for the best information'}
        </p>
      </div>

      <span className="sr-only">{t(language).loadingSpinner.message}</span>
    </div>
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';
