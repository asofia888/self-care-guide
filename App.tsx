import React, { useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Compendium } from './components/Compendium';
import { useAppContext } from './contexts/AppContext';
import { t } from './i18n';

// --- Lazy Load Pages ---
const InstructionManual = lazy(() => import('./components/InstructionManual'));
const PrivacyPolicy = lazy(() =>
  import('./components/legal').then((m) => ({
    default: m.PrivacyPolicy,
  }))
);
const TermsOfService = lazy(() =>
  import('./components/legal').then((m) => ({
    default: m.TermsOfService,
  }))
);
const DisclaimerPage = lazy(() =>
  import('./components/legal').then((m) => ({
    default: m.DisclaimerPage,
  }))
);

const App: React.FC = () => {
  const { language, activeView, handleNavigate, fontSize } = useAppContext();

  useEffect(() => {
    // Adjust the root font size based on user preference
    // This will scale all rem-based units in Tailwind CSS
    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : '16px';

    // Cleanup function to reset the style when the component unmounts
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'compendium':
        return <Compendium />;
      case 'manual':
        return <InstructionManual />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'disclaimer':
        return <DisclaimerPage />;
      default:
        return <Compendium />;
    }
  };

  const footerLink =
    'px-3 py-1 min-h-[44px] sm:min-h-[auto] text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-champagne-600 active:text-champagne-700 transition-colors duration-300';

  return (
    <div className="min-h-screen flex flex-col text-stone-700">
      <Header />
      <main className="container mx-auto px-5 py-10 md:px-8 md:py-16 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<LoadingSpinner />}>{renderActiveView()}</Suspense>
        </div>
      </main>
      <footer className="no-print mt-16 border-t border-cream-200/80 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto px-5 py-9 text-center">
          <nav aria-label={t(language).footer.navigationLabel}>
            <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-1 mb-5">
              <button onClick={() => handleNavigate('privacy')} className={footerLink}>
                {t(language).footer.privacy}
              </button>
              <span className="text-cream-300 hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <button onClick={() => handleNavigate('terms')} className={footerLink}>
                {t(language).footer.terms}
              </button>
              <span className="text-cream-300 hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <button onClick={() => handleNavigate('disclaimer')} className={footerLink}>
                {t(language).footer.disclaimerLink}
              </button>
            </div>
          </nav>
          <p className="font-display text-lg italic tracking-wide text-stone-500">
            Self-Care Guide for Wellness
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-champagne-500/80">
            Integrative Wellness
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
