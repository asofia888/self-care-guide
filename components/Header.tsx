import React from 'react';
import { BookOpenIcon, HelpCircleIcon } from './Icons';
import type { View } from '../types';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const ToggleButton = React.memo<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    isSmall?: boolean;
}> (({ isActive, onClick, children, isSmall = false }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1 rounded-full transition-colors duration-200 ${isSmall ? 'text-sm sm:text-xs' : 'text-base sm:text-sm'} ${
                isActive 
                ? 'bg-sky-600 text-white font-semibold shadow-sm' 
                : 'bg-transparent text-slate-600 hover:bg-slate-200/50 active:bg-slate-300'
            }`}
        >
            {children}
        </button>
    );
});
ToggleButton.displayName = 'ToggleButton';


const NavButton = React.memo<{
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    icon: React.ReactNode;
    label: string;
}> (({ view, activeView, onClick, icon, label }) => {
    const isActive = view === activeView;
    return (
        <button
            onClick={() => onClick(view)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-3 min-h-[44px] sm:min-h-[auto] sm:px-3 sm:py-2 rounded-lg text-base sm:text-sm transition-all duration-200 ${
                isActive
                    ? 'bg-sky-100 text-sky-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 active:bg-slate-200'
            }`}
        >
            {icon}
            {label}
        </button>
    );
});
NavButton.displayName = 'NavButton';


export const Header: React.FC = () => {
  const { 
    language, 
    handleLanguageChange, 
    activeView, 
    handleNavigate,
    fontSize,
    handleFontSizeChange 
  } = useAppContext();
  const translations = t(language).header;

  return (
    <header className="py-3 md:py-4 bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-20 no-print">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between flex-wrap gap-y-3">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 min-w-0">
               <img src="/logo.png" alt="Self-Care Guide for Wellness Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"/>
              <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-slate-800 truncate">
                  Self-Care Guide for Wellness
                  </h1>
                  <p className="text-xs text-sky-600 -mt-1 hidden sm:block">{translations.tagline}</p>
              </div>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-2" aria-label={translations.compendium}>
              <NavButton view="compendium" activeView={activeView} onClick={handleNavigate} icon={<BookOpenIcon className="w-5 h-5"/>} label={translations.compendium} />
              <NavButton view="manual" activeView={activeView} onClick={handleNavigate} icon={<HelpCircleIcon className="w-5 h-5"/>} label={translations.manual} />
          </nav>

          <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1 p-0.5 bg-slate-100/80 rounded-full border border-slate-200" role="group" aria-label={t(language).header.fontSize.label}>
                  <ToggleButton isActive={fontSize === 'standard'} onClick={() => handleFontSizeChange('standard')} isSmall>{translations.fontSize.standard}</ToggleButton>
                  <ToggleButton isActive={fontSize === 'large'} onClick={() => handleFontSizeChange('large')} isSmall>{translations.fontSize.large}</ToggleButton>
              </div>
              <div className="flex items-center space-x-1 p-0.5 bg-slate-100/80 rounded-full border border-slate-200" role="group" aria-label={t(language).header.tagline}>
                  <ToggleButton isActive={language === 'ja'} onClick={() => handleLanguageChange('ja')}>JA</ToggleButton>
                  <ToggleButton isActive={language === 'en'} onClick={() => handleLanguageChange('en')}>EN</ToggleButton>
              </div>
          </div>
        </div>
      </div>
       <nav className="md:hidden container mx-auto px-4 mt-3" aria-label={translations.compendium}>
             <div className="flex items-center justify-center gap-2 p-1 bg-slate-100/50 rounded-lg">
                <NavButton view="compendium" activeView={activeView} onClick={handleNavigate} icon={<BookOpenIcon className="w-5 h-5"/>} label={translations.compendium} />
                <NavButton view="manual" activeView={activeView} onClick={handleNavigate} icon={<HelpCircleIcon className="w-5 h-5"/>} label={translations.manual} />
            </div>
        </nav>
    </header>
  );
};