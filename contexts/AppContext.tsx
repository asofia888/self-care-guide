import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { t } from '../i18n';
import type {
    Language,
    View,
    FontSize,
    AnalysisResult,
    AnalysisMode,
    AnyUserProfile
} from '../types';
import { analyzeUserData } from '../services/geminiService';
import { formatErrorMessage, logError } from '../utils/errorHandler';

interface AppState {
  language: Language;
  activeView: View;
  fontSize: FontSize;
  analysisResult: AnalysisResult | null;
  streamingContent: string;
  isLoading: boolean;
  error: string | null;
}

export interface AppContextType extends AppState {
  handleLanguageChange: (lang: Language) => void;
  handleNavigate: (view: View) => void;
  handleFontSizeChange: (size: FontSize) => void;
  handleAnalysis: (mode: AnalysisMode, profile: AnyUserProfile) => Promise<void>;
  clearError: () => void;
  viewCompendiumItem: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');
  const [activeView, setActiveView] = useState<View>('compendium');
  const [fontSize, setFontSize] = useState<FontSize>('standard');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const clearError = useCallback(() => setError(null), []);

  const handleAnalysis = useCallback(async (mode: AnalysisMode, profile: AnyUserProfile) => {
    console.log("Starting analysis with:", { mode, profile });
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setStreamingContent('');

    try {
      setStreamingContent(t(language).streaming.title);

      const result = await analyzeUserData(mode, profile, language);

      setAnalysisResult(result);
      setStreamingContent('');

    } catch (err) {
      // Log error for monitoring
      logError('AppContext.handleAnalysis', err);

      // Format error message for user display
      const errorMessage = formatErrorMessage(err, language);
      setError(errorMessage);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  }, [language]);
  
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
    analysisResult,
    streamingContent,
    isLoading,
    error,
    handleLanguageChange,
    handleNavigate,
    handleFontSizeChange,
    handleAnalysis,
    clearError,
    viewCompendiumItem,
  }), [
    language, activeView, fontSize, analysisResult, streamingContent, isLoading, error,
    handleLanguageChange, handleNavigate, handleFontSizeChange, handleAnalysis, clearError,
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