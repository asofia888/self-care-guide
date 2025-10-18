import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import type {
    Language,
    View,
    FontSize
} from '../types';

interface AppState {
  language: Language;
  activeView: View;
  fontSize: FontSize;
}

export interface AppContextType extends AppState {
  handleLanguageChange: (lang: Language) => void;
  handleNavigate: (view: View) => void;
  handleFontSizeChange: (size: FontSize) => void;
  viewCompendiumItem: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');
  const [activeView, setActiveView] = useState<View>('compendium');
  const [fontSize, setFontSize] = useState<FontSize>('standard');

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const handleFontSizeChange = useCallback((size: FontSize) => {
    setFontSize(size);
  }, []);

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view);
    window.scrollTo(0, 0);
  }, []);

  const viewCompendiumItem = useCallback((query: string) => {
    // This implementation navigates to the compendium. A more advanced
    // implementation might pass the query to the Compendium component to auto-search.
    setActiveView('compendium');
    window.scrollTo(0, 0);
    console.log(`Navigate to Compendium to search for: ${query}`);
  }, []);


  const value: AppContextType = useMemo(() => ({
    language,
    activeView,
    fontSize,
    handleLanguageChange,
    handleNavigate,
    handleFontSizeChange,
    viewCompendiumItem,
  }), [
    language, activeView, fontSize,
    handleLanguageChange, handleNavigate, handleFontSizeChange,
    viewCompendiumItem
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};