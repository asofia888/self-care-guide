import React from 'react';
import { IntegrativeMedicineIcon, HelpCircleIcon } from './Icons';
import type { View } from '../types';
import { t } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const ToggleButton = React.memo<{
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isSmall?: boolean;
}>(({ isActive, onClick, children, isSmall = false }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 min-h-[44px] sm:min-h-[auto] sm:py-1.5 rounded-full uppercase transition-all duration-300 ${
        isSmall ? 'text-[11px] tracking-wider' : 'text-xs tracking-[0.12em]'
      } ${
        isActive
          ? 'bg-gradient-to-r from-champagne-400 to-champagne-500 text-white shadow-soft'
          : 'text-stone-500 hover:text-champagne-600'
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
}>(({ view, activeView, onClick, icon, label }) => {
  const isActive = view === activeView;
  return (
    <button
      onClick={() => onClick(view)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={`group flex items-center gap-2.5 px-4 py-3 min-h-[44px] sm:min-h-[auto] sm:py-2 rounded-full text-sm tracking-wide transition-all duration-300 ${
        isActive
          ? 'bg-white text-champagne-700 shadow-soft'
          : 'text-stone-500 hover:text-champagne-600 hover:bg-white/60'
      }`}
    >
      <span
        className={
          isActive
            ? 'text-champagne-500'
            : 'text-stone-400 transition-colors group-hover:text-champagne-500'
        }
      >
        {icon}
      </span>
      <span>{label}</span>
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
    handleFontSizeChange,
  } = useAppContext();
  const translations = t(language);
  const headerTranslations = translations.header;
  const navTranslations = translations.nav;

  return (
    <header className="sticky top-0 z-20 no-print border-b border-cream-200/70 bg-cream-50/70 backdrop-blur-xl">
      <div className="container mx-auto px-5 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3 py-3.5 md:py-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-cream-200 sm:h-12 sm:w-12">
              <img
                src="/logo.png"
                alt="Self-Care Guide for Wellness Logo"
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-medium leading-none tracking-wide text-stone-800 sm:text-2xl md:text-[1.7rem]">
                Self-Care Guide for Wellness
              </h1>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-champagne-600 sm:text-[11px]">
                {headerTranslations.tagline}
              </p>
            </div>
          </div>

          <nav
            className="hidden items-center gap-1.5 rounded-full bg-cream-100/60 p-1 md:flex"
            aria-label="Main navigation"
          >
            <NavButton
              view="compendium"
              activeView={activeView}
              onClick={handleNavigate}
              icon={<IntegrativeMedicineIcon className="h-5 w-5" />}
              label={navTranslations.compendium}
            />
            <NavButton
              view="manual"
              activeView={activeView}
              onClick={handleNavigate}
              icon={<HelpCircleIcon className="h-5 w-5" />}
              label={navTranslations.manual}
            />
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2">
            <div
              className="flex items-center gap-0.5 rounded-full bg-cream-100/70 p-0.5 ring-1 ring-cream-200/70"
              role="group"
              aria-label={headerTranslations.fontSize.label}
            >
              <ToggleButton
                isActive={fontSize === 'standard'}
                onClick={() => handleFontSizeChange('standard')}
                isSmall
              >
                {headerTranslations.fontSize.standard}
              </ToggleButton>
              <ToggleButton
                isActive={fontSize === 'large'}
                onClick={() => handleFontSizeChange('large')}
                isSmall
              >
                {headerTranslations.fontSize.large}
              </ToggleButton>
            </div>
            <div
              className="flex items-center gap-0.5 rounded-full bg-cream-100/70 p-0.5 ring-1 ring-cream-200/70"
              role="group"
              aria-label="Language selection"
            >
              <ToggleButton isActive={language === 'ja'} onClick={() => handleLanguageChange('ja')}>
                JA
              </ToggleButton>
              <ToggleButton isActive={language === 'en'} onClick={() => handleLanguageChange('en')}>
                EN
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>
      <nav className="container mx-auto px-5 pb-3 md:hidden" aria-label="Mobile navigation">
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-cream-100/60 p-1">
          <NavButton
            view="compendium"
            activeView={activeView}
            onClick={handleNavigate}
            icon={<IntegrativeMedicineIcon className="h-5 w-5" />}
            label={navTranslations.compendium}
          />
          <NavButton
            view="manual"
            activeView={activeView}
            onClick={handleNavigate}
            icon={<HelpCircleIcon className="h-5 w-5" />}
            label={navTranslations.manual}
          />
        </div>
      </nav>
    </header>
  );
};
