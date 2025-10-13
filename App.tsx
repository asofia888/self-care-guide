import React, { useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Compendium } from './components/Compendium';
import { MedicalDisclaimerBanner } from './components/MedicalDisclaimerBanner';
import { useAppContext } from './contexts/AppContext';
import { t } from './i18n';

// --- Lazy Load Pages ---
const InstructionManual = lazy(() => import('./components/InstructionManual'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const DisclaimerPage = lazy(() => import('./components/DisclaimerPage'));

const App: React.FC = () => {
  const {
    language,
    activeView,
    handleNavigate,
    fontSize,
  } = useAppContext();

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
    switch(activeView) {
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
  }

  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {renderActiveView()}
          </Suspense>
        </div>
      </main>
      <MedicalDisclaimerBanner />
      <footer className="text-center p-4 text-slate-500 text-sm mt-8 no-print">
        <nav aria-label={t(language).footer.navigationLabel}>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-2">
              <button onClick={() => handleNavigate('privacy')} className="px-2 py-1 min-h-[44px] sm:min-h-[auto] hover:text-sky-600 hover:underline active:text-sky-700 transition-colors">{t(language).footer.privacy}</button>
              <span className="opacity-50 hidden sm:inline">|</span>
              <button onClick={() => handleNavigate('terms')} className="px-2 py-1 min-h-[44px] sm:min-h-[auto] hover:text-sky-600 hover:underline active:text-sky-700 transition-colors">{t(language).footer.terms}</button>
              <span className="opacity-50 hidden sm:inline">|</span>
              <button onClick={() => handleNavigate('disclaimer')} className="px-2 py-1 min-h-[44px] sm:min-h-[auto] hover:text-sky-600 hover:underline active:text-sky-700 transition-colors">{t(language).footer.disclaimerLink}</button>
          </div>
        </nav>
        <p>Self-Care Guide for Wellness</p>
      </footer>
    </div>
  );
};

export default App;